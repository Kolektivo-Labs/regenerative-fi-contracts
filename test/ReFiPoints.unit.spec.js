const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { run } = require("hardhat");
const { expect } = require("chai");

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const [deployer, other1, other2] = await ethers.getSigners();
    await deployments.fixture(); // ensure you start from a fresh deployments
    const reFiPoints = await ethers.getContract("ReFiPoints", deployer.address);
    return {
      reFiPoints,
      accounts: { deployer, other1, other2 },
    };
  }
);

describe("ReFi points contract", function () {
  let reFiPoints, accounts;

  before("Deploy", async () => {
    ({ reFiPoints, accounts } = await setupTest());
  });

  describe("#mint", () => {
    context("without minter role", () => {
      it("reverts 'NoMinter()'", async function () {
        const { other1, other2 } = accounts;
        await expect(
          reFiPoints.connect(other1).mint(other2.address, "1000")
        ).to.be.revertedWithCustomError(reFiPoints, "NoMinter");
      });
    });

    context("with minter role", () => {
      let other1, other2;

      beforeEach("set minter role", async () => {
        ({ other1, other2 } = accounts);
        await reFiPoints
          .connect(accounts.deployer)
          .enableMinter(other1.address);
      });

      it("is successful", async function () {
        await reFiPoints.connect(other1).mint(other2.address, "1000");
        expect(await reFiPoints.balanceOf(other2.address)).to.be.equal("1000");
      });
    });
  });

  describe("#enableMinter", () => {
    context("as owner", async () => {
      it("doesn't revert", async () => {
        const { other1 } = accounts;
        await expect(
          reFiPoints.connect(accounts.deployer).enableMinter(other1.address)
        ).not.to.be.reverted;
      });
    });

    context("without owner role", () => {
      it("doesn't revert", async () => {
        const { other1, other2 } = accounts;
        await expect(
          reFiPoints.connect(other1).enableMinter(other2.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });
});
