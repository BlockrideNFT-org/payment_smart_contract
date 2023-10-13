use crate::state::*;

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

#[derive(Accounts)]
pub struct InitOffering<'info> {
    #[account(mut)]
    pub initiator: Signer<'info>,
    #[account(
        init,
        space = Offering::SPACE,
        payer = initiator
    )]
    pub offering: Account<'info, Offering>,
    #[account(token::mint = payment_mint)]
    pub payment_token_account: Account<'info, TokenAccount>,
    pub payment_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitOffering>,
    authority: Pubkey,
    initial_shares: u16,
    price_per_share: u64,
) -> Result<()> {
    let offering = Offering {
        authority,
        initial_shares,
        bought_shares: 0,
        buy_ins: 0,
        payment_mint: ctx.accounts.payment_mint.key(),
        payment_receipt_token_account: ctx.accounts.payment_token_account.key(),
        price_per_share,
        open: true,
    };

    ctx.accounts.offering.set_inner(offering);
    Ok(())
}
