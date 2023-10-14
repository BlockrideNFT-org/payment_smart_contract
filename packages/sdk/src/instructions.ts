import { type Pendulum } from "./idl/pendulum";
import {
  type PublicKey,
  type Keypair,
  type TransactionInstruction,
} from "@solana/web3.js";
import { type Program, BN, utils } from "@coral-xyz/anchor";
import {
  deriveBuyInAddress,
  deriveMplMetadataAddress,
  deriveMplMasterEditionAddress,
} from "./utils";
import { TOKEN_METADATA_PROGRAM_ID } from "./constants";

export const initializeOffering = async (
  program: Program<Pendulum>,
  authority: PublicKey,
  paymentMint: PublicKey,
  offering: PublicKey,
  initialShares: number,
  pricePerShare: BN,
  title: string,
  symbol: string,
  nftUri: string,
  initiator: PublicKey
): Promise<TransactionInstruction> => {
  const paymentsTokenAccount = utils.token.associatedAddress({
    mint: paymentMint,
    owner: offering,
  });

  return program.methods
    .initNewOffering(
      authority,
      initialShares,
      pricePerShare,
      title,
      symbol,
      nftUri
    )
    .accounts({
      initiator,
      offering,
      paymentsTokenAccount,
      paymentMint,
    })
    .instruction();
};

export const updateOffering = async (
  program: Program<Pendulum>,
  authority: PublicKey,
  offering: PublicKey,
  newTitle: string | null,
  newSymbol: string | null,
  newNftUri: string | null
): Promise<TransactionInstruction> => {
  return program.methods
    .updateOffering(newTitle, newSymbol, newNftUri)
    .accounts({
      authority,
      offering,
    })
    .instruction();
};

export const purchaseShares = async (
  program: Program<Pendulum>,
  buyer: PublicKey,
  buyerTokenAccount: PublicKey,
  offering: PublicKey,
  beneficiary: PublicKey,
  shares: number,
  nftMint: PublicKey,
  nextBuyInIndex: number,
  paymentsTokenAccount: PublicKey
): Promise<{
  instruction: TransactionInstruction;
  buyInAddress: PublicKey;
  mintedNftTo: PublicKey;
}> => {
  const buyIn = deriveBuyInAddress(
    offering,
    new BN(nextBuyInIndex),
    program.programId
  )[0];

  const nftMetadata = deriveMplMetadataAddress(nftMint);
  const nftMasterEdition = deriveMplMasterEditionAddress(nftMint);

  const beneficiaryTokenAccount = utils.token.associatedAddress({
    mint: nftMint,
    owner: beneficiary,
  });

  let instruction = await program.methods
    .purchaseShares(shares, beneficiary)
    .accounts({
      buyer,
      buyerTokenAccount,
      offering,
      buyIn,
      paymentsTokenAccount,
      nftMint,
      nftMetadata,
      nftMasterEdition,
      beneficiaryAccount: beneficiary,
      beneficiaryTokenAccount,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction();

  return {
    instruction,
    buyInAddress: buyIn,
    mintedNftTo: beneficiaryTokenAccount,
  };
};
