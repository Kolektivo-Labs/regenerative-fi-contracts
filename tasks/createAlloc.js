const fs = require("fs/promises");
const path = require("path");
const { subgraph } = require("../config.js");
const { getEpoch, getPointsAllocation } = require("./utils.js");
const axios = require("axios");

task("task:create-alloc", "Creates allocation")
  .addParam("name", "Filename of JSON in ./data")
  .setAction(async ({ name }, { ethers, network }) => {
    console.log("TASK: post points allocation onchain");
    console.log(`Creating distribution for /data/${network.name}/${name}.json`);
    const dataPath = path.join(
      __dirname,
      `../data/${network.name}/${name}.json`
    );
    const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));

    const accounts = [];
    const amounts = [];
    for (let i = 0; i < data.length; i++) {
      const [account, amount] = data[i];
      accounts.push(account);
      amounts.push(BigInt(amount));
    }

    const chunkSize = 400;
    const args = [];
    for (let i = 0; i < accounts.length; i += chunkSize) {
      const accountsChunk = accounts.slice(i, i + chunkSize);
      const amountsChunk = amounts.slice(i, i + chunkSize);
      args.push([accountsChunk, amountsChunk]);
    }

    const txs = [];
    const simpleMinter = await ethers.getContract("SimpleMinter");
    for (let i = 0; i < args.length; i++) {
      const tx = await simpleMinter.createAllocation(args[i][0], args[i][1]);
      txs.push(tx);
      console.log(
        `Created distribution with ${args[i][0].length} recipients at tx: `,
        tx.hash
      );
    }

    return { txs };
  });

task(
  "task:get-data",
  "Pulls swap data from subgraph and creates JSON file w/ alloc"
).setAction(async (_, { ethers, network }) => {
  const campaignName = "alphaWeeklySwapVolume";
  console.log(
    `\nTASK: retrieve subgraph data, compute and store points allocation for alpha campaign for network ${network.name}`
  );

  if (!subgraph[network.name])
    throw Error(`No subgraph endpoint defined for ${network.name}`);

  console.log(`Fetching swap data from subgraph ${subgraph[network.name]} ...`);
  const { epochStart, epochEnd } = getEpoch();

  let data = [];
  let timestamp = epochStart;
  let lastId = "";
  while (true) {
    const query = `query WeeklySwaps {
      swaps(where: {timestamp_gte: ${timestamp}, timestamp_lte: ${epochEnd}}, first: 1000, order_by: timestamp) {
        valueUSD
        timestamp
        id
        userAddress {
          id
        }
      }
    }`;
    try {
      const response = await axios.post(subgraph[network.name], {
        query: query,
      });
      if (response.data.data) {
        const { swaps } = response.data.data;
        data = [...data, ...swaps];
        const lastIdx = swaps.length - 1;
        timestamp = swaps[lastIdx].timestamp;
        if (lastId === swaps[lastIdx].id) break;
        lastId = swaps[lastIdx].id;
      } else {
        console.log(response.data.errors);
      }
    } catch (e) {
      console.log(e);
    }
  }
  console.log("# swaps: ", data.length);

  console.log("Processing data...");
  const parsedData = data.map((d) => ({
    valueUSD: parseInt(d.valueUSD),
    userAddress: d.userAddress.id,
  }));
  const aggregatedSwapData = {};
  parsedData.map(({ userAddress, valueUSD }) => {
    if (!aggregatedSwapData[userAddress]) {
      aggregatedSwapData[userAddress] = valueUSD;
    } else {
      aggregatedSwapData[userAddress] += valueUSD;
    }
  });
  console.info(
    "# unique swap addresses: ",
    Object.keys(aggregatedSwapData).length
  );
  console.info(
    "# total swap volume (USD): ",
    Object.values(aggregatedSwapData).reduce((a, b) => a + b, 0)
  );

  console.log("Assigning points...");
  const pointAllocations = {};
  let totalPoints = 0;
  for (const userAddress in aggregatedSwapData) {
    const swapVolume = aggregatedSwapData[userAddress];
    const allocation = getPointsAllocation(swapVolume, campaignName);
    if (allocation > 0) {
      totalPoints += allocation;
      pointAllocations[userAddress] = ethers
        .parseEther(allocation.toString())
        .toString();
    }
  }
  console.info(
    "# unique point recipients: ",
    Object.keys(pointAllocations).length
  );
  console.info("# total points allocated: ", totalPoints);

  console.log("Storing allocation as JSON");
  const content = JSON.stringify(Object.entries(pointAllocations));
  const contentPath = path.join(
    __dirname,
    `../data/${network.name}/${epochEnd}.json`
  );
  await fs.writeFile(contentPath, content);

  console.log(
    "# stored allocation to: ",
    `../data/${network.name}/${epochEnd}.json`
  );
});
