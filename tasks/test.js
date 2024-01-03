const fs = require("fs/promises");
const path = require("path");
const MerkleTree = require("../utils/merkleTree");

task("task:deploy-pp", "PPPPP").setAction(
  async ({ name, address }, { deployments, ethers }) => {
    const { deploy } = deployments;
    const [deployer] = await ethers.getSigners();
    await deploy("PP", { from: deployer.address, args: [], log: true });
  }
);

task("task:set-allocations", "PPPPP").setAction(
  async ({ name, address }, { deployments, ethers }) => {
    const pp = await ethers.getContract("PP");
    const accounts = [];
    const amounts = [];
    for (let i = 0; i < 2000; i++) {
      const address = ethers.Wallet.createRandom(i);
      accounts.push(address);
      const amount = BigInt(i * 1000);
      amounts.push(amount);
    }
    let tx = await pp.createAllocations(accounts, amounts, {
      gasLimit: 50_000_000,
    });
  }
);
