use crate::{state::*, PendulumError};

use anchor_lang::prelude::*;
use anchor_spl::token::{ Token, TokenAccount };

use multisig::cpi::accounts::VaultTransactionExecute;
use multisig::cpi::vault_transaction_execute;
use multisig::state::{SEED_PREFIX, SEED_VAULT};

#[derive(Accounts)]
pub struct MultisigVaultTransactionExecute<'info> {
    #[account(
        mut,
        constraint = !offering.open @ PendulumError::PurchaseRoundNotEnded
    )]
    pub offering: Account<'info, Offering>,
    #[account(
        mut,
        seeds = [b"distribution", offering.key().as_ref()],
        bump
    )]
    pub distribution: Account<'info, Distribution>,
    #[account(
        seeds = [
            b"round", 
            distribution.key().as_ref(),
            &distribution.round_index.to_le_bytes()
        ],
        bump
    )]
    pub distribution_round: Account<'info, DistributionRound>,
    #[account(
        mut,
        address = distribution.distribution_token_account
    )]
    pub distribution_token_account: Account<'info, TokenAccount>,
    /// CHECK: Valid multisig for distribution
    #[account(address = distribution.multisig)]
    pub multisig: UncheckedAccount<'info>,
    /// CHECK: PDA seeds with the correct vault index.
    #[account(
        mut, // TODO: Keep multisig vault funded.
        seeds = [
            SEED_PREFIX,
            multisig.key().as_ref(),
            SEED_VAULT,
            &distribution.multisig_vault_index.to_le_bytes()
        ],
        bump,
        seeds::program = multisig::ID
    )]
    /// CHECK: Checked via seed constraints
    pub multisig_vault: UncheckedAccount<'info>,
    #[account(
        mut,
        token::authority = multisig_vault,
        constraint = multisig_vault_token_account.mint == distribution.token_mint
    )]
    pub multisig_vault_token_account: Account<'info, TokenAccount>,
    #[account(address = multisig::ID)]
    /// CHECK: Verified squadsV4 program
    pub squads_v4_program: UncheckedAccount<'info>,
    /// CHECK: TODO!
    pub proposal: UncheckedAccount<'info>,
    /// CHECK: TODO!
    pub vault_transaction: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    /// CHECK: ID of the currently executing program
    #[account(address = crate::ID)]
    pub this_program: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<MultisigVaultTransactionExecute>) -> Result<()> {
    // TODO: Keep track of a `last_payout` timestamp and make sure `frequency` days has passed
    // since then.
    let distribution_bump = *ctx.bumps.get("distribution").unwrap();
    let offering_key = ctx.accounts.offering.key();
    let distribution_seeds = &[b"distribution", offering_key.as_ref(), &[distribution_bump]];
    let cpi_seeds = &[&distribution_seeds[..]];
    let cpi_ctx = CpiContext::new(
        ctx.accounts.squads_v4_program.to_account_info(),
        VaultTransactionExecute {
            multisig: ctx.accounts.multisig.to_account_info(),
            proposal: ctx.accounts.proposal.to_account_info(),
            transaction: ctx.accounts.vault_transaction.to_account_info(),
            member: ctx.accounts.distribution.to_account_info(),
        },
    )
    .with_signer(cpi_seeds)
    .with_remaining_accounts(vec![
        ctx.accounts.this_program.to_account_info(),
        ctx.accounts.offering.to_account_info(),
        ctx.accounts.distribution.to_account_info(),
        ctx.accounts.distribution_round.to_account_info(),
        ctx.accounts.multisig.to_account_info(),
        ctx.accounts.multisig_vault.to_account_info(),
        ctx.accounts.multisig_vault_token_account.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
    ]);
    vault_transaction_execute(cpi_ctx)?;

    Ok(())
}
