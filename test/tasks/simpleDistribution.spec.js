const { run } = require("hardhat");
const { expect } = require("chai");

const smallAllocation = "test-small";
const largeAllocation = "test-large";
const claimer = "0x5ACf124AD6333D3B23E391C37AA7B561d61Ec053";
const claimAmount = "2000000000000000000000";

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const [deployer, other1, other2] = await ethers.getSigners();
    await deployments.fixture(); // ensure you start from a fresh deployments
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

describe.only("task:create-alloc", function () {
  let rfp, rfnft, simpleMinter;

  before("Deploy & set minter", async () => {
    ({
      rfp,
      rfnft,
      simpleMinter,
      accounts: { deployer, other1, other2 },
    } = await setupTest());
    await rfp.enableMinter(simpleMinter.target);
  });

  context("with small allocation", () => {
    const claimers = 2;
    let txs;

    before("run task", async () => {
      ({ txs } = await run("task:create-alloc", {
        name: smallAllocation,
      }));
    });

    it("emits event", async () => {
      const tx = await txs[0].wait();
      const log = tx.logs[0];
      expect(log.eventName).to.equal("NewAllocation");
      expect(log.args[0]).to.equal(claimers);
    });

    it("allows claimer to claim", async () => {
      await rfnft.mint(claimer);
      await simpleMinter.claim(claimer);
      const tokenId = await rfnft.ownerTokenId(claimer);
      const tokenPoints = await rfnft.tokenIdPoints(tokenId);
      expect(tokenPoints).to.equal(claimAmount);
    });
  });

  context("with large allocation (870 recipients)", () => {
    let txs;

    before("run task", async () => {
      ({ txs } = await run("task:create-alloc", {
        name: largeAllocation,
      }));
    });

    it("splits the creation process in transactions à max 400 claimers", async () => {
      expect(txs.length).to.equal(3);

      const firstTx = await txs[0].wait();
      const firstLog = firstTx.logs[0];
      expect(firstLog.eventName).to.equal("NewAllocation");
      expect(firstLog.args[0]).to.equal(400);

      const secondTx = await txs[1].wait();
      const secondLog = secondTx.logs[0];
      expect(secondLog.eventName).to.equal("NewAllocation");
      expect(secondLog.args[0]).to.equal(400);

      const thirdTx = await txs[2].wait();
      const thirdLog = thirdTx.logs[0];
      expect(thirdLog.eventName).to.equal("NewAllocation");
      expect(thirdLog.args[0]).to.equal(70);
    });
  });
});
