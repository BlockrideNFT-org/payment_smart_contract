use crate::{state::*, PendulumError};
use anchor_lang::prelude::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
pub struct PurchaseShares<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Checked via CPI to spl-token::transfer
    pub buyer_payment_from: UncheckedAccount<'info>,

    #[account(
        mut,
        has_one = payment_receipt_token_account,
        constraint = offering.open @ PendulumError::PurchaseRoundEnded
    )]
    pub offering: Account<'info, Offering>,
    #[account(
        init,
        space = BuyIn::SPACE,
        payer = buyer,
        seeds = [
            b"buy-in", 
            offering.key().as_ref(),
            &(offering.buy_ins.checked_add(1).unwrap() as u64).to_le_bytes()
        ],
        bump
    )]
    pub buy_in: Account<'info, BuyIn>,
    #[account(mut)]
    /// CHECK: Checked with `has_one` constraint on offering account.
    pub payment_receipt_token_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<PurchaseShares>, shares: u16, beneficiary: Pubkey) -> Result<()> {
    let offering = &mut ctx.accounts.offering;
    let available_shares = offering
        .initial_shares
        .checked_sub(offering.bought_shares)
        .unwrap();
    require!(
        shares <= available_shares,
        PendulumError::BuyInExceededLimit
    );

    let index = offering.buy_ins.checked_add(1).unwrap();
    offering.bought_shares = offering.bought_shares.checked_add(shares).unwrap();
    offering.buy_ins = index;

    let buy_in = BuyIn {
        offering: offering.key(),
        index,
        shares,
        timestamp: Clock::default().unix_timestamp,
        beneficiary,
    };
    ctx.accounts.buy_in.set_inner(buy_in);

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        anchor_spl::token::Transfer {
            from: ctx.accounts.buyer_payment_from.to_account_info(),
            to: ctx.accounts.payment_receipt_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        },
    );
    let payment_amount = (shares as u64)
        .checked_mul(offering.price_per_share)
        .unwrap();
    anchor_spl::token::transfer(cpi_ctx, payment_amount)?;

    Ok(())
}
