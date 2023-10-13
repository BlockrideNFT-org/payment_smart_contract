use crate::instruction::KickoffMultisigVaultTransaction;
use crate::state::*;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::InstructionData;

use clockwork_sdk::state::ThreadResponse;
use clockwork_sdk::utils::PAYER_PUBKEY;

use multisig::state::{SEED_PREFIX, SEED_PROPOSAL, SEED_TRANSACTION};
use multisig::Multisig;

const CLOCKWORK_SEED_THREAD: &[u8] = b"thread";

#[derive(Accounts)]
pub struct CalculateMultisigVaultTransaction<'info> {
    /// CHECK: No state change in instruction.
    pub multisig: Account<'info, Multisig>,
    /// CHECK: No state change in instruction.
    pub distribution: Account<'info, Distribution>,
}

pub fn handler(ctx: Context<CalculateMultisigVaultTransaction>) -> Result<ThreadResponse> {
    let distribution = &ctx.accounts.distribution;
    let multisig = &ctx.accounts.multisig;

    let next_round_index = distribution.round_index.checked_add(1).unwrap();
    let distribution_key = distribution.key();
    let distribution_round_seeds = &[
        b"round",
        distribution_key.as_ref(),
        &next_round_index.to_le_bytes(),
    ];
    let (distribution_round_pda, _) =
        Pubkey::find_program_address(distribution_round_seeds, &crate::ID);

    let next_transaction_index = multisig.transaction_index.checked_add(1).unwrap();
    let multisig_key = multisig.key();
    let vault_transaction_seeds = &[
        SEED_PREFIX,
        multisig_key.as_ref(),
        SEED_TRANSACTION,
        &next_transaction_index.to_le_bytes(),
    ];
    let (vault_transaction, _) =
        Pubkey::find_program_address(vault_transaction_seeds, &multisig::ID);
    let proposal_seeds = &[
        SEED_PREFIX,
        multisig_key.as_ref(),
        SEED_TRANSACTION,
        &next_transaction_index.to_le_bytes(),
        SEED_PROPOSAL,
    ];
    let (proposal, _) = Pubkey::find_program_address(proposal_seeds, &multisig::ID);

    let clockwork_thread_id = format!("proposal-execution-{}", next_round_index);
    let thread_seeds = &[
        CLOCKWORK_SEED_THREAD,
        distribution_key.as_ref(),
        clockwork_thread_id.as_bytes(),
    ];
    let (clockwork_thread, _) = Pubkey::find_program_address(thread_seeds, &clockwork_sdk::ID);

    let kickoff_multisig_vault_transaction = Instruction {
        program_id: crate::ID,
        accounts: vec![
            AccountMeta::new(distribution.offering, false),
            AccountMeta::new(PAYER_PUBKEY, true),
            AccountMeta::new(distribution.key(), false), // should pda be marked as signer if signature is generated internally?
            AccountMeta::new(distribution.distribution_token_account, false),
            AccountMeta::new(distribution_round_pda, false),
            AccountMeta::new(distribution.multisig, false),
            AccountMeta::new(proposal, false),
            AccountMeta::new(vault_transaction, false),
            AccountMeta::new_readonly(multisig::ID, false),
            AccountMeta::new(clockwork_thread, false),
            AccountMeta::new_readonly(clockwork_sdk::ID, false),
            AccountMeta::new_readonly(anchor_lang::system_program::ID, false),
            AccountMeta::new_readonly(anchor_spl::token::ID, false),
        ],
        data: KickoffMultisigVaultTransaction {}.data(),
    };

    Ok(ThreadResponse {
        close_to: None,
        dynamic_instruction: Some(kickoff_multisig_vault_transaction.into()),
        trigger: None,
    })
}
