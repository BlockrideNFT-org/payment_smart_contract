import { PublicKey } from "@solana/web3.js";
import { DEVNET_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "./constants";
import type BN from "bn.js";

const enum Seeds {
  BUY_IN = "buy-in",
  DISTRIBUTION = "distribution",
  DISTRIBUTION_ROUND = "round",
}

export const deriveBuyInAddress = (
  offering: PublicKey,
  index: BN,
  programId: PublicKey
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(Seeds.BUY_IN), offering.toBuffer(), index.toBuffer("le", 8)],
    programId
  );
};

export const deriveDistributionAddress = (
  offering: PublicKey,
  programId: PublicKey
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(Seeds.DISTRIBUTION), offering.toBuffer()],
    programId
  );
};

export const deriveDistributionRoundAddress = (
  distribution: PublicKey,
  index: BN,
  programId: PublicKey
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(Seeds.DISTRIBUTION_ROUND),
      distribution.toBuffer(),
      index.toBuffer("le", 8),
    ],
    programId
  );
};

export const deriveMplMetadataAddress = (mint: PublicKey): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
};

export const deriveMplMasterEditionAddress = (mint: PublicKey): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
};
