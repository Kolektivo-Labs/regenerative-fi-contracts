const { ethers } = require("ethers");

function numsTo18Dec(nums) {
  return nums.map((num) => ethers.parseEther(num.toString()));
}

// CONFIG:

const subgraph = {
  optimism:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-optimism-v2",
  alfajores:
    "https://api.studio.thegraph.com/query/10166/balancer-rfi/version/latest",
  celo: "https://api.studio.thegraph.com/proxy/63886/refi-celo/version/latest",
};
const campaigns = {
  alphaWeeklySwapVolume: {
    thresholds: [0, 50, 250, 1000, 2500, 5000], // USD volumes
    points: numsTo18Dec([0, 5, 10, 20, 35, 50]), // assigned points
  },
};
const nftTiers = {
  pointThresholds: numsTo18Dec([0, 50, 250, 1000, 2500, 5000]),
  ipfsHashes: [
    "QmQeaUqw9SNXc1KzfLWDwXccBUr3uTdjhLJGDNZyAmDQMZ",
    "QmdTJAaf6Mhjs28yznELyaQ66mYXwMAXPgwWcre5fJ43VJ",
    "QmY85yz2EXvTN4aLsb9Xw26CBUD8PTrPGgBEoRBcJoGUTc",
    "QmfE9yEa3eeBN9vKHVsmzze1JeoWqsWJFazuFiVxUL1akW",
    "QmRqdmKQb21JiFaqddK3PATWdUE43i1gBXbiEXqSq38Bm8",
    "QmSxjsbQ2ZfAWDvbnenZnodUEAdX5U9DZ55F4fTDMriGaT",
  ],
};

module.exports = {
  subgraph,
  campaigns,
  nftTiers,
};
