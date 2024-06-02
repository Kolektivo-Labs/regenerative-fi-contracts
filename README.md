# Regenerative Finance Contracts

While the AMM contracts of Regenerative Finance are a fork of Balancer's v2 contracts, this repository contains auxiliary contracts as well as scripts to interact with these. 

This project aims to fulfill three goals:
1. Onchain points and NFT logic for Regenerative Finance
2. Scripts to calculate point allocation and to post them onchain
3. Custom rate-provider contracts required for Balancer's Composable Stable Pools

## Get started

Install dependencies: `npm install`

Run tests: `npx hardhat test`

## Overview

### Points and NFTs: Contracts
My First Board - Frame 1 (1)

There are three contracts responsible to represent the points and NFT logic:

#### RFNFT
RFNFT is an ERC721 contract. In addition to that it maintains an accounting for a given token how many RFP (ERC20) it holds and which tier it has reached. The tier determines the metadata url associated to a token. Upon deployment the contract is initiated with certain point thresholds which determine how many points are required to evolve a token to a given tier.

End users will only interact with the contract through two functions:
* when they mint an NFT through the `mint` function (a user can at max hold one NFT)
* when they level up their NFT through the `levelUp` function

There are a two permissioned functions to be operated by the protocol admin:
* `addTier` allows to add another tier with point threshold and metadata url to the contract
* `editTier` allows to edit the threshold and metadata url of a given tier
Note: if a user has already leveled up their token and the threshold is increased, the user will still keep their tier (= it is impossible to downgrade existing tokens)


#### RNFT
RFNFT is an ERC721 contract.

#### Points and NFTs


## Deploying contracts

This project uses the plugin [https://github.com/facuspagnuolo/hardhat-local-networks-config-plugin](https://github.com/facuspagnuolo/hardhat-local-networks-config-plugin) for facilitating the secure storage of private keys. Please refer to the respective documentation to learn how private keys and RPC endpoints need to be stored.

Deploy all contracts: `npx hardhat --network <network> deploy`

Deploy only specific contracts: `npx hardhat --network deploy --tags <tag>`

