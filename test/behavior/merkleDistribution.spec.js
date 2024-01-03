const path = require("path");
const fs = require("fs/promises");
const { run, ethers } = require("hardhat");
const { expect } = require("chai");

const mockAddress = "0x5ACf124AD6333D3B23E391C37AA7B561d61Ec053";
const abiEncoder = ethers.AbiCoder.defaultAbiCoder();
const distr1Name = "test-1";
const distr1Claimer1 = "test-1";
const distr2Name = "test-2";

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const [deployer, other1, other2] = await ethers.getSigners();
    await deployments.fixture(["RFP", "MerkleOrchard"]); // ensure you start from a fresh deployments
    const merkleOrchard = await ethers.getContract(
      "ReFiMerkleOrchard",
      deployer.address
    );
    return {
      merkleOrchard,
      accounts: { deployer, other1, other2 },
    };
  }
);

describe("Merkle distribution flow", function () {
  let merkleOrchard, accounts;
  let tx, jsTree, totalAmount, rfpAddress;

  before("Deploy", async () => {
    ({ merkleOrchard, accounts } = await setupTest());
  });

  describe("first epoch", async () => {
    describe("task:merkle:create-alloc", () => {
      context("without owner role", () => {
        it("reverts 'BAL#426 (CALLER_IS_NOT_OWNER)'", async () => {
          await expect(
            merkleOrchard
              .connect(accounts.other1)
              .createRfpDistribution(ethers.encodeBytes32String("abc"), "0")
          ).to.be.revertedWith("BAL#426");
        });
      });

      context("with owner role", () => {
        before("run task to create distribution", async () => {
          ({ tx, jsTree, totalAmount } = await run("task:merkle:create-alloc", {
            name: distr1Name,
          }));
          rfpAddress = (await ethers.getContract("RFP")).target;
        });

        it("emits the event DistributionAdded with correct parameters", async () => {
          const receipt = await tx.wait();
          const [log] = receipt.logs;
          expect(log.eventName).to.be.equal("DistributionAdded");
          const [distributor, token, distributionId, merkleRoot, amount] =
            log.args;
          expect(distributor).to.be.equal(merkleOrchard.target);
          expect(token).to.be.equal(rfpAddress);
          expect(distributionId).to.be.equal("0");
          expect(merkleRoot).to.be.equal(jsTree.getHexRoot());
          expect(amount).to.be.equal(totalAmount);
        });
      });
    });

    describe("claiming", () => {
      describe("task:utils:claim-args", () => {
        it("returns the correct arguments for calling claim fn", async () => {
          const claimArgs = await run("task:utils:claim-args", {
            name: "test-1",
            address: mockAddress,
          });
          const claim = claimArgs[0];
          expect(claim.distributionId).to.equal("0");
          expect(claim.balance).to.equal("2000000000000000000000");
          expect(claim.distributor).to.equal(merkleOrchard.target);
          expect(claim.tokenIndex).to.equal(0);
          expect(claim.merkleProof).to.eql([
            "0x2133d09f6ab6d3adef46841411a8ae779aa962914967be24fc01247749803935",
          ]);
        });
      });

      // describe("task:merkle:claim", () => {
      //   it("transfers claimable amount to claimer", async () => {
      //     await run("task:merkle:claim", {
      //       name: "test-1",
      //       address: mockAddress,
      //     });
      //   });
      // });
    });
  });
});
