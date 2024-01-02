module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, get } = deployments;
  const [deployer] = await ethers.getSigners();

  await deploy("ReFiMerkleOrchard", {
    from: deployer.address,
    args: [
      "0xcea5C87415A45B238920a34139f5FC88a5eB3B0C",
      (await get("ReFiPoints")).address,
    ],
    log: true,
  });
};

module.exports.tags = ["MerkleOrchard"];
module.exports.dependencies = ["ReFiPoints"];
