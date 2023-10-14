use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::Instruction,
    program::{invoke, invoke_signed},
    system_instruction,
    sysvar::rent::Rent,
};
use anchor_spl::token;
use mpl_token_metadata::instruction::{create_master_edition_v3, create_metadata_accounts_v3};

pub fn create_mint<'a>(
    payer: &AccountInfo<'a>,
    mint: &AccountInfo<'a>,
    mint_authority: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    rent_sysvar: &AccountInfo<'a>,
) -> Result<()> {
    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(token::Mint::LEN);
    invoke(
        &system_instruction::create_account(
            payer.key,
            mint.key,
            lamports,
            token::Mint::LEN as u64,
            token_program.key,
        ),
        &[
            payer.clone(),
            mint.clone(),
            system_program.to_account_info().clone(),
        ],
    )?;

    let accounts = token::InitializeMint {
        mint: mint.clone(),
        rent: rent_sysvar.clone(),
    };
    let cpi_ctx = CpiContext::new(token_program.to_account_info(), accounts);
    token::initialize_mint(cpi_ctx, 0, mint_authority.key, Some(mint_authority.key))
}

pub fn mint_token<'a>(
    mint: &AccountInfo<'a>,
    token_account: &AccountInfo<'a>,
    mint_authority: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    signature: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let mint_to = token::MintTo {
        mint: mint.to_account_info(),
        to: token_account.to_account_info(),
        authority: mint_authority.to_account_info(),
    };

    let cpi_ctx = if let Some(seeds) = signature {
        CpiContext::new_with_signer(token_program.to_account_info(), mint_to, seeds)
    } else {
        CpiContext::new(token_program.to_account_info(), mint_to)
    };

    token::mint_to(cpi_ctx, 1)?;
    Ok(())
}

pub fn transfer_tokens<'a>(
    amount: u64,
    from: AccountInfo<'a>,
    to: AccountInfo<'a>,
    authority: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
) -> Result<()> {
    let cpi_ctx = CpiContext::new(
        token_program,
        anchor_spl::token::Transfer {
            from,
            to,
            authority,
        },
    );
    anchor_spl::token::transfer(cpi_ctx, amount)?;
    Ok(())
}

pub fn create_token_account<'a>(
    payer: &AccountInfo<'a>,
    token_account: &AccountInfo<'a>,
    token_account_owner: &AccountInfo<'a>,
    mint: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    associated_token_program: &AccountInfo<'a>,
) -> Result<()> {
    anchor_spl::associated_token::create(CpiContext::new(
        associated_token_program.to_account_info(),
        anchor_spl::associated_token::Create {
            payer: payer.to_account_info(),
            associated_token: token_account.to_account_info(),
            authority: token_account_owner.to_account_info(),
            mint: mint.to_account_info(),
            system_program: system_program.to_account_info(),
            token_program: token_program.to_account_info(),
        },
    ))?;

    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn create_metadata_account<'a>(
    name: &str,
    symbol: &str,
    uri: &str,
    metadata_account: &AccountInfo<'a>,
    mint: &AccountInfo<'a>,
    mint_authority: &AccountInfo<'a>,
    payer: &AccountInfo<'a>,
    update_authority: &AccountInfo<'a>,
    creator: &Option<Pubkey>,
    collection_mint: &Option<Pubkey>,
    token_metadata_program: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    rent: &AccountInfo<'a>,
    signature: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let creators = creator.map(|key| {
        vec![mpl_token_metadata::state::Creator {
            address: key,
            verified: true,
            share: 100,
        }]
    });
    let collection = collection_mint.map(|key| mpl_token_metadata::state::Collection {
        verified: false,
        key,
    });

    let instruction = create_metadata_accounts_v3(
        token_metadata_program.key(),
        metadata_account.key(),
        mint.key(),
        mint_authority.key(),
        payer.key(),
        update_authority.key(),
        name.into(),
        symbol.into(),
        uri.into(),
        creators,
        1,
        true,
        true,
        collection,
        None,
        None,
    );
    let accounts = [
        metadata_account.clone(),
        mint.clone(),
        mint_authority.clone(),
        payer.clone(),
        update_authority.clone(),
        system_program.to_account_info().clone(),
        rent.clone(),
    ];

    invoke_maybe_signed(&instruction, &accounts, signature)
}

#[allow(clippy::too_many_arguments)]
pub fn create_master_edition_account<'a>(
    master_edition: &AccountInfo<'a>,
    mint: &AccountInfo<'a>,
    payer: &AccountInfo<'a>,
    metadata: &AccountInfo<'a>,
    mint_authority: &AccountInfo<'a>,
    metadata_update_authority: &AccountInfo<'a>,
    token_metadata_program: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    rent: &AccountInfo<'a>,
    signature: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let instruction = create_master_edition_v3(
        token_metadata_program.key(),
        master_edition.key(),
        mint.key(),
        metadata_update_authority.key(),
        mint_authority.key(),
        metadata.key(),
        payer.key(),
        Some(0),
    );
    let accounts = [
        metadata_update_authority.clone(),
        master_edition.clone(),
        mint.clone(),
        payer.clone(),
        metadata.clone(),
        system_program.to_account_info(),
        rent.clone(),
    ];

    invoke_maybe_signed(&instruction, &accounts, signature)
}

fn invoke_maybe_signed(
    ix: &Instruction,
    accounts: &[AccountInfo],
    signature: Option<&[&[&[u8]]]>,
) -> Result<()> {
    if let Some(seeds) = signature {
        invoke_signed(ix, accounts, seeds)?;
    } else {
        invoke(ix, accounts)?;
    }
    Ok(())
}
