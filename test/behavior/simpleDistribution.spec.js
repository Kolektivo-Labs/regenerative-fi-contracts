const path = require("path");
const fs = require("fs/promises");
const { run, ethers } = require("hardhat");
const { expect } = require("chai");

const claimer = "0x5ACf124AD6333D3B23E391C37AA7B561d61Ec053";
const claimAmount = "2000000000000000000000";
const distr1Name = "simple-test-1";

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const [deployer, other1, other2] = await ethers.getSigners();
    await deployments.fixture(["RFP", "SimpleMinter"]); // ensure you start from a fresh deployments
    const rfp = await ethers.getContract("RFP", deployer.address);
    const simpleMinter = await ethers.getContract(
      "SimpleMinter",
      deployer.address
    );
    return {
      rfp,
      simpleMinter,
      accounts: { deployer, other1, other2 },
    };
  }
);

describe("Simple distribution flow", function () {
  let rfp, simpleMinter, deployer, other1, other2;

  before("Deploy & set minter", async () => {
    ({
      rfp,
      simpleMinter,
      accounts: { deployer, other1, other2 },
    } = await setupTest());
    await rfp.enableMinter(simpleMinter.target);
  });

  context("first epoch", () => {
    before("setup allocation", async () => {
      ({ tx } = await run("task:simple:create-alloc", {
        name: distr1Name,
      }));
    });

    it("lets claimant claim", async () => {
      await simpleMinter.claim(claimer);
      expect(await rfp.balanceOf(claimer)).to.equal(BigInt(claimAmount));
    });
  });
});
