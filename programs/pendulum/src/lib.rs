#![allow(unused_variables)]
#![allow(dead_code)]
#![allow(clippy::result_large_err)]

mod instructions;
mod state;

use anchor_lang::prelude::*;
use clockwork_sdk::state::ThreadResponse;
use instructions::*;

declare_id!("Ercwg63fCFawCuVrExYFFumXxyt4DVAHVpmjLPLCA2yB");

#[program]
pub mod pendulum {
    use super::*;

    pub fn init_new_offering(
        ctx: Context<InitOffering>,
        authority: Pubkey,
        initial_shares: u16,
        price_per_share: u64,
    ) -> Result<()> {
        init_offering::handler(ctx, authority, initial_shares, price_per_share)
    }

    pub fn purchase_shares(
        ctx: Context<PurchaseShares>,
        shares: u16,
        beneficiary: Pubkey,
    ) -> Result<()> {
        purchase_shares::handler(ctx, shares, beneficiary)
    }

    pub fn init_distribution(
        ctx: Context<InitDistribution>,
        frequency_in_seconds: u64,
        multisig_threshold: u16,
        initial_multisig_members: Vec<Pubkey>,
        distribution_deposit_lamports: u64,
        thread_deposit_lamports: u64,
    ) -> Result<()> {
        init_distribution::handler(
            ctx,
            frequency_in_seconds,
            multisig_threshold,
            initial_multisig_members,
            distribution_deposit_lamports,
            thread_deposit_lamports,
        )
    }

    pub fn calculate_multisig_vault_transaction(
        ctx: Context<CalculateMultisigVaultTransaction>,
    ) -> Result<ThreadResponse> {
        cw_calculate_multisig_vault_transaction::handler(ctx)
    }

    pub fn execute_vault_transaction(
        ctx: Context<ProcessProposalStatusUpdate>,
    ) -> Result<ThreadResponse> {
        cw_process_proposal_status_update::handler(ctx)
    }

    pub fn kickoff_multisig_vault_transaction(
        ctx: Context<KickoffMultisigVaultTransaction>,
    ) -> Result<ThreadResponse> {
        cw_kickoff_multisig_vault_transaction::handler(ctx)
    }

    pub fn multisig_vault_transfer(ctx: Context<MultisigVaultTransfer>) -> Result<()> {
        multisig_vault_transfer::handler(ctx)
    }

    pub fn execute_multisig_vault_transaction(
        ctx: Context<MultisigVaultTransactionExecute>,
    ) -> Result<()> {
        unimplemented!("WIP");
    }

    pub fn process_proposal_status_update(ctx: Context<ProcessProposalStatusUpdate>) -> Result<()> {
        unimplemented!("WIP")
    }
}

#[error_code]
pub enum PendulumError {
    #[msg("Attempted to purchase more than the available shares")]
    BuyInExceededLimit,
    #[msg("Offering is closed to purchases")]
    PurchaseRoundEnded,
    #[msg("Purchase round is still active")]
    PurchaseRoundNotEnded,
    #[msg("Tried to open a vault transaction prematurely")]
    PrematureProposalCreation,
}
