use crate::state::*;

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateOffering<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority,
        constraint = offering.state != OfferingState::DistributionActive
    )]
    pub offering: Account<'info, Offering>,
}

pub fn handler(
    ctx: Context<UpdateOffering>,
    new_title: Option<String>,
    new_symbol: Option<String>,
    new_nft_uri: Option<String>,
) -> Result<()> {
    let offering = &mut ctx.accounts.offering;
    if let Some(title) = new_title {
        offering.title = title;
    }
    if let Some(symbol) = new_symbol {
        offering.symbol = symbol;
    }
    if let Some(uri) = new_nft_uri {
        offering.nft_uri = uri;
    }
    offering.validate()?;

    Ok(())
}
