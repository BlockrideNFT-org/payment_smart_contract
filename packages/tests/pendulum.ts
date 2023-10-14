import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { PublicKey, Keypair } from "@solana/web3.js";
import { BuyInAccount, OfferingAccount, PendulumClient } from "../sdk/src";
import BN from "bn.js";
import * as utils from "./utils";

const LOCALNET_ADDRESS = new PublicKey(
  "Ercwg63fCFawCuVrExYFFumXxyt4DVAHVpmjLPLCA2yB"
);
const TEST_URI =
  "https://raw.githubusercontent.com/BlockrideNFT-org/BlockrideHackathonApp/packages/tests/fixtures/meta.json";

describe("soar", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  let client = PendulumClient.get(provider, LOCALNET_ADDRESS);

  let testMintAuthority: Keypair;
  let testMint: PublicKey;

  let offering: PublicKey;
  let buyer = Keypair.generate();
  let buyerTokenAccount: PublicKey;

  before(async () => {
    // initialize a test mint
    let { mint, authority } = await utils.initializeTestMint(client);
    testMint = mint;
    testMintAuthority = authority;

    // airdrop to buyer
    await utils.airdropTo(client, buyer.publicKey, 100_000);

    // create a token account for buyer
    buyerTokenAccount = await utils.createTokenAccount(
      client,
      buyer.publicKey,
      testMint
    );

    // mint test tokens to buyer's token account.
    await utils.mintToAccount(
      client,
      testMint,
      testMintAuthority,
      buyerTokenAccount,
      10
    );
  });

  it("Can initialize a new offering", async () => {
    let initialShares = 100;
    let pricePerShare = 1;
    let title = "offering1";
    let symbol = "off1";
    let uri = "random uri";

    let { newOffering } = await client.initializeOffering(
      client.provider.publicKey,
      testMint,
      initialShares,
      new BN(pricePerShare),
      title,
      symbol,
      uri
    );
    offering = newOffering;

    let idlAccount = await client.program.account.offering.fetch(offering);
    let account = OfferingAccount.fromIdlAccount(idlAccount, offering).pretty();
    expect(account.initialShares).to.equal(initialShares);
    expect(account.pricePerShare).to.equal(pricePerShare.toString());
    expect(account.title).to.equal(title);
    expect(account.symbol).to.equal(symbol);
    expect(account.nftUri).to.equal(uri);
    expect(account.buyIns).to.equal(0);
    expect(account.authority).to.equal(client.provider.publicKey.toBase58());
  });

  it("Can update an offering", async () => {
    let newUri = TEST_URI;

    await client.updateOffering(offering, null, null, newUri);

    let idlAccount = await client.program.account.offering.fetch(offering);
    let account = OfferingAccount.fromIdlAccount(idlAccount, offering).pretty();
    expect(account.nftUri).to.equal(TEST_URI);
  });

  it("Can purchase a share", async () => {
    // Set provider to buyer keypair
    const buyerIdentity = new anchor.AnchorProvider(
      provider.connection,
      new anchor.Wallet(buyer),
      {}
    );
    client = PendulumClient.get(buyerIdentity, LOCALNET_ADDRESS);

    let idlAccount = await client.program.account.offering.fetch(offering);
    let offeringAccount = OfferingAccount.fromIdlAccount(idlAccount, offering);
    let sharesToPurchase = 5;

    let preBalance = await client.provider.connection
      .getTokenAccountBalance(buyerTokenAccount)
      .then((res) => res.value.uiAmount);
    if (preBalance === null) {
      throw new Error("unreachable!");
    }

    let { nftMint, buyIn, fromTokenAccount, mintedNftTo } =
      await client.purchaseShares(
        offering,
        buyer.publicKey,
        sharesToPurchase,
        buyerTokenAccount
      );

    let postBalance = await client.provider.connection
      .getTokenAccountBalance(fromTokenAccount)
      .then((res) => res.value.uiAmount);
    if (postBalance === null) {
      throw new Error("unreachable!");
    }

    let expectedCost =
      sharesToPurchase * offeringAccount.pricePerShare.toNumber();

    // Buyer's token account should be depleted by 5(purchased 5 shares at 1 token per share)
    expect(preBalance - postBalance).to.equal(expectedCost);

    // The offering token account should be topped up by 5
    let balance = await client.provider.connection
      .getTokenAccountBalance(offeringAccount.paymentsTokenAccount)
      .then((res) => res.value.uiAmount);
    expect(balance).to.equal(expectedCost);

    // Refresh offering account.
    idlAccount = await client.program.account.offering.fetch(offering);
    let account = OfferingAccount.fromIdlAccount(idlAccount, offering).pretty();

    expect(account.buyIns).to.equal(1);
    expect(account.boughtShares).to.equal(sharesToPurchase);

    let buyInIdlAccount = await client.program.account.buyIn.fetch(buyIn);
    let buyInAccount = BuyInAccount.fromIdlAccount(
      buyInIdlAccount,
      buyIn
    ).pretty();

    // Check buy-in account.
    expect(buyInAccount.offering).to.equal(offering.toBase58());
    expect(buyInAccount.index).to.equal(1);
    expect(buyInAccount.shares).to.equal(sharesToPurchase);
    expect(buyInAccount.beneficiary).to.equal(buyer.publicKey.toBase58());
    expect(buyInAccount.tokenMint).to.equal(nftMint.toBase58());

    // Check that the nft was minted to the buyer's wallet.
    let nftBalance = await client.provider.connection
      .getTokenAccountBalance(mintedNftTo)
      .then((res) => res.value.uiAmount);
    if (nftBalance === null) {
      throw new Error("Unreachable!");
    }
    expect(nftBalance).to.equal(1);

    // Check that the nft was created.
    let metadata = await utils.fetchMetadataAccount(client, nftMint);
    expect(metadata.mint.toBase58()).to.equal(nftMint.toBase58());
    expect(metadata.data.name.replace(/\0/g, "")).to.equal("offering1-1"); // TODO: Fix str hack
    expect(metadata.data.symbol.replace(/\0/g, "")).to.equal("off1-1");
    expect(metadata.data.uri.replace(/\0/g, "")).to.equal(TEST_URI);
  });
});
