import * as multisig from "@sqds/multisig";
import { Connection, clusterApiUrl, Keypair } from '@solana/web3.js'
import * as web3 from "@solana/web3.js";
import { Permission, Permissions } from "@sqds/multisig/lib/types.js";
import fs from 'fs'
// Cluster Connection

export function loadWalletKey(keypairFile:string): web3.Keypair {
    // const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
  }
const connection = new Connection( clusterApiUrl('devnet'),'confirmed');

// Random Public Key that will be used to derive a multisig PDA
const createKey = Keypair.generate().publicKey;
const second = Keypair.generate().publicKey;

// Creator should be a Keypair or a Wallet Adapter wallet
const creator = loadWalletKey("mint.json")

// Derive the multisig PDA
const [multisigPda] = multisig.getMultisigPda({ createKey });



async function createMultisigAndPrintSignature() {
    try {
      const signature = await multisig.rpc.multisigCreate({
        connection,
        // One-time random Key
        createKey: createKey,
        // The creator & fee payer
        creator,
        // The PDA of the multisig you are creating, derived by a random PublicKey
        multisigPda: multisigPda,
        // Here the config authority will be the system program
        configAuthority: null,
        // Create without any time-lock
        threshold: 1,
        // List of the members to add to the multisig
        members: [
          {
            // Members Public Key
            key: createKey.toBase58(),
            // Members permissions inside the multisig
            permissions: Permissions.fromPermissions([Permission.Execute]),
          },
          {
            // Members Public Key
            key: second.toBase58(),
            // Members permissions inside the multisig
            permissions: Permissions.all(),
          }
        ],
        // This means that there need to be 2 votes for a transaction proposal to be approved
        timeLock: 0,
      });
  
      console.log("Multisig created. Signature: ", signature);
    } catch (error) {
      console.error("Error creating multisig:", error);
    }
  }
  
  // Call the async function to create the multisig and print the signature
  createMultisigAndPrintSignature();
  