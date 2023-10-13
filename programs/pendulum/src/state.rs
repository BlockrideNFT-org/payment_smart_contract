use anchor_lang::prelude::*;

#[account]
/// Represents the acquisition round for some instrument.
pub struct Offering {
    /// The pubkey of the account that's in charge of this offering.
    pub authority: Pubkey,
    /// The number of shares offered at creation.
    pub initial_shares: u16,
    /// The number of shares already purchased.
    pub bought_shares: u16,
    /// The number of unique purchases of shares of this offering.
    pub buy_ins: u16,
    /// The token used for payment.
    pub payment_mint: Pubkey,
    /// The token account payment tokens are sent to.
    pub payment_receipt_token_account: Pubkey,
    /// The cost(token amount) of a single share.
    pub price_per_share: u64,
    /// Whether or not this offering is open for buy-in.
    pub open: bool,
}

impl Offering {
    pub const SPACE: usize = 8 + 32 + 2 + 2 + 8 + 32 + 32 + 8;
}

#[account]
/// Information used in scheduling payments of profits to purchasers
/// of an offering.
pub struct Distribution {
    /// Start time
    pub start_timestamp: i64,
    /// The squads multisig.
    pub multisig: Pubkey,
    /// The index of the multisig vault.
    pub multisig_vault_index: u8,
    /// The clockwork-thread that starts proposals.
    pub clockwork_thread: Pubkey,
    /// The offering this distribution is for.
    pub offering: Pubkey,
    /// The mint of tokens being received and distributed.
    pub token_mint: Pubkey,
    /// How frequently(in seconds) payment should be distributed.
    pub frequency_in_seconds: u64,
    /// The index of the most recent distribution round. Also used
    /// as a seed for the next `DistributionRound` PDA, and as
    /// an indicator of how many rounds of distribution have taken
    /// place in the past.
    pub round_index: u16,
    // The account that receives earnings from the multisig vault and
    // disburses it to shareholders.
    pub distribution_token_account: Pubkey,
}

impl Distribution {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 2;
}

#[account]
pub struct DistributionRound {
    pub inner: Option<DistributionRoundInner>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct DistributionRoundInner {
    /// The thread in charge of tracking and executing this round's proposal.
    pub clockwork_thread: Pubkey,
    /// The multisig proposal this round is dependent on.
    pub proposal: Pubkey,
    /// The timestamp beyond which its okay to start distributing
    pub end_timestamp: i64,
    /// What round of distribution is this? Also used in seeding PDAs
    /// of this account.
    pub index: u16,
    /// The distribution this account is derived from.
    pub distribution: Pubkey,
    /// The status of this distribution round.
    pub status: RoundStatus,
    /// The amount this round has paid out.
    pub paid_out: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum RoundStatus {
    WaitingForProposal,
    ProposalApproved,
    ProposalExecuted { earnings: u64 },
    FullyDisbursed,
}

impl DistributionRound {
    pub const SPACE: usize = 100;
}

#[account]
/// Represents ownership of the shares in an [Offering].
pub struct BuyIn {
    /// The offering bought from.
    pub offering: Pubkey,
    /// The index of this buy-in in relation to the offering,
    /// also used its deriving its address.
    pub index: u16,
    /// The number of shares bought.
    pub shares: u16,
    /// The time this purchase was made.
    pub timestamp: i64,
    /// The wallet that's entitled to receive earnings.
    pub beneficiary: Pubkey,
}

impl BuyIn {
    pub const SPACE: usize = 8 + 8 + 2 + 32 + 8 + 32;
}
