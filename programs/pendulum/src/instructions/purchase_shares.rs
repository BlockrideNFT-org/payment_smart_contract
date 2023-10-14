use crate::{state::*, utils, PendulumError};

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::Token;

#[derive(Accounts)]
#[instruction(_shares: u16, beneficiary: Pubkey)]
pub struct PurchaseShares<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Checked via transfer CPI
    pub buyer_token_account: UncheckedAccount<'info>,

    #[account(
        mut,
        has_one = offering_payments_vault,
        constraint = offering.state == OfferingState::BuyInActive,
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
    pub offering_payments_vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub nft_mint: Signer<'info>,
    #[account(mut)]
    /// CHECK: Checked in Metaplex CPI.
    pub nft_metadata: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Checked in Metaplex CPI.
    pub nft_master_edition: UncheckedAccount<'info>,
    /// CHECK: Same beneficiary as in instruction data
    #[account(address = beneficiary)]
    pub beneficiary_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Initialized in handler as token account owned by `beneficiary`.
    pub beneficiary_token_account: UncheckedAccount<'info>,
    #[account(address = mpl_token_metadata::ID)]
    /// CHECK: mpl_token_metadata ID.
    pub token_metadata_program: UncheckedAccount<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(mut ctx: Context<PurchaseShares>, shares: u16, beneficiary: Pubkey) -> Result<()> {
    let accounts = &mut ctx.accounts;
    let available_shares = accounts
        .offering
        .initial_shares
        .checked_sub(accounts.offering.bought_shares)
        .unwrap();
    require!(
        shares <= available_shares,
        PendulumError::BuyInExceededLimit
    );

    let purchase_index = accounts.offering.buy_ins.checked_add(1).unwrap();
    accounts.offering.bought_shares = accounts.offering.bought_shares.checked_add(shares).unwrap();
    accounts.offering.buy_ins = purchase_index;

    let payment_amount = (shares as u64)
        .checked_mul(accounts.offering.price_per_share)
        .unwrap();
    utils::transfer_tokens(
        payment_amount,
        accounts.buyer_token_account.to_account_info(),
        accounts.offering_payments_vault.to_account_info(),
        accounts.buyer.to_account_info(),
        accounts.token_program.to_account_info(),
    )?;

    utils::create_mint(
        &accounts.buyer,
        &accounts.nft_mint,
        &accounts.buyer, // acts as mint authority temporarily
        &accounts.system_program,
        &accounts.token_program,
        &accounts.rent.to_account_info(),
    )?;

    utils::create_token_account(
        &accounts.buyer,
        &accounts.beneficiary_token_account,
        &accounts.beneficiary_account,
        &accounts.nft_mint,
        &accounts.system_program,
        &accounts.token_program,
        &accounts.associated_token_program,
    )?;

    utils::mint_token(
        &accounts.nft_mint,
        &accounts.beneficiary_token_account,
        &accounts.buyer,
        &accounts.token_program,
        None,
    )?;

    // Make `buy-in` account the update-authority.
    let update_authority = &accounts.buy_in;
    // Make `offering` account the creator.
    let creator = Some(accounts.offering.key());

    let metadata_name = format!("{}-{}", accounts.offering.title, purchase_index);
    let metadata_symbol = format!("{}-{}", accounts.offering.symbol, purchase_index);

    let bump = *ctx.bumps.get("buy_in").unwrap();
    let offering_key = accounts.offering.key();
    let seeds = &[
        b"buy-in",
        offering_key.as_ref(),
        &purchase_index.to_le_bytes(),
        &[bump],
    ];
    let buy_in_seeds = &[&seeds[..]];

    utils::create_metadata_account(
        &metadata_name,
        &metadata_symbol,
        &accounts.offering.nft_uri,
        &accounts.nft_metadata,
        &accounts.nft_mint,
        &accounts.buyer,
        &accounts.buyer,
        &update_authority.to_account_info(),
        &creator,
        &None,
        &accounts.token_metadata_program,
        &accounts.system_program,
        &accounts.rent.to_account_info(),
        Some(buy_in_seeds), // update authority(buy-in account) seeds
    )?;

    utils::create_master_edition_account(
        &accounts.nft_master_edition,
        &accounts.nft_mint,
        &accounts.buyer,
        &accounts.nft_metadata,
        &accounts.buyer,
        &update_authority.to_account_info(),
        &accounts.token_metadata_program,
        &accounts.system_program,
        &accounts.rent.to_account_info(),
        Some(buy_in_seeds),
    )?;

    let buy_in = BuyIn {
        offering: offering_key,
        index: purchase_index,
        shares,
        timestamp: Clock::default().unix_timestamp,
        beneficiary,
        token_mint: accounts.nft_mint.key(),
    };
    ctx.accounts.buy_in.set_inner(buy_in);

    Ok(())
}
