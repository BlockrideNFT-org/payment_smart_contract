import {
  type AnchorProvider,
  type IdlAccounts,
  Program,
  utils,
} from "@coral-xyz/anchor";
import {
  type ConfirmOptions,
  type GetProgramAccountsFilter,
  Keypair,
  type PublicKey,
  type Signer,
  Transaction,
} from "@solana/web3.js";
import { type Pendulum, IDL } from "./idl/pendulum";
import { DEVNET_PROGRAM_ID } from "./constants";
import type BN from "bn.js";
import {
  initializeOffering,
  updateOffering,
  purchaseShares,
} from "./instructions";
import { BuyInAccount, OfferingAccount } from "./state";

export class PendulumClient {
  readonly program: Program<Pendulum>;

  private constructor(
    readonly provider: AnchorProvider,
    programId?: PublicKey
  ) {
    const pid = programId ?? DEVNET_PROGRAM_ID;
    this.program = new Program<Pendulum>(IDL, pid, provider);
  }

  /** Initialize a new offering */
  public async initializeOffering(
    offeringAuthority: PublicKey,
    paymentMint: PublicKey,
    initialShares: number,
    pricePerShare: BN,
    title: string,
    symbol: string,
    nftUri: string
  ): Promise<Transaction> {
    const offering = Keypair.generate();

    const initInstruction = await initializeOffering(
      this.program,
      offeringAuthority,
      paymentMint,
      initialShares,
      pricePerShare,
      title,
      symbol,
      nftUri,
      this.provider.publicKey,
      offering
    );

    return new Transaction().add(initInstruction);
  }

  /** Update meta-information about an offering. */
  public async updateOffering(
    offering: PublicKey,
    newTitle: string | null,
    newSymbol: string | null,
    newUri: string | null
  ): Promise<Transaction> {
    const updateInstruction = await updateOffering(
      this.program,
      this.provider.publicKey,
      offering,
      newTitle,
      newSymbol,
      newUri
    );

    return new Transaction().add(updateInstruction);
  }

  /** Purchase a share. Ownership of the purchase belongs to the public key of the
   *  `Beneficiary` argument */
  public async purchaseShares(
    offering: PublicKey,
    beneficiary: PublicKey,
    sharesToPurchase: number,
    buyerTokenAccount: PublicKey | null
  ): Promise<Transaction> {
    const newMint = Keypair.generate();

    const offeringAccount = await this.program.account.offering.fetch(offering);

    const buyerToken =
      buyerTokenAccount ??
      utils.token.associatedAddress({
        mint: offeringAccount.paymentMint,
        owner: this.provider.publicKey,
      });

    const purchaseInstruction = await purchaseShares(
      this.program,
      this.provider.publicKey,
      buyerToken,
      offering,
      beneficiary,
      sharesToPurchase,
      newMint,
      offeringAccount.buyIns + 1,
      offeringAccount.paymentsTokenAccount
    );

    return new Transaction().add(purchaseInstruction);
  }

  public async sendAndConfirmTransaction(
    transaction: Transaction,
    signers?: Signer[],
    opts?: ConfirmOptions
  ): Promise<string> {
    return this.provider
      .sendAndConfirm(transaction, signers, opts)
      .catch((e) => {
        throw e;
      });
  }

  async fetchOfferings(
    memcmp?: Buffer | GetProgramAccountsFilter[]
  ): Promise<OfferingAccount[]> {
    const offerings = await this.program.account.offering.all();
    return offerings.map((offering) =>
      OfferingAccount.fromIdlAccount(offering.account, offering.publicKey)
    );
  }

  async fetchBuyIns(
    memcmp?: Buffer | GetProgramAccountsFilter[]
  ): Promise<BuyInAccount[]> {
    const buyIns = await this.program.account.buyIn.all();
    return buyIns.map((buyIn) =>
      BuyInAccount.fromIdlAccount(buyIn.account, buyIn.publicKey)
    );
  }

  public async fetchAllOfferings(): Promise<OfferingAccount[]> {
    return this.fetchOfferings(undefined);
  }

  public async fetchAllBuyIns(): Promise<
    Array<IdlAccounts<Pendulum>["buyIn"]>
  > {
    return this.fetchBuyIns(undefined);
  }

  /** Get all the share purchases for a particular offering */
  public async fetchBuyInsForOffering(
    offering: PublicKey
  ): Promise<BuyInAccount[]> {
    return this.fetchBuyIns([
      {
        memcmp: {
          offset: 8,
          bytes: offering.toBase58(),
        },
      },
    ]);
  }

  /** Get all the active purchases for a particular wallet */
  public async fetchBuyInsForBeneficiary(
    beneficiary: PublicKey
  ): Promise<BuyInAccount[]> {
    return this.fetchBuyIns([
      {
        memcmp: {
          offset: 8 + 32 + 2 + 2 + 8,
          bytes: beneficiary.toBase58(),
        },
      },
    ]);
  }
}
