require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("hardhat-local-networks-config-plugin");

require("./tasks/createAlloc");
require("./tasks/debug");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  mocha: {
    timeout: 600000,
  },
  solidity: {
    compilers: [
      {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 9999,
          },
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 9999,
          },
        },
      },
    ],
  },
  vyper: {
    compilers: [{ version: "0.3.1" }, { version: "0.3.3" }],
  },
  warnings: {
    "*": {
      "shadowing-opcode": "off",
      default: "error",
    },
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.ALFAJORES_API_KEY,
      celo: process.env.CELO_API_KEY,
    },
    customChains: [
      {
        network: "zkemv",
        chainId: 1101,
        urls: {
          apiURL: "https://api-zkevm.polygonscan.com/api",
          browserURL: "https://zkevm.polygonscan.com/",
        },
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/",
        },
      },
      {
        network: "fantom",
        chainId: 250,
        urls: {
          apiURL: "https://api.ftmscan.com/api",
          browserURL: "https://ftmscan.com",
        },
      },
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
    ],
  },
  networks: {
    celo: {
      url: "https://forno.celo.org", 
      accounts: [process.env.PRIVATE_KEY], 
      chainId: 42220, 
    },
  },
};
