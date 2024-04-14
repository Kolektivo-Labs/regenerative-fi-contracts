module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, get } = deployments;
  const [deployer] = await ethers.getSigners();

  const stCeloManager = "0x0239b96D10a434a56CC9E09383077A0490cF9398";

  await deploy("StCeloRateProvider", {
    from: deployer.address,
    args: [stCeloManager],
    log: true,
  });
};

module.exports.tags = ["stCelo"];
