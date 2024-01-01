const fs = require("fs/promises");
const path = require("path");
const MerkleTree = require("../utils/merkleTree");

task("task:verify-claim", "Verifies a merkle proof")
  .addParam("name", "Filename of JSON in ./tree-data")
  .setAction(async ({ name, address }, hre) => {
    const dataPath = path.join(__dirname, `../tree-data/${name}.json`);
    const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const jsTree = new MerkleTree(data.leafs);

    const MerkleOrchard = await hre.ethers.getContractFactory("MerkleOrchard");
    const merkleOrchard = MerkleOrchard.attach(address);

    const args = [
      data.token,
      data.distributor,
      data.distributionId,
      data.claimer,
      data.claimedBalance,
      jsTree.getHexProof(data.leafs[0]),
    ];

    console.log("CLAIM VALID? : ", await merkleOrchard.verifyClaim(...args));
  });

task("task:create-distribution", "Creates & posts a merkle root")
  .addParam("name", "Filename of JSON in ./tree-data")
  .setAction(async ({ name, address }, hre) => {
    const dataPath = path.join(__dirname, `../tree-data/${name}.json`);
    const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const jsTree = new MerkleTree(data.leafs);

    // const merkleOrchard = await ethers.getContract("MerkleOrchard");
    // const tx = await merkleOrchard.createDistribution("token", jsTree.getHexRoot(), )
    // console.log(merkleOrchard);

    // IERC20 token,
    // bytes32 merkleRoot,
    // uint256 amount,
    // uint256 distributionId

    // const args = [
    //   data.token,
    //   data.distributor,
    //   data.distributionId,
    //   data.claimer,
    //   data.claimedBalance,
    //   jsTree.getHexProof(data.leafs[0]),
    // ];

    // console.log("CLAIM VALID? : ", await merkleOrchard.verifyClaim(...args));
  });
