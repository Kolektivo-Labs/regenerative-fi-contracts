module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, get } = deployments;
  const [deployer] = await ethers.getSigners();
  const rfp = await ethers.getContract("RFP");

  // TODO: set thresholds
  const thresholds = [];

  await deploy("RFNFT", {
    from: deployer.address,
    args: [rfp.target, thresholds],
    log: true,
  });
};

module.exports.tags = ["RFNFT"];
module.exports.dependencies = ["RFP"];
