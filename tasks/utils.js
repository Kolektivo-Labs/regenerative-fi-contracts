const path = require("path");
const fs = require("fs/promises");
const MerkleTree = require("../utils/merkleTree");

task(
  "task:utils:claim-args",
  "Returns and prints call arguments needed for claiming"
)
  .addParam("name", "Filename of JSON in ./tree-data")
  .addParam("address", "Claimer address")
  .setAction(async ({ name, address }, { ethers }) => {
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();

    const merkleOrchard = await ethers.getContract("ReFiMerkleOrchard");
    const rfp = await ethers.getContract("ReFiPoints");
    const dataPath = path.join(__dirname, `../tree-data/${name}.json`);
    const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const jsTree = new MerkleTree(data.leafs);
    const claim = data.leafs.find((el) => el[0] === address);
    const claimAmount = claim[1];
    const channelId = ethers.keccak256(
      abiCoder.encode(["address", "uint256"], [address, BigInt(claimAmount)])
    );

    const token = rfp.target;
    const distributor = merkleOrchard.target;
    const distributionId = await merkleOrchard.nextDistributionId(channelId);
    const balance = claimAmount;
    const tokenIndex = 0;
    const merkleProof = jsTree.getHexProof(claim);

    const result = await merkleOrchard.verifyClaim(
      token,
      distributor,
      distributionId,
      address,
      balance,
      merkleProof
    );

    if (!result) throw Error("Couldn't verify claim onchain");

    const claimArgs = [
      {
        distributionId,
        balance,
        distributor,
        tokenIndex,
        merkleProof,
      },
    ];

    console.log("Claim arguments:");
    console.log(claimArgs);

    return claimArgs;
  });
