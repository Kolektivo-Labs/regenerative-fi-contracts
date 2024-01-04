const { expect } = require("chai");

const THRESHOLDS = [500, 1000, 2000, 3000];

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const [deployer, other1, other2] = await ethers.getSigners();
    await deployments.fixture(["RFNFT", "RFP"]); // ensure you start from a fresh deployments
    const rfnft = await ethers.getContract("RFNFT", deployer.address);
    await rfnft.setThresholds(THRESHOLDS.map((t) => BigInt(t)));
    const rfp = await ethers.getContract("RFP", deployer.address);
    return {
      rfnft,
      rfp,
      accounts: { deployer, other1, other2 },
    };
  }
);

describe("RFNFT", function () {
  let rfnft, rfp, deployer, other1, other2;

  beforeEach("Deploy", async () => {
    ({
      rfnft,
      rfp,
      accounts: { deployer, other1, other2 },
    } = await setupTest());
  });

  describe("#mint", () => {
    beforeEach("mint", async () => {
      await rfnft.connect(other1).mint(other1.address);
    });

    context("when minter has no NFT yet", () => {
      it("mints an NFT", async () => {
        expect(await rfnft.balanceOf(other1.address)).to.equal(1);
      });

      it("initializes the NFT at tier 1", async () => {
        expect(await rfnft.getOwnerTier(other1.address)).to.equal(1);
      });
    });

    context("when minter already has NFT", () => {
      it("reverts 'OneTokenPerAddress'", async () => {
        await expect(
          rfnft.connect(other1).mint(other1.address)
        ).to.be.revertedWithCustomError(rfnft, "OneTokenPerAddress");
      });
    });
  });

  describe("#addPoints", () => {
    const smallAmount = 100;
    const largeAmount = 1000;
    const tokenId = 1;

    beforeEach("mint & approve RFP", async () => {
      await rfp.enableMinter(deployer.address);
      await rfp.mint(other1.address, smallAmount);
      await rfp.connect(other1).approve(rfnft.target, 1000000000000000);
    });

    context("when recipient doesn't hold NFT", () => {
      it("reverts 'OwnerNotFound'", async () => {
        await expect(
          rfnft.connect(other1).addPoints(other1.address)
        ).to.be.revertedWithCustomError(rfnft, "OwnerNotFound");
      });
    });

    context("when recipient holds NFT", () => {
      let addFewPointsTx, addManyPointsTx;

      beforeEach("mint nft", async () => {
        await rfnft.connect(other1).mint(other1.address);
      });

      beforeEach("add points", async () => {
        addFewPointsTx = rfnft.connect(other1).addPoints(other1.address);
      });

      it("emits an event 'PointsAdded'", async () => {
        await expect(addFewPointsTx)
          .to.emit(rfnft, "PointsAdded")
          .withArgs(tokenId, smallAmount);
      });

      it("adds the points to the recipient's NFT", async () => {
        await addFewPointsTx;
        expect(await rfnft.tokenIdPoints(tokenId)).to.equal(smallAmount);
      });

      it("doesn't change the tier of the NFT", async () => {
        await addFewPointsTx;
        expect(await rfnft.tokenIdTier(tokenId)).to.equal(0);
      });

      context("when new addition pushes NFT balance to next tier", () => {
        beforeEach("mint large amount", async () => {
          await addFewPointsTx;
          await rfp.mint(other1.address, largeAmount);
          addManyPointsTx = rfnft.connect(other1).addPoints(other1.address);
        });

        it("increases the tier of the NFT", async () => {
          await addManyPointsTx;
          expect(await rfnft.tokenIdTier(tokenId)).to.equal(2);
        });
      });
    });
  });
});
