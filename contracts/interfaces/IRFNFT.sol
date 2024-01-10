pragma solidity 0.8.19;

interface IRFNFT {
    function mint(address) external;
    function feedToken(uint256, uint256) external;
    function ownerTokenId(address) external returns (uint256);
    function balanceOf(address) external returns (uint256);
}