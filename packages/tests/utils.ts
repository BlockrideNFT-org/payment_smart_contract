import {
  type Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createMint,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  mintToChecked,
} from "@solana/spl-token";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import fs from "fs";
import { type PendulumClient } from "../sdk/src";

const KEYPAIR_PATH = process.cwd() + "/packages/tests/fixtures/provider.json";
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const initializeTestMint = async (
  client: PendulumClient
): Promise<{
  mint: PublicKey;
  authority: Keypair;
}> => {
  const mint = Keypair.generate();
  const mintAuthority = Keypair.generate();
  await airdropTo(client, mintAuthority.publicKey, 1);
  const mintAddress = await createMint(
    client.provider.connection,
    mintAuthority,
    mintAuthority.publicKey,
    mintAuthority.publicKey,
    0,
    mint
  );
  return {
    mint: mintAddress,
    authority: mintAuthority,
  };
};

export const airdropTo = async (
  client: PendulumClient,
  account: PublicKey,
  amount: number
): Promise<string> => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: client.provider.publicKey,
      toPubkey: account,
      lamports: amount * 1_000_000_000,
    })
  );
  return client.sendAndConfirmTransaction(transaction);
};

export const mintToAccount = async (
  client: PendulumClient,
  mint: PublicKey,
  authority: Keypair,
  to: PublicKey,
  amount: number
): Promise<void> => {
  await mintToChecked(
    client.provider.connection,
    authority,
    mint,
    to,
    authority,
    amount * 1,
    0
  );
};

export const createTokenAccount = async (
  client: PendulumClient,
  owner: PublicKey,
  mint: PublicKey
): Promise<PublicKey> => {
  const tokenAccount = getAssociatedTokenAddressSync(mint, owner);
  const tx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      client.provider.publicKey,
      tokenAccount,
      owner,
      mint
    )
  );
  await client.sendAndConfirmTransaction(tx);

  return tokenAccount;
};

export const initMetaplex = (connection: Connection): Metaplex => {
  const walletString = fs.readFileSync(KEYPAIR_PATH, { encoding: "utf8" });
  const secretKey = Buffer.from(JSON.parse(walletString));
  const keypair = Keypair.fromSecretKey(secretKey);

  return Metaplex.make(connection).use(keypairIdentity(keypair));
};

export const initTestCollectionNft = async (
  metaplex: Metaplex,
  uri: string,
  name: string
): Promise<Keypair> => {
  const mint = Keypair.generate();

  await metaplex.nfts().create({
    uri,
    name,
    sellerFeeBasisPoints: 100,
    useNewMint: mint,
    isCollection: true,
  });

  return mint;
};

export const fetchMetadataAccount = async (
  client: PendulumClient,
  mint: PublicKey
): Promise<Metadata> => {
  const metadataPDA = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
  const account = await client.provider.connection.getAccountInfo(metadataPDA);
  if (account == null) {
    throw new Error("Expected metadata account, got null");
  }
  return Metadata.fromAccountInfo(account)[0];
};
