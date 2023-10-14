use crate::instruction::CalculateMultisigVaultTransaction;
use crate::PendulumError;
use crate::{seeds::*, state::*};

use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::InstructionData;
use anchor_spl::token::{Mint, Token, TokenAccount};

use clockwork_sdk::state::Trigger;

use multisig::cpi::accounts::MultisigCreate;
use multisig::cpi::multisig_create;
use multisig::{Member, MultisigCreateArgs, Permissions};

/// todo: Consider changing in future. Default to 3 for now.
const DEFAULT_EPHEMERAL_SIGNERS: u8 = 3;

#[derive(Accounts)]
pub struct InitDistribution<'info> {
    #[account(
        mut,
        has_one = authority,
        has_one = payments_token_account,
        constraint = offering.state == OfferingState::BuyInEnded @ PendulumError::PurchaseRoundNotEnded
    )]
    pub offering: Account<'info, Offering>,
    /// CHECK: The offering vault that holds payment.
    pub payments_token_account: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = Distribution::SPACE,
        seeds = [DISTRIBUTION_PREFIX, offering.key().as_ref()],
        bump
    )]
    pub distribution: Account<'info, Distribution>,
    #[account(
        init,
        payer = payer,
        token::mint = distribution_mint,
        token::authority = distribution,
    )]
    pub distribution_token_account: Account<'info, TokenAccount>,
    pub distribution_mint: Account<'info, Mint>,

    /// ~SQUADS-PROTOCOL-CPI-ACCOUNTS~
    ///
    /// CHECK: Newly created in CPI to SquadsV4
    pub multisig: UncheckedAccount<'info>,
    /// CHECK: Checked in CPI to SquadsV4
    pub multisig_vault: UncheckedAccount<'info>,
    /// CHECK: Checked in CPI to SquadsV4
    pub multisig_vault_token_account: UncheckedAccount<'info>,
    /// CHECK: Newly created in CPI to SquadsV4
    pub proposal: UncheckedAccount<'info>,
    /// CHECK: Newly created in CPI to SquadsV4
    pub vault_transaction: UncheckedAccount<'info>,
    pub ephemeral_create_key: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: SquadsV4 program ID.
    #[account(address = multisig::ID)]
    pub squads_program: UncheckedAccount<'info>,

    /// ~CLOCKWORK-CPI-ACCOUNTS~
    #[account(mut)]
    /// CHECK: Initialized in handler
    pub clockwork_multisig_thread: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Initialized in handler
    pub clockwork_disburse_thread: UncheckedAccount<'info>,
    /// CHECK: Verified clockwork program address
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_thread_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<InitDistribution>,
    frequency_in_seconds: u64,
    multisig_threshold: u16,
    initial_multisig_members: Vec<Pubkey>,
    // amount to initially assign to the distribution PDA for use in funding
    // the threads it creates.
    distribution_deposit_lamports: u64,
    // amount to directly deposit to the thread.
    thread_deposit_lamports: u64,
) -> Result<()> {
    // Start with closing out the round
    ctx.accounts.offering.state = OfferingState::DistributionActive;

    // 1. ~Create Squads Multisig~
    let cpi_ctx = CpiContext::new(
        ctx.accounts.squads_program.to_account_info(),
        MultisigCreate {
            multisig: ctx.accounts.multisig.to_account_info(),
            create_key: ctx.accounts.ephemeral_create_key.to_account_info(),
            creator: ctx.accounts.authority.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
    );

    let mut members = initial_multisig_members
        .into_iter()
        .map(|key| Member {
            key,
            permissions: Permissions { mask: 10 }, // members can only vote
        })
        .collect::<Vec<_>>();
    // Make the distribution PDA a member so it can permissionlessly create & execute proposals.
    members.push(Member {
        key: ctx.accounts.distribution.key(),
        // This PDA can initiate & execute but not vote.
        permissions: Permissions { mask: 101 },
    });

    let multisig_create_args = MultisigCreateArgs {
        config_authority: Some(ctx.accounts.distribution.key()),
        threshold: multisig_threshold,
        members,
        time_lock: 0,
        memo: None,
    };
    multisig_create(cpi_ctx, multisig_create_args)?;

    let distribution = Distribution {
        start_timestamp: Clock::default().unix_timestamp,
        clockwork_thread: ctx.accounts.clockwork_multisig_thread.key(),
        offering: ctx.accounts.offering.key(),
        multisig: ctx.accounts.multisig.key(),
        multisig_vault_index: 1,
        token_mint: ctx.accounts.distribution_mint.key(),
        frequency_in_seconds,
        round_index: 0,
        distribution_token_account: ctx.accounts.distribution_token_account.key(),
    };
    ctx.accounts.distribution.set_inner(distribution);

    // 2. ~TODO: Transfer round tokens to the multisig vault token account~

    // 3. ~Fund the distribution account~
    let initial_payer_balance = ctx.accounts.payer.lamports();
    **ctx.accounts.payer.try_borrow_mut_lamports().unwrap() = initial_payer_balance
        .checked_sub(distribution_deposit_lamports)
        .unwrap();
    let initial_distribution_balance = ctx.accounts.distribution.to_account_info().lamports();
    **ctx
        .accounts
        .distribution
        .to_account_info()
        .try_borrow_mut_lamports()
        .unwrap() = initial_distribution_balance
        .checked_add(distribution_deposit_lamports)
        .unwrap();

    // 4. ~Setup a clockwork thread to regularly propose vault-transactions~
    let clockwork_assigned_instruction = Instruction {
        program_id: crate::ID,
        accounts: vec![
            AccountMeta::new_readonly(ctx.accounts.multisig.key(), false),
            AccountMeta::new_readonly(ctx.accounts.distribution.key(), false),
        ],
        data: CalculateMultisigVaultTransaction {}.data(),
    };
    let offering_key = ctx.accounts.offering.key();
    let distribution_seeds = &[
        b"distribution",
        offering_key.as_ref(),
        &[*ctx.bumps.get("distribution").unwrap()],
    ];
    let cpi_signer = &[&distribution_seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.clockwork_thread_program.to_account_info(),
        clockwork_sdk::cpi::ThreadCreate {
            authority: ctx.accounts.distribution.to_account_info(),
            payer: ctx.accounts.payer.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            thread: ctx.accounts.clockwork_multisig_thread.to_account_info(),
        },
        cpi_signer,
    );
    // Todo: Shorten ID.
    let clockwork_id = format!("propose-multisig-spending:_{}", offering_key);
    clockwork_sdk::cpi::thread_create(
        cpi_ctx,
        thread_deposit_lamports,
        clockwork_id.as_bytes().to_owned(), // TODO: Add unique identifier for the offering.
        vec![clockwork_assigned_instruction.into()],
        Trigger::Cron {
            schedule: "".to_string(),
            skippable: false,
        }, // TODO: Determine correct cron format
    )?;

    Ok(())
}
