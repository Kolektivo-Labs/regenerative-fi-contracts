const { expect } = require("chai");

const amount = 1000;

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const [deployer, other1, other2] = await ethers.getSigners();
    await deployments.fixture(["RFP", "SimpleMinter", "RFNFT"]); // ensure you start from a fresh deployments
    const rfp = await ethers.getContract("RFP", deployer.address);
    const rfnft = await ethers.getContract("RFNFT", deployer.address);
    const simpleMinter = await ethers.getContract(
      "SimpleMinter",
      deployer.address
    );
    return {
      rfp,
      rfnft,
      simpleMinter,
      accounts: { deployer, other1, other2 },
    };
  }
);

describe("SimpleMinter", function () {
  let rfp, rfnft, simpleMinter, deployer, other1, other2;

  beforeEach("Deploy", async () => {
    ({
      rfp,
      rfnft,
      simpleMinter,
      accounts: { deployer, other1, other2 },
    } = await setupTest());
  });

  describe("#createAllocation", () => {
    context("without owner role", () => {
      it("reverts 'NoMinter()'", async function () {
        await expect(
          simpleMinter
            .connect(other1)
            .createAllocation([other2.address], [BigInt(amount)])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    context("with owner role", () => {
      let tx;

      beforeEach("create allocation", async () => {
        tx = simpleMinter
          .connect(deployer)
          .createAllocation([other2.address], [BigInt(amount)]);
      });

      it("emits an event 'NewAllocation'", async function () {
        await expect(tx).to.emit(simpleMinter, "NewAllocation");
      });

      it("sets the allocation for a claimer", async () => {
        await tx;
        expect(await simpleMinter.allocations(other2.address)).to.equal(amount);
      });
    });
  });

  describe("#claim", () => {
    beforeEach("set minter & create allocation", async () => {
      await rfp.enableMinter(simpleMinter.target);
      await simpleMinter
        .connect(deployer)
        .createAllocation([other2.address], [BigInt(amount)]);
    });

    beforeEach("mint nft", async () => {
      await rfnft.mint(other1.address);
      await rfnft.mint(other2.address);
    });

    context("without allocation", () => {
      it("reverts 'NoMinter()'", async function () {
        await expect(
          simpleMinter.claim(other1.address)
        ).to.be.revertedWithCustomError(simpleMinter, "InvalidZero");
      });
    });

    context("with allocation", () => {
      it("emits a Transfer event", async function () {
        await expect(simpleMinter.claim(other2.address)).to.emit(
          rfp,
          "Transfer"
        );
      });

      it("resets the allocation to zero'", async function () {
        await simpleMinter.claim(other2.address);
        expect(await simpleMinter.allocations(other2.address)).to.equal(0);
      });

      it("increases tha nft contract's balance'", async function () {
        await simpleMinter.claim(other2.address);
        expect(await rfp.balanceOf(rfnft.target)).to.equal(amount);
      });
    });
  });
});
