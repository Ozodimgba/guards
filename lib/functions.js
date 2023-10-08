// devnet airdrop
export const airdrop = async (connection, address, amount) => {
    const airdropSig = await connection.requestAirdrop(address, amount);
    console.log("Airdrop sig", airdropSig);
    await connection.confirmTransaction(airdropSig, "confirmed");
    return airdropSig;
};
