module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, get } = deployments;
  const [deployer] = await ethers.getSigners();
  const rfp = await ethers.getContract("RFP");

  const simpleMinter = await deploy("SimpleMinter", {
    from: deployer.address,
    args: [(await get("RFP")).address, (await get("RFNFT")).address],
    log: true,
  });

  const tx = await rfp.enableMinter(simpleMinter.address);
  console.log(
    `enable minter role for 'SimpleMinter' contract (tx: ${tx.hash})`
  );
  await tx.wait();
};

module.exports.tags = ["SimpleMinter"];
module.exports.dependencies = ["RFP", "RFNFT"];
