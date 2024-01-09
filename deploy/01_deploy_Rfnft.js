const { nftTiers } = require("../config.js");

module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, get } = deployments;
  const [deployer] = await ethers.getSigners();
  const rfp = await ethers.getContract("RFP");

  await deploy("RFNFT", {
    from: deployer.address,
    args: [rfp.target, nftTiers.pointThresholds, nftTiers.ipfsHashes],
    log: true,
  });
};

module.exports.tags = ["RFNFT"];
module.exports.dependencies = ["RFP"];
