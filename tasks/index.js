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

    const result = await merkleOrchard.verifyClaim(...args);
    console.log("CLAIM VALID? : ", result);
    return result;
  });

task("task:create-distribution", "Creates & posts a merkle root")
  .addParam("name", "Filename of JSON in ./tree-data")
  .setAction(async ({ name, address }, { ethers }) => {
    console.log("Creating distribution for /tree-data/" + name + ".json");
    const dataPath = path.join(__dirname, `../tree-data/${name}.json`);
    const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));
    const totalAmount = data.leafs.reduce(
      (accumulator, [_, amount]) => accumulator + BigInt(amount),
      BigInt(0)
    );
    const jsTree = new MerkleTree(data.leafs);

    let tx;
    const merkleTree = await ethers.getContract("ReFiMerkleOrchard");
    tx = await merkleTree.createRfpDistribution(
      jsTree.getHexRoot(),
      totalAmount
    );
    console.log("Created distribution at tx: ", tx.hash);

    return { jsTree, tx, totalAmount };
  });

task("task:claim", "Claims allocation")
  .addParam("name", "Filename of JSON in ./tree-data")
  .addParam("address", "Claimer address")
  .setAction(async ({ name, address }, { ethers, run }) => {
    const args = await run("task:utils:claim-args", { name, address });
    console.log(
      `Claiming ${args[0].balance} for address ${address} in distribution /tree-data/${name}.json`
    );
    // const totalAmount = data.leafs.reduce(
    //   (accumulator, [_, amount]) => accumulator + BigInt(amount),
    //   BigInt(0)
    // );
    // const jsTree = new MerkleTree(data.leafs);

    let tx;
    const merkleOrchard = await ethers.getContract("ReFiMerkleOrchard");
    const rfp = await ethers.getContract("ReFiPoints");
    tx = await merkleOrchard.claimDistributions(address, args, [rfp]);
    //   jsTree.getHexRoot(),
    //   totalAmount
    // );
    // console.log("Created distribution at tx: ", tx.hash);

    // return { jsTree, tx, totalAmount };
  });
