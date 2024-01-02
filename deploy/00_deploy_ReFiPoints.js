module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();
  await deploy("ReFiPoints", {
    from: deployer.address,
    args: [],
    log: true,
  });
};

module.exports.tags = ["ReFiPoints"];
