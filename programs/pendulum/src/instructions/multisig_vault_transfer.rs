use crate::{state::*, PendulumError};

use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};

use multisig::state::{SEED_PREFIX, SEED_VAULT};

#[derive(Accounts)]
pub struct MultisigVaultTransfer<'info> {
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
    #[account(address = distribution.multisig)]
    /// CHECK: Valid multisig for distribution
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
    pub multisig_vault: UncheckedAccount<'info>,
    #[account(
        mut,
        token::authority = multisig_vault,
        constraint = multisig_vault_token_account.mint == distribution.token_mint
    )]
    pub multisig_vault_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

// The instruction that is queued for execution in Squads.
pub fn handler(ctx: Context<MultisigVaultTransfer>) -> Result<()> {
    let distribution = &mut ctx.accounts.distribution;
    distribution.round_index = distribution.round_index.checked_add(1).unwrap();

    let token_account = &mut ctx.accounts.multisig_vault_token_account;
    token_account.reload()?;
    let amount_to_transfer = token_account.amount;

    let distribution_round = &mut ctx.accounts.distribution_round;
    match distribution_round.inner {
        Some(ref mut inner) => {
            inner.status = RoundStatus::ProposalExecuted {
                earnings: amount_to_transfer,
            };
        }
        None => {
            panic!("cannot execute a multisig vault transfer for a non-existent round")
        }
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: token_account.to_account_info(),
            to: ctx.accounts.distribution_token_account.to_account_info(),
            authority: ctx.accounts.multisig_vault.to_account_info(),
        },
    );
    anchor_spl::token::transfer(cpi_ctx, amount_to_transfer)?;

    Ok(())
}
