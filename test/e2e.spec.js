const path = require("path");
const fs = require("fs/promises");
const { run, ethers } = require("hardhat");
const { expect } = require("chai");

const THRESHOLDS = [500, 1000, 2000, 3000];
const claimer = "0x5ACf124AD6333D3B23E391C37AA7B561d61Ec053";
const claimAmount = "2000000000000000000000";
const distr1Name = "simple-test-1";

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const [deployer, other1, other2] = await ethers.getSigners();
    await deployments.fixture(); // ensure you start from a fresh deployments
    const rfnft = await ethers.getContract("RFNFT", deployer.address);
    const rfp = await ethers.getContract("RFP", deployer.address);
    const simpleMinter = await ethers.getContract(
      "SimpleMinter",
      deployer.address
    );
    return {
      rfnft,
      rfp,
      simpleMinter,
      accounts: { deployer, other1, other2 },
    };
  }
);

describe("Flow: Deploy > Alloc > Claim", function () {
  let rfnft, rfp, simpleMinter, deployer, other1, other2;
  let tx;

  before("Deploy", async () => {
    ({
      rfnft,
      rfp,
      simpleMinter,
      accounts: { deployer, other1, other2 },
    } = await setupTest());
  });

  before("Set minter on points contract", async () => {
    await rfp.enableMinter(simpleMinter.target);
  });

  before("Set tier thresholds on NFT", async () => {
    await rfnft.setThresholds(THRESHOLDS.map((t) => BigInt(t)));
  });

  before("create allocation", async () => {
    ({ tx } = await run("task:simple:create-alloc", {
      name: distr1Name,
    }));
  });

  describe("minting an nft", () => {
    before("mint nft", async () => {
      await rfnft.mint(claimer);
    });

    it("increases users nft balance", async () => {
      expect(await rfnft.balanceOf(claimer)).to.equal(1);
    });
  });

  describe("claiming points", () => {
    before("claim points", async () => {
      await simpleMinter.claim(claimer);
    });

    it("increases points held by claimer's token", async () => {
      const tokenId = await rfnft.ownerTokenId(claimer);
      expect(await rfnft.tokenIdPoints(tokenId)).to.equal(claimAmount);
    });
  });
});
