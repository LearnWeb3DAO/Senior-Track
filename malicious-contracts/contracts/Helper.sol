// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Helper {
    mapping(address => bool) userEligible;

    function isUserEligible(address user) public view returns (bool) {
        return userEligible[user];
    }

    function setUserEligible(address user) public {
        userEligible[user] = true;
    }

    fallback() external {}
}
