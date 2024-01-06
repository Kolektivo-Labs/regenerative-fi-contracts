pragma solidity 0.8.19;

interface IRFP {
    function mint(address, uint256) external;
    function approve(address spender, uint256 amount) external returns (bool);
}