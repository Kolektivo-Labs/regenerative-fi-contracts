// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.19;

import {IRFP} from "./interfaces/IRFP.sol";
import {IRFNFT} from "./interfaces/IRFNFT.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleMinter is Ownable {

    error InvalidZero();
    error ArrayMismatch();
    error InvalidZeroAllocation();

    event NewAllocation(uint256 amountClaimers);

    // user => refi points allocation
    mapping(address => uint256) public allocations;
    
    IRFP immutable private _rfp;
    IRFNFT immutable private _rfnft;

    constructor(IRFP rfp, IRFNFT rfnft){
        _rfp = rfp;
        _rfnft = rfnft;
    }

    function claim(address account) public {
        uint256 alloc = allocations[account];
        // check if account has allocation
        if(alloc == 0) revert InvalidZero();
        // mint tokens to this contract, approve nft contract and call addPointsToToken
        _rfp.mint(address(this), alloc);
        _rfp.approve(address(_rfnft), alloc);
        uint256 tokenId = _rfnft.ownerTokenId(account);
        _rfnft.addPointsToToken(tokenId, alloc);
        // accounting: set allocation to zero
        allocations[account] = 0;
    }

    function createAllocation(address[] memory accounts, uint256[] memory amounts) onlyOwner external {
        if(accounts.length == 0) revert InvalidZeroAllocation();
        if(accounts.length != amounts.length) revert ArrayMismatch();

        for (uint256 i = 0; i < accounts.length; i++) {
            allocations[accounts[i]] += amounts[i];
        }

        emit NewAllocation(accounts.length);
    }
}