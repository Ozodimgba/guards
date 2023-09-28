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
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const mpl = __importStar(require("@metaplex-foundation/mpl-token-metadata"));
const web3 = __importStar(require("@solana/web3.js"));
const anchor = __importStar(require("@coral-xyz/anchor"));
function loadWalletKey(keypairFile) {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())));
    return loaded;
}
exports.loadWalletKey = loadWalletKey;
const payer = loadWalletKey("mint.json");
const mintAuthority = web3_js_1.Keypair.generate();
const freezeAuthority = web3_js_1.Keypair.generate();
const INITIALIZE = true;
const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)('devnet'), 'confirmed');
function requestAirdropAndConfirm() {
    return __awaiter(this, void 0, void 0, function* () {
        const mint = yield (0, spl_token_1.createMint)(connection, payer, payer.publicKey, freezeAuthority.publicKey, 9 // We are using 9 to match the CLI decimal default exactly
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
        };
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
        };
        let ix;
        if (INITIALIZE) {
            const args = {
                createMetadataAccountArgsV3: {
                    data: dataV2,
                    isMutable: true,
                    collectionDetails: null
                }
            };
            ix = mpl.createCreateMetadataAccountV3Instruction(accounts, args);
        }
        else {
            const args = {
                updateMetadataAccountArgsV2: {
                    data: dataV2,
                    isMutable: true,
                    updateAuthority: payer.publicKey,
                    primarySaleHappened: true
                }
            };
            ix = mpl.createUpdateMetadataAccountV2Instruction(accounts, args);
        }
        const tx = new web3.Transaction();
        tx.add(ix);
        const txid = yield web3.sendAndConfirmTransaction(connection, tx, [payer]);
        console.log("tx:" + txid);
        const mintInfo = yield (0, spl_token_1.getMint)(connection, mint);
        console.log(mintInfo.supply);
        const tokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mint, payer.publicKey);
        console.log(tokenAccount.address.toBase58());
        yield (0, spl_token_1.mintTo)(connection, payer, mint, tokenAccount.address, payer, 100000000000 // because decimals for the mint are set to 9 
        );
        const mintInf = yield (0, spl_token_1.getMint)(connection, mint);
        console.log(mintInf.supply);
        yield (0, spl_token_1.burn)(connection, payer, tokenAccount.address, mint, payer, 100000000000 // because decimals for the mint are set to 9 
        );
        const mintIn = yield (0, spl_token_1.getMint)(connection, mint);
        console.log(mintIn.supply);
    });
}
requestAirdropAndConfirm();
