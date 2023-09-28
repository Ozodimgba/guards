import { multisigCreate } from '@sqds/multisig/lib/rpc';
import { PROGRAM_ID, getMultisigPda } from "@sqds/multisig";
import { Connection, clusterApiUrl, Keypair } from '@solana/web3.js'
import * as web3 from "@solana/web3.js";
// Cluster Connection

export function loadWalletKey(keypairFile:string): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
  }
const connection = new Connection( clusterApiUrl('devnet'),'confirmed');

// Random Public Key that will be used to derive a multisig PDA
const createKey = Keypair.generate();

const secondMember = Keypair.generate();

// Creator should be a Keypair or a Wallet Adapter wallet
const creator = loadWalletKey("mint.json")

// Derive the multisig PDA
const multisigPda = getMultisigPda({
    // The createKey has to be a Public Key, see accounts reference for more info
    createKey: createKey.publicKey,
    programId: PROGRAM_ID
})[0];

const creatorPermissions = {
    mask:  1 /* specify the mask value for the creator's permissions */,
  };

async function createMultisigAndPrintSignature() {
    try {
      const signature = await multisigCreate({
        connection,
        // One-time random Key
        createKey,
        // The creator & fee payer
        creator,
        // The PDA of the multisig you are creating, derived by a random PublicKey
        multisigPda,
        // Here the config authority will be the system program
        configAuthority: null,
        // Create without any time-lock
        timeLock: 0,
        // List of the members to add to the multisig
        members: [
          {
            // Members Public Key
            key: creator.publicKey,
            // Members permissions inside the multisig
            permissions: creatorPermissions,
          },
          {
            key: secondMember.publicKey,
            // Member can only add votes to proposed transactions
            permissions: creatorPermissions,
          },
        ],
        // This means that there need to be 2 votes for a transaction proposal to be approved
        threshold: 2,
      });
  
      console.log("Multisig created. Signature: ", signature);
    } catch (error) {
      console.error("Error creating multisig:", error);
    }
  }
  
  // Call the async function to create the multisig and print the signature
  createMultisigAndPrintSignature();
  