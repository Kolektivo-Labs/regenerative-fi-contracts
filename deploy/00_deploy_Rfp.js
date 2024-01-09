module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const [deployer] = await ethers.getSigners();

  await deploy("RFP", {
    from: deployer.address,
    args: [],
    log: true,
  });
};

module.exports.tags = ["RFP"];
