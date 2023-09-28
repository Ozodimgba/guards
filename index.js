"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWalletKey = void 0;
const rpc_1 = require("@sqds/multisig/lib/rpc");
const multisig_1 = require("@sqds/multisig");
const web3_js_1 = require("@solana/web3.js");
const web3 = __importStar(require("@solana/web3.js"));
// Cluster Connection
function loadWalletKey(keypairFile) {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())));
    return loaded;
}
exports.loadWalletKey = loadWalletKey;
const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)('devnet'), 'confirmed');
// Random Public Key that will be used to derive a multisig PDA
const createKey = web3_js_1.Keypair.generate();
const secondMember = web3_js_1.Keypair.generate();
// Creator should be a Keypair or a Wallet Adapter wallet
const creator = loadWalletKey("mint.json");
// Derive the multisig PDA
const multisigPda = (0, multisig_1.getMultisigPda)({
    // The createKey has to be a Public Key, see accounts reference for more info
    createKey: createKey.publicKey,
    programId: multisig_1.PROGRAM_ID
})[0];
const creatorPermissions = {
    mask: 1 /* specify the mask value for the creator's permissions */,
};
function createMultisigAndPrintSignature() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const signature = yield (0, rpc_1.multisigCreate)({
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
        }
        catch (error) {
            console.error("Error creating multisig:", error);
        }
    });
}
// Call the async function to create the multisig and print the signature
createMultisigAndPrintSignature();
