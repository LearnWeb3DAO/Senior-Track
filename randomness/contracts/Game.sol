// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Game {
    constructor() payable {}

    // Randomly picks a number out of `0 to 2²⁵⁶–1`.
    function pickACard() private view returns (uint256) {
        // `abi.encodePacked` takes in the two params - `blockhash` and `block.timestamp`
        // and returns a byte array which further gets passed into keccak256 which returns `bytes32`
        // which is further converted to a `uint`.
        // keccak256 is a hashing function which takes in a bytes array and converts it into a bytes32
        uint256 pickedCard = uint256(
            keccak256(
                abi.encodePacked(blockhash(block.number), block.timestamp)
            )
        );
        return pickedCard;
    }

    // It begins the game by first choosing a random number by calling `pickACard`
    // It then verifies if the random number selected is equal to `_guess` passed by the player
    // If the player guessed the correct number, it sends the player `0.1 ether`
    function guess(uint256 _guess) public {
        uint256 _pickedCard = pickACard();
        if (_guess == _pickedCard) {
            (bool sent, ) = msg.sender.call{value: 0.1 ether}("");
            require(sent, "Failed to send ether");
        }
    }

    // Returns the balance of ether in the contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
