// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./LW3NFT.sol";

contract LW3NFT2 is LW3NFT {
    function test() public pure returns (string memory) {
        return "upgraded";
    }
}
