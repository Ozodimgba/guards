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
const multisig = __importStar(require("@sqds/multisig"));
const web3_js_1 = require("@solana/web3.js");
const { Permission, Permissions } = multisig.types;
const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)('devnet'), "confirmed");
describe("Interacting with the Squads V4 SDK", () => {
    const creator = web3_js_1.Keypair.generate();
    const secondMember = web3_js_1.Keypair.generate();
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        const airdropSignature = yield connection.requestAirdrop(creator.publicKey, 1 * web3_js_1.LAMPORTS_PER_SOL);
        yield connection.confirmTransaction(airdropSignature);
    }));
    const createKey = web3_js_1.Keypair.generate().publicKey;
    // Derive the multisig account PDA
    const [multisigPda] = multisig.getMultisigPda({
        createKey,
    });
    it("Create a new multisig", () => __awaiter(void 0, void 0, void 0, function* () {
        // Create the multisig
        const signature = yield multisig.rpc.multisigCreate({
            connection,
            // One time random Key
            createKey,
            // The creator & fee payer
            creator,
            multisigPda,
            configAuthority: null,
            timeLock: 0,
            members: [{
                    key: creator.publicKey,
                    permissions: Permissions.all(),
                },
                {
                    key: secondMember.publicKey,
                    // This permission means that the user will only be able to vote on transactions
                    permissions: Permissions.fromPermissions([Permission.Vote]),
                },
            ],
            // This means that there needs to be 2 votes for a transaction proposal to be approved
            threshold: 2,
        });
        console.log("Multisig created: ", signature);
    }));
});
