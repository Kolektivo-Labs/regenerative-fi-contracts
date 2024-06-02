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
![My First Board - Frame 1 (1)](https://github.com/Kolektivo-Labs/regenerative-fi-contracts/assets/48454910/aa5a681c-cb3d-414b-a390-4ecdfc162162)

There are three contracts responsible to represent the points and NFT logic:

#### `RFNFT` (NFT)
RFNFT is an ERC721 contract. In addition to that it maintains an accounting for a given token how many RFP (ERC20) it holds and which tier it has reached. The tier determines the metadata url associated to a token. Upon deployment the contract is initiated with certain point thresholds which determine how many points are required to evolve a token to a given tier.

End users will only interact with the contract through two functions:
* when they mint an NFT through the `mint` function (a user can at max hold one NFT)
* when they level up their NFT through the `levelUp` function

There are a two permissioned functions to be operated by the protocol admin:
* `addTier` allows to add another tier with point threshold and metadata url to the contract
* `editTier` allows to edit the threshold and metadata url of a given tier

Note: if a user has already leveled up their token and the threshold is increased, the user will still keep their tier (= it is impossible to downgrade existing tokens)

The contract uses Openzeppelin's Ownable contract to manage permissions.

#### `RFP` (ERC20)
RFNFT is a plain ERC20 contract. It contains two permissioned functions (`enableMinter`, `disableMinter`) to be operated by the admin that allow to add and remove an address with minting capabilities. Beyond that it only contains a `mint` function which can only be called by an address that has been registered as minter. 

The contract uses Openzeppelin's Ownable contract to manage permissions.


#### `SimpleMinter` (Minter)
SimpleMinter is a super plain minter contract. It just keeps track of addresses and how much they are allowed to mint (via a simple mapping). A given address can call the `claim` function, the contract checks if the caller has points to claim and if so mints them to the NFT contract which associates it with the token held by the caller. If the user doesn't have an NFT yet, the `claim` function will mint one to them.

On the other side, the protocol admin can add new points allocations by calling the `createAllocation` function. For a given user, any new allocations will be added to their existing ones.

The contract uses Openzeppelin's Ownable contract to manage permissions.

### Points and NFTs: Scripts
To push a new points allocation based on swap volumes onchain the admin needs to execute two tasks:

#### `task:get-data`: Pulling transaction data and calculating allocations
Run this task by executing the following command in the console:

`npx hardhat --network <network_name> task:get-data`

It will pull from the subgraph (= standard balancer subgraph) the swap data for the last epoch and based on predefined thresholds calculate how much RFP each user is eligible to claim. An epoch lasts for a week and starts and ends at midnight between Wednesday and Thursday. If you add the `current` flag (like so `npx hardhat --network <network_name> task:get-data --current true`) the task calculates the points allocation for the currently ongoing epoch. The task stores the allocation data as a JSON file in `data/<network_name>/` and follows the following naming convention: `<unix_timestamp_start_epoch>-<unix_timestamp_end_epoch>.json`.

#### `task:create-alloc`: Pushing an allocation onchain
Run this task by executing the following command in the console:

`npx hardhat --network <network_name> task:create-alloc --name <filename_of_allocation>`

It will parse the allocation JSON file and call the `createAllocation` function on the SimpleMinter with the allocation data. To consider gas limits, if there are more than 400 eligible addresses, the task will batch the transactions (max 400 addresses per tx).


## Deploying contracts

This project uses the plugin [https://github.com/facuspagnuolo/hardhat-local-networks-config-plugin](https://github.com/facuspagnuolo/hardhat-local-networks-config-plugin) for facilitating the secure storage of private keys. Please refer to the respective documentation to learn how private keys and RPC endpoints need to be stored.

Deploy all contracts: `npx hardhat --network <network> deploy`

Deploy only specific contracts: `npx hardhat --network deploy --tags <tag>`

