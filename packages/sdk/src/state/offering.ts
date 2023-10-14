import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts, type IdlTypes } from "@coral-xyz/anchor";
import { type Pendulum } from "../idl/pendulum";
import type BN from "bn.js";

/** Class representing a deserialized on-chain `Offering` account. */
export class OfferingAccount {
  private constructor(
    public readonly address: PublicKey,
    public readonly authority: PublicKey,
    public readonly initialShares: number,
    public readonly boughtShares: number,
    public readonly buyIns: number,
    public readonly paymentMint: PublicKey,
    public readonly paymentsTokenAccount: PublicKey,
    public readonly pricePerShare: BN,
    public readonly state: IdlTypes<Pendulum>["OfferingState"],
    public readonly title: string,
    public readonly symbol: string,
    public readonly nftUri: string
  ) {}

  /** Create a new instance from an anchor-deserialized account. */
  public static fromIdlAccount(
    account: IdlAccounts<Pendulum>["offering"],
    address: PublicKey
  ): OfferingAccount {
    return new OfferingAccount(
      address,
      account.authority,
      account.initialShares,
      account.boughtShares,
      account.buyIns,
      account.paymentMint,
      account.paymentsTokenAccount,
      account.pricePerShare,
      account.state,
      account.title,
      account.symbol,
      account.nftUri
    );
  }

  /** Pretty print. */
  public pretty(): {
    address: string;
    authority: string;
    initialShares: number;
    boughtShares: number;
    buyIns: number;
    paymentMint: string;
    paymentsTokenAccount: string;
    pricePerShare: string;
    title: string;
    symbol: string;
    nftUri: string;
  } {
    return {
      address: this.address.toBase58(),
      authority: this.authority.toBase58(),
      initialShares: this.initialShares,
      boughtShares: this.boughtShares,
      buyIns: this.buyIns,
      paymentMint: this.paymentMint.toBase58(),
      paymentsTokenAccount: this.paymentsTokenAccount.toBase58(),
      pricePerShare: this.pricePerShare.toString(),
      title: this.title,
      symbol: this.symbol,
      nftUri: this.nftUri,
    };
  }
}
