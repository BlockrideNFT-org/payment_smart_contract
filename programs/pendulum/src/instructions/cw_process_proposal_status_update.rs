use crate::state::*;

use anchor_lang::prelude::*;
use clockwork_sdk::state::ThreadResponse;
use multisig::{ Proposal, ProposalStatus };

// It doesn't need to take in the functions needed to initiate transfer.
// It creates a new thread irrespective of whether or not time has elapsed.
// the only difference is Trigger::Now vs Trigger::Timestamp
#[derive(Accounts)]
pub struct ProcessProposalStatusUpdate<'info> {
    pub offering: Account<'info, Offering>,
    pub distribution: Account<'info, Distribution>,
    /// CHECK: TODO!
    pub multisig: UncheckedAccount<'info>,
    pub proposal: Account<'info, Proposal>,
}

pub fn handler(ctx: Context<ProcessProposalStatusUpdate>) -> Result<ThreadResponse> {
    // The logic we tell clockwork to execute when the proposal status changes.
    // Either return a dynamic instruction(to immediately transfer), or just
    // update the trigger to be based on timestamp and schedule the transfer instruction.
    // NOTE THAT PROPOSAL STATUS CAN CHANGE MULTIPLE TIMES. SO CHECK THAT IT'S APPROVED
    // BEFORE ACTUALLY EXECUTING.

    match ctx.accounts.proposal.status {
        ProposalStatus::Approved { timestamp } => {
            let time_now = Clock::get().unwrap().unix_timestamp;

            Ok(ThreadResponse::default())
        }
        _ => Ok(ThreadResponse::default()),
    }
}
