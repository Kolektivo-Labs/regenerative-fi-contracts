module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();
  await deploy("MerkleOrchard", {
    from: deployer.address,
    args: ["0xcea5C87415A45B238920a34139f5FC88a5eB3B0C"],
    log: true,
  });
};

module.exports.tags = ["MerkleOrchard"];
