const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { run } = require("hardhat");
const { expect } = require("chai");

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    await deployments.fixture(); // ensure you start from a fresh deployments
    const merkleOrchard = await ethers.getContract(
      "MerkleOrchard",
      owner.address
    );
    return {
      merkleOrchard,
    };
  }
);

describe("Token contract", function () {
  let merkleOrchard;

  before("Deploy and create first distribution", async () => {
    merkleOrchard = await setupTest();
  });

  it("", async function () {});

  //   it("Should transfer tokens between accounts", async function () {
  //     const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
  //       deployTokenFixture
  //     );

  //     // Transfer 50 tokens from owner to addr1
  //     await expect(
  //       hardhatToken.transfer(addr1.address, 50)
  //     ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

  //     // Transfer 50 tokens from addr1 to addr2
  //     // We use .connect(signer) to send a transaction from another account
  //     await expect(
  //       hardhatToken.connect(addr1).transfer(addr2.address, 50)
  //     ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
  //   });
});
