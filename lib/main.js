import * as multisig from "@sqds/multisig";
import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
const { Permission, Permissions } = multisig.types;
const connection = new Connection(clusterApiUrl('devnet'), "confirmed");
describe("Interacting with the Squads V4 SDK", () => {
    const creator = Keypair.generate();
    const secondMember = Keypair.generate();
    before(async () => {
        const airdropSignature = await connection.requestAirdrop(creator.publicKey, 1 * LAMPORTS_PER_SOL);
        await connection.confirmTransaction(airdropSignature);
    });
    const createKey = Keypair.generate().publicKey;
    // Derive the multisig account PDA
    const [multisigPda] = multisig.getMultisigPda({
        createKey,
    });
    it("Create a new multisig", async () => {
        // Create the multisig
        const signature = await multisig.rpc.multisigCreate({
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
    });
});
