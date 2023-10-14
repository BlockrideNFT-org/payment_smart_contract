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
  initialShares: number,
  pricePerShare: BN,
  title: string,
  symbol: string,
  nftUri: string,
  initiator: PublicKey,
  offering: Keypair
): Promise<TransactionInstruction> => {
  const paymentsTokenAccount = utils.token.associatedAddress({
    mint: paymentMint,
    owner: offering.publicKey,
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
      offering: offering.publicKey,
      paymentsTokenAccount,
      paymentMint,
    })
    .signers([offering])
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
  nftMint: Keypair,
  nextBuyInIndex: number,
  paymentsTokenAccount: PublicKey
): Promise<TransactionInstruction> => {
  const buyIn = deriveBuyInAddress(offering, new BN(nextBuyInIndex))[0];

  const nftMetadata = deriveMplMetadataAddress(nftMint.publicKey);
  const nftMasterEdition = deriveMplMasterEditionAddress(nftMint.publicKey);

  const beneficiaryTokenAccount = utils.token.associatedAddress({
    mint: nftMint.publicKey,
    owner: beneficiary,
  });

  return program.methods
    .purchaseShares(shares, beneficiary)
    .accounts({
      buyer,
      buyerTokenAccount,
      offering,
      buyIn,
      paymentsTokenAccount,
      nftMint: nftMint.publicKey,
      nftMetadata,
      nftMasterEdition,
      beneficiaryAccount: beneficiary,
      beneficiaryTokenAccount,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .signers([nftMint])
    .instruction();
};
