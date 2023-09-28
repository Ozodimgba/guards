import { createMint, getMint, mintTo, getOrCreateAssociatedTokenAccount, burn } from '@solana/spl-token';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export function loadWalletKey(keypairFile:string): web3.Keypair {
  const fs = require("fs");
  const loaded = web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
  );
  return loaded;
}

const payer = loadWalletKey("mint.json");
const mintAuthority = Keypair.generate();
const freezeAuthority = Keypair.generate();



const INITIALIZE = true;

const connection = new Connection(
  clusterApiUrl('devnet'),
  'confirmed'
);
async function requestAirdropAndConfirm() {
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    freezeAuthority.publicKey,
    9 // We are using 9 to match the CLI decimal default exactly
  );

  const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
  const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
  const seed3 = Buffer.from(mint.toBytes());
  const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);
  
  const accounts = {
    metadata: metadataPDA,
    mint,
    mintAuthority: payer.publicKey,
    payer: payer.publicKey,
    updateAuthority: payer.publicKey,
}
  console.log(mint.toBase58());

  const dataV2 = {
    name: "FX test Coin",
    symbol: "FXT",
    uri: "https://kk5dtz3fy3vrudu76wcou44yg6i666c62e3mow6z3eugz5yobviq.arweave.net/Uro552XG6xoOn_WE6nOYN5HveF7RNsdb2dkobPcODVE",
    // we don't need that
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null
  }

  let ix;
  if (INITIALIZE) {
      const args : mpl.CreateMetadataAccountV3InstructionArgs =  {
          createMetadataAccountArgsV3: {
              data: dataV2,
              isMutable: true,
              collectionDetails: null
          }
      };
      ix = mpl.createCreateMetadataAccountV3Instruction(accounts, args);
  } else {
      const args =  {
          updateMetadataAccountArgsV2: {
              data: dataV2,
              isMutable: true,
              updateAuthority: payer.publicKey,
              primarySaleHappened: true
          }
      };
      ix = mpl.createUpdateMetadataAccountV2Instruction(accounts, args)
  }

  const tx = new web3.Transaction();
  tx.add(ix);
  const txid = await web3.sendAndConfirmTransaction(connection, tx, [payer]);
  console.log("tx:" + txid);

  const mintInfo = await getMint(
    connection,
    mint
  )
  
  console.log(mintInfo.supply);

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  )
  
  console.log(tokenAccount.address.toBase58());

  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    100000000000 // because decimals for the mint are set to 9 
  )

  const mintInf = await getMint(
    connection,
    mint
  )
  
  console.log(mintInf.supply);

  await burn(
    connection,
    payer,
    tokenAccount.address,
    mint,
    payer,
    100000000000 // because decimals for the mint are set to 9 
  )

  const mintIn = await getMint(
    connection,
    mint
  )
  
  console.log(mintIn.supply);
}

requestAirdropAndConfirm()