// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract RFP is ERC20, Ownable {

    error NoMinter();

    // minter => yes/no
    mapping(address => bool) minters;

    constructor() ERC20("ReFi Points","RFP") {}

    function mint(address account, uint256 amount) public {
        if (minters[msg.sender] == false) revert NoMinter();
        _mint(account, amount);
    }

    function enableMinter(address account) onlyOwner external {
        minters[account] = true;
    }

    function disableMinter(address account) onlyOwner external {
        minters[account] = false;
    }
}