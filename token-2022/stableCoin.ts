/**
 * @abstract This is the typescript client for a Permanent Delegate SPL token
   it allows mint authority to delegate token authority permanently
 * what this means that when a given token is minted this authority has the power to tranfer or burn the token,
   without the wallet user's permission...this is While this feature certainly has room for abuse, it has many important real-world use cases.
   In some jurisdictions, a stablecoin issuer must be able to seize assets from sanctioned entities. Through the permanent delegate, 
   the stablecoin issuer can transfer or burn tokens from accounts owned by sanctioned entities.
 * 
 */
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
    createInitializePermanentDelegateInstruction,
    createAccount,
    transferChecked,
} from "@solana/spl-token";

export function loadWalletKey(keypairFile:string): Keypair {
    const fs = require("fs");
    const loaded = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
  }

  (async () => {
    const payer = loadWalletKey('mint.json');

    const mintAuthority = Keypair.generate();
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    const permanentDelegate = Keypair.generate();

    const extensions = [ExtensionType.PermanentDelegate];
    const mintLen = getMintLen(extensions);
    const decimals = 9;

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');


    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
    const mintTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: mintLamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializePermanentDelegateInstruction(mint, permanentDelegate.publicKey, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(mint, decimals, mintAuthority.publicKey, null, TOKEN_2022_PROGRAM_ID)
    );
   const sig = await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);
   console.log(sig)

       // create the token transfer
        const owner1 = Keypair.generate();
        const owner2 = Keypair.generate();
        let destination = await createAccount(
            connection,
            payer,
            mint,
            owner2.publicKey,
            undefined,
            undefined,
            TOKEN_2022_PROGRAM_ID
        );
        let account = await createAccount(connection, payer, mint, owner1.publicKey, undefined, undefined, TOKEN_2022_PROGRAM_ID);

        if(account){
          
        const receipt = await mintTo(connection, payer, mint, account, mintAuthority, 5, [], undefined, TOKEN_2022_PROGRAM_ID);
        console.log(receipt)
        const transfer = await transferChecked(
            connection,
            payer,
            account,
            mint,
            destination,
            permanentDelegate,
            2,
            9,
            undefined,
            undefined,
            TOKEN_2022_PROGRAM_ID
        );
        console.log(transfer)
        const source_info = await connection.getTokenAccountBalance(account);
        console.log(source_info)
        const destination_info = await connection.getTokenAccountBalance(destination);
        console.log(destination_info)
        }
        

})();