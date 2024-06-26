// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract RFNFT is ERC721, Ownable {

    error OneTokenPerAddress();
    error InsufficientPoints();
    error InvalidZero();
    error InvalidTier();

    event NewTier(uint256, string);
    event LevelUp(uint256, uint256);
    event PointsAdded(uint256 tokenId, uint256 points);
    event ThresholdsSet(uint256[] thresholds);
    event UrisSet(string[] uris);

    // owner => tokenId
    mapping(address => uint256) public ownerTokenId;
    // tokenId => tier
    mapping(uint256 => uint256) public tokenIdTier;
    // tokenId => points
    mapping(uint256 => uint256) public tokenIdPoints;

    bool private _pointsTransferable = false;
    uint256[] private _tierThresholds;
    string[] private _tierUris;
    uint256 private _counter;
    IERC20 private _rfp;
    string constant private _baseUri = "ipfs://";

    constructor(IERC20 rfp, uint256[] memory thresholds, string[] memory uris) ERC721("ReFi NFT","RFNFT") {
        _rfp = rfp;
        for (uint256 i; i < thresholds.length; i++) {
            addTier(thresholds[i], uris[i]);
        }
    }

    function mint(address account) external {
        if(balanceOf(account) > 0) revert OneTokenPerAddress();
        _counter++;
        ownerTokenId[account] = _counter;
        tokenIdTier[_counter] = 1;
        _mint(account, _counter);
    }

    /// @notice Adds points from `msg.sender` to NFT held by `account`
    function feedToken(uint256 tokenId, uint256 amount) external {
        if(tokenId == 0) revert InvalidZero(); 
        uint256 oldBalance = tokenIdPoints[tokenId];
        uint256 newBalance = oldBalance + amount;

        tokenIdPoints[tokenId] = newBalance;

        _rfp.transferFrom(msg.sender, address(this), amount);
        
        emit PointsAdded(tokenId, amount);
    }

    function levelUp(uint256 tokenId) external {
        uint256 newTier;
        bool isLevelUp;
        if(tokenId == 0) revert InvalidZero();
        (isLevelUp, newTier) = canLevelUp(tokenId);
        if(!isLevelUp) revert InsufficientPoints(); 

        tokenIdTier[tokenId] = newTier;
        emit LevelUp(tokenId, newTier);
    }


    function addTier(uint256 threshold, string memory uri) public onlyOwner {
        _tierThresholds.push(threshold);
        _tierUris.push(uri);
        emit NewTier(threshold, uri);
    }

    function editTier(uint256 idx, uint256 threshold, string memory uri) external onlyOwner {
        _tierThresholds[idx] = threshold;
        _tierUris[idx] = uri;
    }

    // GETTERS

    function canLevelUp(uint256 tokenId) public view returns (bool, uint256) {
        uint256 points = tokenIdPoints[tokenId];
        uint256 currentTier = tokenIdTier[tokenId];
        uint256 newTier = _getTierQualification(points);
        return (newTier > currentTier, newTier);
    }

    function getOwnerTier(address account) external view returns (uint256 tier) {
        tier = tokenIdTier[ownerTokenId[account]];
    }

    function getOwnerPoints(address account) external view returns (uint256 tier) {
        tier = tokenIdPoints[ownerTokenId[account]];
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);
        uint256 tier = tokenIdTier[tokenId];
        return string(abi.encodePacked(_baseUri, _tierUris[tier - 1]));
    }
    
    function getTierThresholds() external view returns (uint256[] memory tierThresholds) {
        tierThresholds = new uint256[](_tierThresholds.length);

        for (uint256 i = 0; i < _tierThresholds.length; i++) {
            tierThresholds[i] = _tierThresholds[i];
        }
    }

    // PRIVATE FUNCTIONS

    function _getTierQualification(uint256 points) private view returns (uint256 tierIndex) {
        for (uint256 i; i < _tierThresholds.length; i++) {
            if (points >= _tierThresholds[i]) {
                tierIndex++;
            }
        }
    }
}