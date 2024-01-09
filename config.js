const { numsTo18Dec } = require("./tasks/utils.js");

const subgraph = {
  optimism:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-optimism-v2",
};
const campaigns = {
  alphaWeeklySwapVolume: {
    thresholds: [0, 50, 250, 1000, 2500, 5000], // USD volumes
    points: numsTo18Dec([0, 5, 10, 20, 35, 50]), // assigned points
  },
};
const nftTiers = {
  pointThresholds: numsTo18Dec([0, 50, 250, 1000, 2500, 5000]),
};

module.exports = {
  subgraph,
  campaigns,
  nftTiers,
};
