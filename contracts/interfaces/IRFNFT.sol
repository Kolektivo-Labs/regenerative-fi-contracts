pragma solidity 0.8.19;

interface IRFNFT {
    function mint(address, uint256) external;
    function addPointsToToken(uint256, uint256) external;
    function ownerTokenId(address) external returns (uint256);
}