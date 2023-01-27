const { expect } = require("chai");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs")

function encodeLeaf(address, spots) {
  // Same as `abi.encodePacked` in Solidity
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint64"], // The datatypes of arguments to encode
    [address, spots] // The actual values
  )
}

describe("Merkle Trees", function () {
  it("Should be able to verify if address is in whitelist or not", async function () {
    
    // Get a bunch of test addresses
    // Hardhat returns 10 signers when running in a test environment
    const testAddresses = await ethers.getSigners();
      
    // Create an array of ABI-encoded elements to put in the Merkle Tree
    const list = [
      encodeLeaf(testAddresses[0].address, 2),
      encodeLeaf(testAddresses[1].address, 2),
      encodeLeaf(testAddresses[2].address, 2),
      encodeLeaf(testAddresses[3].address, 2),
      encodeLeaf(testAddresses[4].address, 2),
      encodeLeaf(testAddresses[5].address, 2),
    ];
    
    // Using keccak256 as the hashing algorithm, create a Merkle Tree
    // We use keccak256 because Solidity supports it
    // We can use keccak256 directly in smart contracts for verification
    // Make sure to sort the tree so it can be reproduced deterministically each time
    const merkleTree = new MerkleTree(list, keccak256, {
      hashLeaves: true, // Hash each leaf using keccak256 to make them fixed-size
      sortPairs: true, // Sort the tree for determinstic output
      sortLeaves: true,
    });
    
    // Compute the Merkle Root in Hexadecimal
    const root = merkleTree.getHexRoot();
    
    // Deploy the Whitelist Contract
    const whitelist = await ethers.getContractFactory("Whitelist");
    const Whitelist = await whitelist.deploy(root);
    await Whitelist.deployed();
    
    // Check for valid addresses
    for (let i = 0; i < 6; i++) {
      // Compute the Merkle Proof for `testAddresses[i]`
      const leaf = keccak256(list[i]); // The hash of the node
      const proof = merkleTree.getHexProof(leaf); // Get the Merkle Proof
      
      // Connect the current address being tested to the Whitelist contract
      // as the 'caller'. So the contract's `msg.sender` value is equal to the value being checked
      // This is done because our contract uses `msg.sender` as the 'original value' for
      // the address when verifying the Merkle Proof
      const connectedWhitelist = await Whitelist.connect(testAddresses[i]);
      
      // Verify that the contract can verify the presence of this address
      // in the Merkle Tree using just the Root provided to it
      // By giving it the Merkle Proof and the original values
      // It calculates `address` using `msg.sender`, and we provide it the number of NFTs
      // that the address can mint ourselves
      const verified = await connectedWhitelist.checkInWhitelist(proof, 2);
      expect(verified).to.equal(true);
    }
    
    // Check for invalid addresses
    const verifiedInvalid = await Whitelist.checkInWhitelist([], 2);
    expect(verifiedInvalid).to.equal(false);
  })
})