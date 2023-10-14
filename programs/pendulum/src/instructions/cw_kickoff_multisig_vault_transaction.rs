use crate::instruction::{ExecuteVaultTransaction, MultisigVaultTransfer};
use crate::{seeds::*, state::*, PendulumError};

use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::InstructionData;
use anchor_spl::associated_token::get_associated_token_address;
use anchor_spl::token::Token;

use clockwork_sdk::state::{ThreadResponse, Trigger};

use multisig::cpi::accounts::{ProposalCreate, VaultTransactionCreate};
use multisig::cpi::{proposal_create, vault_transaction_create};
use multisig::state::{SEED_PREFIX, SEED_VAULT};
use multisig::{
    CompiledInstruction, ProposalCreateArgs, TransactionMessage, VaultTransaction,
    VaultTransactionCreateArgs,
};

// todo!
pub const DEFAULT_EPHEMERAL_SIGNERS: u8 = 3;
pub const SECONDS_IN_DAYS: u64 = 60 * 60 * 24;

#[derive(Accounts)]
pub struct KickoffMultisigVaultTransaction<'info> {
    #[account(
        mut,
        constraint = offering.state == OfferingState::DistributionActive
    )]
    pub offering: Account<'info, Offering>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [DISTRIBUTION_PREFIX, offering.key().as_ref()],
        bump,
    )]
    pub distribution: Account<'info, Distribution>,
    #[account(
        init,
        payer = payer, //todo: should be clockwork payer
        space = DistributionRound::SPACE,
        seeds = [
            ROUND_PREFIX,
            distribution.key().as_ref(),
            &distribution.round_index.checked_add(1).unwrap().to_le_bytes()
        ],
        bump
    )]
    pub distribution_round: Account<'info, DistributionRound>,

    /// ~SQUADS-PROTOCOL-CPI-ACCOUNTS~
    ///
    /// CHECK: TODO!(Correct multisig for round)
    pub multisig: UncheckedAccount<'info>,
    /// CHECK: Newly created in CPI to SquadsV4
    pub proposal: UncheckedAccount<'info>,
    /// CHECK: Newly created in CPI to SquadsV4
    pub vault_transaction: UncheckedAccount<'info>,
    /// CHECK: SquadsV4 program ID.
    #[account(address = multisig::ID)]
    pub squads_program: UncheckedAccount<'info>,

    /// ~CLOCKWORK-CPI-ACCOUNTS~
    #[account(mut)]
    pub clockwork_thread: SystemAccount<'info>,
    /// CHECK: Clockwork program address
    #[account(address = clockwork_sdk::ID)]
    pub clockwork_thread_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

// 1. Schedule recurring transaction & proposal creation every `distribution frequency` days.
// 2. Spin up a thread to listen for proposal approval.
//       * If approved & frequency days has elapsed, immediately execute the proposal.
//       * If approved but frequency days has not elapsed, spin up another thread that
//        schedules proposal execution for the right period.
//

/// This is the transaction that will be run periodically by a clockwork thread.
/// It's a dynamic instruction and so won't be passed directly to the thread though. Instead a
/// `calculate` instruction that constructs it dynamically is what's scheduled.
pub fn handler(ctx: Context<KickoffMultisigVaultTransaction>) -> Result<ThreadResponse> {
    let distribution = &mut ctx.accounts.distribution;
    let previous_round_index = distribution.round_index;
    let new_round_index = previous_round_index.checked_add(1).unwrap();
    distribution.round_index = new_round_index;

    /*
    |----------------|-------------------|-------------------|
       round1             round2               round3
    start1       end1|start2          end2|start3           end3

    - We can't start a round before its start time.
    - We can't start a round after its end time.

    If a round misses its window, we forward multisig vault withdrawals
    to the next round.
    */

    let current_timestamp = Clock::get().unwrap().unix_timestamp;
    let new_round_start_time = distribution
        .start_timestamp
        .checked_add(
            (previous_round_index as i64)
                .checked_mul(distribution.frequency_in_seconds as i64)
                .unwrap(),
        )
        .unwrap();

    if current_timestamp < new_round_start_time {
        return Err(PendulumError::PrematureProposalCreation.into());
    }

    let new_round_end_time = new_round_start_time
        .checked_add(distribution.frequency_in_seconds as i64)
        .unwrap();

    if current_timestamp > new_round_end_time {
        // This would mean that the thread stopped working for some
        // reason.
        // This round is skipped and no funds are withdrawn/distributed
        // for its liable period.
        let new_round = DistributionRound { inner: None };
        ctx.accounts.distribution_round.set_inner(new_round);

        return Ok(ThreadResponse::default());
    }

    let new_round = DistributionRound {
        inner: Some(RoundInner {
            clockwork_thread: ctx.accounts.clockwork_thread.key(),
            proposal: ctx.accounts.proposal.key(),
            end_timestamp: new_round_end_time,
            index: new_round_index,
            distribution: ctx.accounts.distribution.key(),
            status: RoundStatus::WaitingForProposal,
            paid_out: 0,
        }),
    };
    ctx.accounts.distribution_round.set_inner(new_round);

    let multisig_key = &ctx.accounts.multisig.key();
    let multisig_vault_seeds = &[
        SEED_PREFIX,
        multisig_key.as_ref(),
        SEED_VAULT,
        &ctx.accounts.distribution.multisig_vault_index.to_le_bytes(),
    ];
    let (multisig_vault, _) = Pubkey::find_program_address(multisig_vault_seeds, &multisig::ID);
    let multisig_vault_token_account =
        get_associated_token_address(&multisig_vault, &ctx.accounts.distribution.token_mint);
    let account_metas = vec![
        AccountMeta::new(ctx.accounts.offering.key(), false), // 2
        AccountMeta::new(ctx.accounts.distribution.key(), false), // 3
        AccountMeta::new(ctx.accounts.distribution_round.key(), true), // 4
        AccountMeta::new(ctx.accounts.distribution.distribution_token_account, false), // 5
        AccountMeta::new(ctx.accounts.distribution.multisig, false), // 6
        AccountMeta::new(multisig_vault, true),               // 7
        AccountMeta::new(multisig_vault_token_account, false), // 8
        AccountMeta::new_readonly(anchor_lang::system_program::ID, false), // 9
        AccountMeta::new_readonly(anchor_spl::token::ID, false), // 10
    ];
    let multisig_vault_transfer_data = MultisigVaultTransfer {}.data();

    let multisig_vault_transfer_ix = Instruction {
        program_id: crate::ID,
        accounts: account_metas.clone(),
        data: MultisigVaultTransfer {}.data(),
    };

    let mut account_keys = vec![crate::ID]; // 1
    let rest_of_keys = account_metas
        .into_iter()
        .map(|meta| meta.pubkey)
        .collect::<Vec<_>>();
    account_keys.extend(rest_of_keys);

    let compiled_instruction = CompiledInstruction {
        program_id_index: 1,                                      //todo: cross-check!
        account_indexes: vec![2, 3, 4, 5, 6, 7, 8, 9, 10].into(), //todo: crosscheck!
        data: multisig_vault_transfer_data.into(),
    };

    let message = TransactionMessage {
        num_signers: 0,              //todo: crosscheck!
        num_writable_non_signers: 0, //todo: crosscheck!
        num_writable_signers: 0,     //todo: crosscheck!
        account_keys: account_keys.into(),
        instructions: vec![compiled_instruction].into(),
        address_table_lookups: vec![].into(), // empty.
    };
    let mut serialized_vault_transfer_message: Vec<u8> = vec![];
    message.serialize(&mut serialized_vault_transfer_message)?;

    let offering_key = ctx.accounts.offering.key();
    let distribution_seeds = &[
        b"distribution",
        offering_key.as_ref(),
        &[*ctx.bumps.get("distribution").unwrap()],
    ];
    let distribution_signer_seeds = &[&distribution_seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.squads_program.to_account_info(),
        VaultTransactionCreate {
            rent_payer: ctx.accounts.payer.to_account_info(),
            multisig: ctx.accounts.multisig.to_account_info(),
            transaction: ctx.accounts.vault_transaction.to_account_info(),
            creator: ctx.accounts.distribution.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
        distribution_signer_seeds,
    );
    let vault_tx_create_args = VaultTransactionCreateArgs {
        vault_index: ctx.accounts.distribution.multisig_vault_index,
        ephemeral_signers: DEFAULT_EPHEMERAL_SIGNERS,
        transaction_message: serialized_vault_transfer_message,
        memo: None,
    };
    vault_transaction_create(cpi_ctx, vault_tx_create_args)?;

    let account = ctx.accounts.vault_transaction.to_account_info();
    let vault_transaction = VaultTransaction::deserialize(&mut &**account.data.borrow())?;

    // Start a proposal to spend from the current vault index (1).
    // This is done beforehand. The actual spending is only done after `frequency` days.
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.squads_program.to_account_info(),
        ProposalCreate {
            rent_payer: ctx.accounts.payer.to_account_info(),
            multisig: ctx.accounts.multisig.to_account_info(),
            proposal: ctx.accounts.proposal.to_account_info(),
            creator: ctx.accounts.distribution.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
        distribution_signer_seeds,
    );
    // TODO: Make sure transaction index matches that above.
    let proposal_create_args = ProposalCreateArgs {
        transaction_index: vault_transaction.index,
        draft: false, // Set to active immediately
    };
    proposal_create(cpi_ctx, proposal_create_args)?;

    // ~Spin up a thread to handle proposal execution~.
    let on_proposal_change_instruction = Instruction {
        program_id: crate::ID,
        accounts: vec![],
        data: ExecuteVaultTransaction {}.data(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.clockwork_thread_program.to_account_info(),
        clockwork_sdk::cpi::ThreadCreate {
            authority: ctx.accounts.distribution.to_account_info(),
            // TODO!: needs to hold enough sol to fund these things
            payer: ctx.accounts.distribution.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            thread: ctx.accounts.clockwork_thread.to_account_info(),
        },
        distribution_signer_seeds,
    );

    clockwork_sdk::cpi::thread_create(
        cpi_ctx,
        10, //TODO! This determines the amount of lamports clockwork is going to transfer from payer to thread.
        format!("proposal-execution-{}", new_round_index)
            .as_bytes()
            .to_vec(), //TODO!: Make unique and descriptive
        vec![on_proposal_change_instruction.into()],
        //TODO!: Also check for changes on the proposal
        Trigger::Account {
            address: ctx.accounts.proposal.key(),
            offset: 8 + 32 + 8, // the proposal status
            size: 1 + 8,
        },
    )?;

    Ok(ThreadResponse::default())
}
