// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";


// every address can only own one NFT


contract RFNFT is ERC721, Ownable {

    error OneTokenPerAddress();
    error InvalidZero();

    event PointsAdded(uint256 tokenId, uint256 points, uint256 newTier);
    event ThresholdsSet(uint256[] thresholds);

    // owner => tokenId
    mapping(address => uint256) public ownerTokenId;
    // tokenId => tier
    mapping(uint256 => uint256) public tokenIdTier;
    // tokenId => points
    mapping(uint256 => uint256) public tokenIdPoints;

    bool private _pointsTransferable = false;
    uint256[] private _tierThresholds;
    uint256 private _counter;
    IERC20 private _rfp;

    constructor(IERC20 rfp, uint256[] memory thresholds) ERC721("ReFi NFT","RFNFT") {
        _rfp = rfp;
        setThresholds(thresholds);
    }

    function mint(address account) public {
        if(balanceOf(account) > 0) revert OneTokenPerAddress();
        _counter++;
        ownerTokenId[account] = _counter;
        tokenIdTier[_counter] = 1;
        _mint(account, _counter);
    }

    /// @notice Adds points from `msg.sender` to NFT held by `account`
    function addPointsToToken(uint256 tokenId, uint256 amount) public {
        if(tokenId == 0) revert InvalidZero(); 
        uint256 oldBalance = tokenIdPoints[tokenId];
        uint256 newBalance = oldBalance + amount;
        uint256 newTier = _getTierQualification(newBalance);

        tokenIdTier[tokenId] = newTier;
        tokenIdPoints[tokenId] = newBalance;

        _rfp.transferFrom(msg.sender, address(this), amount);
        
        emit PointsAdded(tokenId, amount, newTier);
    }

    function getOwnerTier(address account) public view returns (uint256 tier) {
        tier = tokenIdTier[ownerTokenId[account]];
    }

    function _getTierQualification(uint256 points) private view returns (uint256 tierIndex) {
        for (uint256 i; i < _tierThresholds.length; i++) {
            if (points >= _tierThresholds[i]) {
                tierIndex++;
            }
        }
    }

    function setThresholds(uint256[] memory tierThresholds) public onlyOwner {
        delete _tierThresholds;
        for (uint256 i; i < tierThresholds.length; i++) {
            _tierThresholds.push(tierThresholds[i]);
        }
        emit ThresholdsSet(tierThresholds);
    }
}