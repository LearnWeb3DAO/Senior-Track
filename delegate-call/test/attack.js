const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("delegatecall Attack", function () {
  it("Should change the owner of the Good contract", async function () {
    // Deploy the helper contract
    const Helper = await ethers.getContractFactory("Helper");
    const helperContract = await Helper.deploy();
    await helperContract.deployed();
    console.log("Helper Contract's Address:", helperContract.address);

    // Deploy the good contract
    const Good = await ethers.getContractFactory("Good");
    const goodContract = await Good.deploy(helperContract.address);
    await goodContract.deployed();
    console.log("Good Contract's Address:", goodContract.address);

    // Deploy the Attack contract
    const Attack = await ethers.getContractFactory("Attack");
    const attackContract = await Attack.deploy(goodContract.address);
    await attackContract.deployed();
    console.log("Attack Contract's Address", attackContract.address);

    // Now lets attack the good contract

    // Start the attack
    let tx = await attackContract.attack();
    await tx.wait();

    expect(await goodContract.owner()).to.equal(attackContract.address);
  });
});
