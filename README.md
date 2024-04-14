# Regenerative Finance Contracts

This project contains smart contracts as well hardhat tasks to interact with these contracts related to Regenerative Finance. While the core AMM logic is a fork of Balancer's v2 contracts, these contracts contain our points and NFT logic as well as auxiliary contracts related to the AMM.

## Get started

Install dependencies: `npm install`

Run tests: `npx hardhat test`

## Deploying

This project uses the plugin [https://github.com/facuspagnuolo/hardhat-local-networks-config-plugin](https://github.com/facuspagnuolo/hardhat-local-networks-config-plugin) for facilitating the secure storage of private keys. Please refer to the respective documentation to learn how private keys and RPC endpoints need to be stored.

Deploy all contracts: `npx hardhat --network <network> deploy`

Deploy only specific contracts: `npx hardhat --network deploy --tags <tag>`


