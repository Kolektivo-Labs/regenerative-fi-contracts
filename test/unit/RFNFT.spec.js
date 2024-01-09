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

  describe("#feedToken", () => {
    const smallAmount = 100;
    const largeAmount = 1000;

    beforeEach("mint & approve RFP", async () => {
      await rfp.enableMinter(deployer.address);
      await rfp.mint(other1.address, smallAmount);
      await rfp.connect(other1).approve(rfnft.target, 1000000000000000);
    });

    context("when recipient doesn't hold NFT", () => {
      it("reverts 'InvalidZero'", async () => {
        await expect(
          rfnft.connect(other1).feedToken(0, smallAmount)
        ).to.be.revertedWithCustomError(rfnft, "InvalidZero");
      });
    });

    context("when recipient holds NFT", () => {
      let addFewPointsTx, addManyPointsTx, tokenId;

      beforeEach("mint nft", async () => {
        await rfnft.connect(other1).mint(other1.address);
        tokenId = await rfnft.ownerTokenId(other1.address);
      });

      beforeEach("add points", async () => {
        addFewPointsTx = rfnft.connect(other1).feedToken(tokenId, smallAmount);
      });

      it("emits an event 'PointsAdded'", async () => {
        await expect(addFewPointsTx)
          .to.emit(rfnft, "PointsAdded")
          .withArgs(tokenId, smallAmount, 0);
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
          addManyPointsTx = rfnft
            .connect(other1)
            .feedToken(tokenId, largeAmount);
        });

        it("increases the tier of the NFT", async () => {
          await addManyPointsTx;
          expect(await rfnft.tokenIdTier(tokenId)).to.equal(2);
        });
      });
    });
  });

  describe("#setUris", () => {
    context("as non-owner", async () => {
      it("reverts ''", async () => {
        await expect(rfnft.connect(other1).setUris([])).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });

    context("when number of uris is UNEQUAL to number of thresholds", () => {
      const uris = ["QmTtDqWzo179ujTXU7pf2PodLNjpcpQQCXhkiQXi6wZvKd"];

      it("reverts with error 'ArrayMismatch'", async () => {
        await expect(rfnft.setUris(uris)).to.be.revertedWithCustomError(
          rfnft,
          "ArrayMismatch"
        );
      });
    });

    context("when number of uris is EQUAL to number of thresholds", () => {
      const uris = [
        "QmTtDqWzo179ujTXU7pf2PodLNjpcpQQCXhkiQXi6wZvKd",
        "QmTtDqWzo179ujTXU7pf2PodLNjpcpQQCXhkiQXi6wZvKe",
        "QmTtDqWzo179ujTXU7pf2PodLNjpcpQQCXhkiQXi6wZvKf",
        "QmTtDqWzo179ujTXU7pf2PodLNjpcpQQCXhkiQXi6wZvKg",
      ];
      const amount = 499;
      const additionalAmount = 10;

      let tokenId;

      beforeEach("set uris", async () => {
        await rfnft.setUris(uris);
      });

      beforeEach("mint tokens & approve", async () => {
        await rfp.enableMinter(deployer.address);
        await rfnft.mint(deployer.address);
        await rfp.mint(deployer.address, amount + additionalAmount);
        await rfp.approve(rfnft.target, amount + additionalAmount);
        tokenId = await rfnft.ownerTokenId(deployer.address);
      });

      context("with token in first tier", () => {
        beforeEach("add points to token", async () => {
          await rfnft.feedToken(tokenId, amount);
          const tokenPoints = await rfnft.tokenIdPoints(tokenId);
          expect(tokenPoints).to.equal(amount);
        });

        it("returns the uri for the first tier", async () => {
          const uri = await rfnft.tokenURI(tokenId);
          expect(uri).to.equal("ipfs://" + uris[0]);
        });
      });

      context("with token in second tier", () => {
        beforeEach("add points to token", async () => {
          await rfnft.feedToken(tokenId, amount + additionalAmount);
          const tokenPoints = await rfnft.tokenIdPoints(tokenId);
          expect(tokenPoints).to.equal(amount + additionalAmount);
        });

        it("returns the uri for the second tier", async () => {
          const uri = await rfnft.tokenURI(tokenId);
          expect(uri).to.equal("ipfs://" + uris[1]);
        });
      });
    });
  });

  describe("#setThresholds", () => {
    context("when called by non-owner", () => {
      it("reverts 'Ownable: caller is not the owner'", async () => {
        await expect(
          rfnft.connect(other1).setThresholds([])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#editTier", () => {
    context("when called by non-owner", () => {
      it("reverts 'Ownable: caller is not the owner'", async () => {
        await expect(
          rfnft.connect(other1).editTier(0, 100, "abc")
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });
});
