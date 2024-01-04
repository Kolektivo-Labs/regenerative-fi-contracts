const { expect } = require("chai");

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const [deployer, other1, other2] = await ethers.getSigners();
    await deployments.fixture("RFP"); // ensure you start from a fresh deployments
    const rfp = await ethers.getContract("RFP", deployer.address);
    return {
      rfp,
      accounts: { deployer, other1, other2 },
    };
  }
);

describe("RFP", function () {
  let rfp, deployer, other1, other2;

  before("Deploy", async () => {
    ({
      rfp,
      accounts: { deployer, other1, other2 },
    } = await setupTest());
  });

  describe("#mint", () => {
    context("without minter role", () => {
      it("reverts 'NoMinter()'", async function () {
        await expect(
          rfp.connect(other1).mint(other2.address, "1000")
        ).to.be.revertedWithCustomError(rfp, "NoMinter");
      });
    });

    context("with minter role", () => {
      beforeEach("set minter role", async () => {
        await rfp.connect(deployer).enableMinter(other1.address);
      });

      it("is successful", async function () {
        await rfp.connect(other1).mint(other2.address, "1000");
        expect(await rfp.balanceOf(other2.address)).to.be.equal("1000");
      });
    });
  });

  describe("#enableMinter", () => {
    context("as owner", async () => {
      it("doesn't revert", async () => {
        await expect(rfp.connect(deployer).enableMinter(other1.address)).not.to
          .be.reverted;
      });
    });

    context("without owner role", () => {
      it("doesn't revert", async () => {
        await expect(
          rfp.connect(other1).enableMinter(other2.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });
});
