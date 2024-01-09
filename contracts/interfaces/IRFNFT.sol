pragma solidity 0.8.19;

interface IRFNFT {
    function mint(address, uint256) external;
    function feedToken(uint256, uint256) external;
    function ownerTokenId(address) external returns (uint256);
}