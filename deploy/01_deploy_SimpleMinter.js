module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, get } = deployments;
  const [deployer] = await ethers.getSigners();

  await deploy("SimpleMinter", {
    from: deployer.address,
    args: [(await get("RFP")).address],
    log: true,
  });
};

module.exports.tags = ["SimpleMinter"];
module.exports.dependencies = ["RFP"];
