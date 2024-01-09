const { expect } = require("chai");
const { ethers } = require("ethers");
const { nftTiers } = require("../../config.js");

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const [deployer, other1, other2] = await ethers.getSigners();
    await deployments.fixture(["RFNFT", "RFP"]); // ensure you start from a fresh deployments
    const rfnft = await ethers.getContract("RFNFT", deployer.address);
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
    const smallAmount = ethers.parseEther("10");
    const largeAmount = ethers.parseEther("1000");

    beforeEach("mint & approve RFP", async () => {
      await rfp.enableMinter(deployer.address);
      await rfp.mint(other1.address, smallAmount);
      await rfp
        .connect(other1)
        .approve(rfnft.target, ethers.parseEther("99999999999"));
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

      context("with small amount of points added", () => {
        const firstTier = 1;

        beforeEach("add points", async () => {
          addFewPointsTx = rfnft
            .connect(other1)
            .feedToken(tokenId, smallAmount);
        });

        it("emits an event 'PointsAdded'", async () => {
          await expect(addFewPointsTx)
            .to.emit(rfnft, "PointsAdded")
            .withArgs(tokenId, smallAmount, firstTier);
        });

        it("adds the points to the recipient's NFT", async () => {
          await addFewPointsTx;
          expect(await rfnft.tokenIdPoints(tokenId)).to.equal(smallAmount);
        });

        it("doesn't change the tier of the NFT", async () => {
          expect(await rfnft.tokenIdTier(tokenId)).to.equal(firstTier);
          await addFewPointsTx;
          expect(await rfnft.tokenIdTier(tokenId)).to.equal(firstTier);
        });
      });

      context("when new addition pushes NFT balance to next tier", () => {
        const fourthTier = 4;

        beforeEach("mint large amount", async () => {
          await addFewPointsTx;
          await rfp.mint(other1.address, largeAmount);
          addManyPointsTx = rfnft
            .connect(other1)
            .feedToken(tokenId, largeAmount);
        });

        it("increases the tier of the NFT", async () => {
          await addManyPointsTx;
          expect(await rfnft.tokenIdTier(tokenId)).to.equal(fourthTier);
        });

        it("changes the metadata uri that is returned for that token", async () => {
          expect(await rfnft.tokenURI(tokenId)).to.equal(
            "ipfs://" + nftTiers.ipfsHashes[0]
          );
          await addManyPointsTx;
          expect(await rfnft.tokenURI(tokenId)).to.equal(
            "ipfs://" + nftTiers.ipfsHashes[3]
          );
        });
      });
    });
  });

  describe("#addTier", () => {
    const newTier = {
      threshold: ethers.parseEther("3000"),
      uri: "QmTtDqWzo179ujTXU7pf2PodLNjpcpQQCXhkiQXi6wZvKd",
    };

    context("as non-owner", async () => {
      it("reverts 'Ownable: caller is not the owner'", async () => {
        await expect(
          rfnft.connect(other1).addTier(newTier.threshold, newTier.uri)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    context("as owner", () => {
      it("emits event", async () => {
        await expect(rfnft.addTier(newTier.threshold, newTier.uri))
          .to.emit(rfnft, "NewTier")
          .withArgs(newTier.threshold, newTier.uri);
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
