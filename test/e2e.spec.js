const { run } = require("hardhat");
const { expect } = require("chai");

const claimer = "0x5ACf124AD6333D3B23E391C37AA7B561d61Ec053";
const claimAmount = "200000000000000000000";
const distr1Name = "test-small";

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
  let rfnft, simpleMinter, tokenId;

  before("Deploy", async () => {
    ({
      rfnft,
      rfp,
      simpleMinter,
      accounts: { deployer, other1, other2 },
    } = await setupTest());
  });

  before("create allocation", async () => {
    ({ tx } = await run("task:create-alloc", {
      name: distr1Name,
    }));
  });

  describe("minting an nft", () => {
    before("mint nft", async () => {
      await rfnft.mint(claimer);
      tokenId = await rfnft.ownerTokenId(claimer);
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
      expect(await rfnft.tokenIdPoints(tokenId)).to.equal(claimAmount);
    });
  });

  describe("levelling up", () => {
    const expectedTier = 2;

    before("level up", async () => {
      await rfnft.levelUp(tokenId);
    });

    it("evolves claimer's token", async () => {
      expect(await rfnft.tokenIdTier(tokenId)).to.equal(expectedTier);
    });
  });
});
