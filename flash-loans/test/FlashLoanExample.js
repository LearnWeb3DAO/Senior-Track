const { expect, assert } = require("chai");
const hre = require("hardhat");

const { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } = require("../config");

describe("Flash Loans", function () {
  it("Should take a flash loan and be able to return it", async function () {
    const FlashLoanExample = await hre.ethers.getContractFactory(
      "FlashLoanExample"
    );

    // Deploy our FlashLoanExample smart contract
    const flashLoanExample = await FlashLoanExample.deploy(
      // Address of the PoolAddressProvider: you can find it here: https://docs.aave.com/developers/deployed-contracts/v3-mainnet/polygon
      POOL_ADDRESS_PROVIDER
    );
    await flashLoanExample.deployed();

    // Fetch the DAI smart contract
    const token = await ethers.getContractAt("IERC20", DAI);

    // Move 2000 DAI from DAI_WHALE to our contract by impersonating them
    const BALANCE_AMOUNT_DAI = ethers.utils.parseEther("2000");
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });
    const signer = await ethers.getSigner(DAI_WHALE);
    await token
      .connect(signer)
      .transfer(flashLoanExample.address, BALANCE_AMOUNT_DAI); // Sends our contract 2000 DAI from the DAI_WHALE

    // Request and execute a flash loan of 10,000 DAI from Aave
    const txn = await flashLoanExample.createFlashLoan(DAI, 10000);
    await txn.wait();

    // By this point, we should have executed the flash loan and paid back (10,000 + premium) DAI to Aave
    // Let's check our contract's remaining DAI balance to see how much it has left
    const remainingBalance = await token.balanceOf(flashLoanExample.address);

    // Our remaining balance should be <2000 DAI we originally had, because we had to pay the premium
    expect(remainingBalance.lt(BALANCE_AMOUNT_DAI)).to.equal(true);
  });
});
