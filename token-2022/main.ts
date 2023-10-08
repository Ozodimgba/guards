import {
	clusterApiUrl,
	sendAndConfirmTransaction,
	Connection,
	Keypair,
	SystemProgram,
	Transaction,
	LAMPORTS_PER_SOL,
    PublicKey,
} from "@solana/web3.js";
import {
	createInitializeNonTransferableMintInstruction,
	createInitializeMintInstruction,
	getMintLen,
	ExtensionType,
    mintTo,
	TOKEN_2022_PROGRAM_ID,
	getAccountLen,
	createInitializeAccountInstruction,
	createInitializeImmutableOwnerInstruction,
} from "@solana/spl-token";
import { CreateMetadataAccountV3InstructionArgs, PROGRAM_ID, createCreateMetadataAccountV3Instruction, createUpdateMetadataAccountV2Instruction } from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@coral-xyz/anchor";

export function loadWalletKey(keypairFile:string): Keypair {
    const fs = require("fs");
    const loaded = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
  }

const INITIALIZE = true;

(async () => {
	const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

	const payer = loadWalletKey('mint.json')
	
    const sourceAccount = new PublicKey("Ehg4iYiJv7uoC6nxnX58p4FoN5HPNoyqKhCMJ65eSePk")
	const mintAuthority = loadWalletKey('mint.json')
	const decimals = 9;

	const mintKeypair = Keypair.generate();
	const mint = mintKeypair.publicKey;
    
	//one time issuing token for use, frezze and burn
	const mintLen = getMintLen([ExtensionType.NonTransferable]);

	let lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

	let transaction = new Transaction().add(
		SystemProgram.createAccount({
			fromPubkey: payer.publicKey,
			newAccountPubkey: mint,
			space: mintLen,
			lamports,
			programId: TOKEN_2022_PROGRAM_ID,
		}),
		createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID),
		createInitializeMintInstruction(
			mint,
			decimals,
			mintAuthority.publicKey,
			null,
			TOKEN_2022_PROGRAM_ID,
		),
	);

    
	const signature = await sendAndConfirmTransaction(
		connection,
		transaction,
		[payer, mintKeypair],
		undefined,
	);

	// create the token account
        const owner = Keypair.generate();
        const accountLen = getAccountLen([ExtensionType.ImmutableOwner, ExtensionType.NonTransferableAccount]);
        lamports = await connection.getMinimumBalanceForRentExemption(accountLen);
		//this the owner of the token
        console.log("Owner: " + owner.publicKey.toBase58())
        const sourceKeypair = Keypair.generate();
        const source = sourceKeypair.publicKey;
		console.log("Source: " + source.toBase58())
        transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: source,
                space: accountLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeImmutableOwnerInstruction(source, TOKEN_2022_PROGRAM_ID),
            createInitializeAccountInstruction(source, mint, owner.publicKey, TOKEN_2022_PROGRAM_ID)
        );
        await sendAndConfirmTransaction(connection, transaction, [payer, sourceKeypair], undefined);

    if (signature) {
        
    }
   console.log(mint.toBase58())
   const amount = 1000;
   const sig = await mintTo(connection, payer, mint, source, mintAuthority, amount, [], undefined, TOKEN_2022_PROGRAM_ID);

    console.log(sig)
})();