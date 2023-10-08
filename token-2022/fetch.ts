import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);
const TOKEN_2022_PROGRAM_ID = new PublicKey(
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
);
const walletPublicKey = new PublicKey('2JAGPJNC7CYgRwC3Aig5jqrk4HwgawPyHheVCdVvRGHw'); // insert your key
const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');

(async () => {
    const tokenAccounts = await connection.getTokenAccountsByOwner(
        walletPublicKey, { programId: TOKEN_PROGRAM_ID }
      );
      // console.log(tokenAccounts)
      const token2022Accounts = await connection.getTokenAccountsByOwner(
        walletPublicKey, { programId: TOKEN_2022_PROGRAM_ID }
      );

      console.log(token2022Accounts)
})();
