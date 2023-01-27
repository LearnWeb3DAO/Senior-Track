const { ethers, waffle } = require("hardhat");
const { expect } = require("chai");
const { BigNumber, utils } = require("ethers");

describe("Attack", function () {
  it("Should be able to guess the exact number", async function () {
    // Deploy the Game contract
    const Game = await ethers.getContractFactory("Game");
    const game = await Game.deploy({ value: utils.parseEther("0.1") });
    await game.deployed();

    console.log("Game contract address", game.address);

    // Deploy the attack contract
    const Attack = await ethers.getContractFactory("Attack");
    const attack = await Attack.deploy(game.address);

    console.log("Attack contract address", attack.address);

    // Attack the Game contract
    const tx = await attack.attack();
    await tx.wait();

    const balanceGame = await game.getBalance();
    // Balance of the Game contract should be 0
    expect(balanceGame).to.equal(BigNumber.from("0"));
  });
});
