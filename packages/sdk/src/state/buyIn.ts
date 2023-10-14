import { type PublicKey } from "@solana/web3.js";
import { type IdlAccounts } from "@coral-xyz/anchor";
import { type Pendulum } from "../idl/pendulum";
import type BN from "bn.js";

/** Class representing a deserialized on-chain `Offering` account. */
export class BuyInAccount {
  private constructor(
    public readonly address: PublicKey,
    public readonly offering: PublicKey,
    public readonly index: number,
    public readonly shares: number,
    public readonly timestamp: BN,
    public readonly beneficiary: PublicKey,
    public readonly tokenMint: PublicKey
  ) {}

  /** Create a new instance from an anchor-deserialized account. */
  public static fromIdlAccount(
    account: IdlAccounts<Pendulum>["buyIn"],
    address: PublicKey
  ): BuyInAccount {
    return new BuyInAccount(
      address,
      account.offering,
      account.index,
      account.shares,
      account.timestamp,
      account.beneficiary,
      account.tokenMint
    );
  }

  /** Pretty print. */
  public pretty(): {
    address: string;
    offering: string;
    index: number;
    shares: number;
    timestamp: string;
    beneficiary: string;
    tokenMint: string;
  } {
    return {
      address: this.address.toBase58(),
      offering: this.offering.toBase58(),
      index: this.index,
      shares: this.shares,
      timestamp: this.timestamp.toString(),
      beneficiary: this.beneficiary.toBase58(),
      tokenMint: this.tokenMint.toBase58(),
    };
  }
}
