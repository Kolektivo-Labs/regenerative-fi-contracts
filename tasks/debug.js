task(
  "task:get-address-info",
  "Retrieves relevant information for a given account"
)
  .addParam("account", "Account address")
  .setAction(async ({ address }, { ethers }) => {
    const rfnft = await ethers.getContract("RFNFT");

    console.log("balanceOf: ", await rfnft.balanceOf(address));
    const tokenId = await rfnft.ownerTokenId(address);
    console.log("ownerTokenId: ", tokenId);
    console.log("tokenIdTier: ", await rfnft.tokenIdTier(tokenId));
    console.log("tokenIdPoints: ", await rfnft.tokenIdPoints(tokenId));
    console.log("tokenURI: ", await rfnft.tokenURI(tokenId));
  });
