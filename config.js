module.exports = {
  subgraph: {
    optimism:
      "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-optimism-v2",
  },
  campaigns: {
    alpha: {
      thresholds: [0, 50, 250, 1000, 2500, 5000],
      points: [0, 5, 10, 20, 35, 50],
    },
  },
};
