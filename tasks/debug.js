task(
  "task:get-account-info",
  "Retrieves relevant information for a given account"
)
  .addParam("account", "Account address")
  .setAction(async ({ account }, { ethers }) => {
    const rfnft = await ethers.getContract("RFNFT");
    const simpleMinter = await ethers.getContract("SimpleMinter");

    console.log(`claimable amount: ${await simpleMinter.allocations(account)}`);
    console.log(`balanceOf(${account}) = `, await rfnft.balanceOf(account));
    const tokenId = await rfnft.ownerTokenId(account);
    console.log(`ownerTokenId(${account}) = `, tokenId);
    console.log(`tokenIdTier(${tokenId}) = `, await rfnft.tokenIdTier(tokenId));
    console.log(
      `tokenIdPoints(${tokenId}) = `,
      await rfnft.tokenIdPoints(tokenId)
    );
    console.log(`tokenURI(${tokenId}) = `, await rfnft.tokenURI(tokenId));
  });
