// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.19;

import {IRFP} from "./interfaces/IRFP.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleMinter is Ownable {

    error InvalidZeroAllocation();

    event NewAllocation(uint256 blockNumber);

    // user => refi points allocation
    mapping(address => uint256) public allocations;
    
    IRFP immutable private _rfp;

    constructor(IRFP rfp){
        _rfp = rfp;
    }

    function claim(address account) public {
        if(allocations[account] == 0) revert InvalidZeroAllocation();
        _rfp.mint(account, allocations[account]);
        allocations[account] = 0;
    }

    function createAllocation(address[] memory accounts, uint256[] memory amounts) onlyOwner external {
        for (uint256 i = 0; i < accounts.length; i++) {
            allocations[accounts[i]] += amounts[i];
        }
        emit NewAllocation(block.number);
    }
}