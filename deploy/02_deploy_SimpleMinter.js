module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, get } = deployments;
  const [deployer] = await ethers.getSigners();
  const rfp = await ethers.getContract("RFP");

  const simpleMinter = await deploy("SimpleMinter", {
    from: deployer.address,
    args: [(await get("RFP")).address, (await get("RFNFT")).address],
    log: true,
  });

  await rfp.enableMinter(simpleMinter.address);
};

module.exports.tags = ["SimpleMinter"];
module.exports.dependencies = ["RFP", "RFNFT"];
