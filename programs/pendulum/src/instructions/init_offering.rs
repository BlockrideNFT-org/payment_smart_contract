use crate::{state::*, utils};

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token};

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
    /// CHECK: Initialized in handler.
    #[account(mut)]
    pub payments_token_account: UncheckedAccount<'info>,
    pub payment_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(
    ctx: Context<InitOffering>,
    authority: Pubkey,
    initial_shares: u16,
    price_per_share: u64,
    title: String,
    symbol: String,
    nft_uri: String,
) -> Result<()> {
    // Create the token account for receiving payments owned by the offering.
    utils::create_token_account(
        &ctx.accounts.initiator,
        &ctx.accounts.payments_token_account,
        &ctx.accounts.offering.to_account_info(),
        &ctx.accounts.payment_mint.to_account_info(),
        &ctx.accounts.system_program,
        &ctx.accounts.token_program,
        &ctx.accounts.associated_token_program,
    )?;

    let offering = Offering {
        authority,
        initial_shares,
        bought_shares: 0,
        buy_ins: 0,
        payment_mint: ctx.accounts.payment_mint.key(),
        payments_token_account: ctx.accounts.payments_token_account.key(),
        price_per_share,
        state: OfferingState::BuyInActive,
        title,
        symbol,
        nft_uri,
    };

    offering.validate()?;
    ctx.accounts.offering.set_inner(offering);
    Ok(())
}
