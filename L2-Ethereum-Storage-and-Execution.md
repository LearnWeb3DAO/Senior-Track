# 👀 Ethereum Storage and Execution

We have been writing smart contracts over the last few tracks, and briefly mentioned that Ethereum smart contracts run within this thing called the Ethereum Virtual Machine (EVM).

We also briefly mentioned in passing that EVM is capable of running certain OPCODES, and deals with data present either in the stack or heap. If you have a formal computer science background, that may have made sense to you, but for everyone else, what does this actually mean? 🤔

In this level, we will dig deeper into the EVM execution engine and how data is stored, manipulated, and ran throughout the course of a transaction.

## 🧠 Recap

Let's recap a few things we taught in earlier tracks before moving ahead.

Recall that Ethereum works as a transaction-based state machine. Starting at some state `s1`, a transaction manipulates certain data to shift the world state to some state `s2`.

![](https://i.imgur.com/rYatW2N.png)

To group things together, transactions are packed together in blocks. Generally speaking, each block changes the world state from state `s1` to `s2`, and the conversion is calculated based on the state changes made by every transaction within the block.

When we think of these state changes, Ethereum can be thought of as a state chain.

![](https://i.imgur.com/xpjCaDR.png)

But, what is this world state? 🤨

## 🗺️ World State

The World State in Ethereum is a mapping between addresses and account states. Each address on Ethereum has it's own state, this could be a user account (EOA) or a smart contract.

![](https://i.imgur.com/EVCHU7T.png)

Each block essentially manipulates multiple account states, thereby manipulating the overall world state of Ethereum.

<Quiz questionId="789f6cc0-6057-4bfe-a7d9-b992b22ac121" />

## 📒 Account State

Alright, so the world state is comprised of various account states. What is an account state?

![](https://i.imgur.com/hia6XHQ.png)

The account state contains a few common things, like the nonce and the balance (in ETH). Additionally, smart contracts also contain a storage hash and a code hash. The two hashes act as references to a separate state tree, which store state variables and the bytecode of the smart contract respectively.

![](https://i.imgur.com/K9L1D0V.png)

<Quiz questionId="87a8afbf-a514-444e-bcd9-357d9770f659" />

Recall that there are two types of accounts in Ethereum. Externally owned accounts (e.g. Coinbase Wallets, Metamask Wallets, etc.) and Smart Contract Accounts.

EOAs are controlled by private keys, and do not have any EVM code. Contract accounts on the other hand contain EVM code and are controlled by the code itself, and do not have private keys associated with them.

## 💵 Types of Transactions

There are two types of transactions on Ethereum mainly. Those which create new contracts, and those which just send messages.

Sending messages here implies making a transaction that either transfers ETH, or calls functions on a smart contract. They are just different types of messages that can be sent by an EOA.

![](https://i.imgur.com/uFbAFl1.png)

When a contract creation transaction is made, a new account is added to the world state. The transaction carries with it the bytecode of the contract to be created and the initializing code (i.e. constructor calls).

![](https://i.imgur.com/IFXWeDp.png)

On the other hand, for all other transactions, i.e. message calls, the account state of an existing account is modified following the transaction.

![](https://i.imgur.com/megkubb.png)

<Quiz questionId="3ce806f1-9460-42f4-ab9b-dcb75389fb60" />

## ✉️ Messages

Messages in Ethereum are passed between two accounts. They consist primarily of two things - `data` and `value`.

`data` is a set of bytes, that indicate the type of transaction that needs to take place (transfer ETH, mint an NFT, vote in a DAO, etc) and `value` is the Ether value that is transfered along with the transaction.

Transactions made by EOAs send a message to the recipient account. Contract accounts can also send messages to accounts through the EVM code.

![](https://i.imgur.com/sKTkg6H.png)

## 📠 The Ethereum Virtual Machine

Let's talk about the EVM now.

Just like how Java ships with the JVM, and Javascript and Python also have their own runtime environments, Ethereum Smart Contracts' runtime environment is the EVM.

The EVM has a stack-based architecture. A massive simplification of modern CPU architectures.

![](https://i.imgur.com/5VlEVyv.png)

<Quiz questionId="e618089e-bb62-49d8-93b8-84f4761f43cf" />

The smart contract code, or EVM code, lives in an immutable storage location within the EVM.

For runtime calculations, i.e. local variables and such, the EVM has access to two storage locations - the stack and the memory (i.e. heap).

The EVM also has access to the persistent world state i.e. account state to read and write to e.g. changing state variables within a contract.

![](https://i.imgur.com/ejRCNaA.png)

The stack is a simple stack that supports PUSH/POP operations, and each stack element is 256 bits (32 bytes) and has a max depth of 1024 elements.

<Quiz questionId="dcc8607a-c0de-4797-83e0-92393a77a89d" />

The memory (or heap) is a linear memory structure, and can store dynamic sized data i.e. strings and dynamic arrays during runtime.

The account storage is part of the world state, and is the persistent storage where any changes made will continue to stay even after the transaction is done executing.

<Quiz questionId="9d6d88a7-4c3e-4825-9ce2-75dc05654fb0" />

## Stack

![](https://i.imgur.com/18sq0gl.png)

Stack is a Last-in First-out data structure used to hold temporary values. Think of it like a stack of plates. The plate you stack on the top, will be the first one that gets removed. Stacks are used for fast operations on fixed size data across computer science, and EVM is no different.

<Quiz questionId="0efbaa36-ea49-47bf-be9c-568ca95ba520" />

![](https://i.imgur.com/A0GXLx5.png)

All operations from the EVM are run on the stack. The EVM stack supports doing operations with the top 16 elements of the stack, and no deeper. The other 1008 stack elements can be used to store operational data such as OPCODES to run and such.

> Fun fact: In Solidity, you will get a compilation error if you write a function that has more than 16 local variables declared in it. Because the stack cannot work with data beyond the top 16 elements, having more than 16 variables means that operations on some of them will not be possible within the EVM.

<Quiz questionId="a2aa0383-11d4-4e6c-8b4f-da6c4a091184" />

## 🗓️ Memory

The EVM memory is a linearly addressed memory, that can be addressed at the byte level. You can store either 8 bits (1 byte) or 256 bits (32 bytes) at a time in memory, but can only read from memory in chunks of 256 bits (32 bytes). Memory is used to store dymanic values in solidity like variable length arrays, strings etc.

<Quiz questionId="1720f951-46a3-42d8-81e3-069769bc23fe" />

Initially, all memory locations have the value of zero. During transaction execution however, the values can be updated and modified.

![](https://i.imgur.com/pT7jyHL.png)

## 🔒 Account Storage

The persistent account storage is a mapping from 256-bit keys to 256-bit values. All locations in persistent storage are also initially defined as zero (thereby the property of integers in Solidity having initial value of 0, booleans being false, strings being empty, etc.)

![](https://i.imgur.com/CS4SseS.png)

The keys within these mappings are often referred to as slots. Each state variable in a smart contract is assigned a slot within the account storage, in the order they were defined.

So, for a contract that looks like this:

```solidity
contract Sample {
    uint256 first;
    uint256 second;
    address third;
}
```

`first` will have Slot #0, `second` will have Slot #1, `third` will have Slot #2.

This concept of slots will turn out to be very important when we start learning about `DELEGATECALL` (`.delegatecall()`) in Solidity later in this track.

## 🧨 Execution Model

Let's take a look at the high level execution model within the EVM. This diagram may seem a bit confusing at first, but read through this section and you will understand what is going on.

![](https://i.imgur.com/MM2zTUo.png)

The EVM contains a Program Counter (PC). The PC, also sometimes called the instruction pointer, is a value that points to where a computer is as part of code execution.

If you think of the EVM code as a list of instructions to run, the PC will point to the instruction that needs to be run. Initially, the PC points at zero, i.e. the first instruction. When that is run, the PC gets updated to point to the next instruction, and so on.

The instruction being pointed to by the PC executes certain operations with the given data. These operations happen on the stack, and the stack can read/write values from both the memory and the account storage.

<Quiz questionId="6cc83887-f924-4e6d-81ad-3c752bb43168" />

I've used this analogy before and I will use it again - think of memory like your RAM and the account storage like your hard disk. The stack (instruction processor) can read/write data from the RAM and the Hard Disk, but only changes made to the Hard Disk data will continue to persist after the code is finished running, whereas the memory will be cleared.

So far, this is quite similar to an actual CPU architecture. For those of you with formal Computer Science backgrounds, if you ever took a hardware or computer processors class in college, you must have been taught something similar about how actual processors work. The EVM behaves very similarly.

But, there is one special thing here. The EVM also stores a counter for how much gas is available. Every operation executed by the EVM costs a certain amount of gas, and the EVM will keep executing operations as long as there is enough gas to run the operation. If the gas available ever goes below what is necessary to keep running, the entire execution will stop and cause a failed transaction. As we taught before, this is done to avoid having infinite loops within the EVM which could bring the Ethereum network to a halt. Therefore, for complex transactions, you need to pay higher gas to cover the execution costs.

## ⛽ Gas during Execution

![](https://i.imgur.com/Q0pZhiA.png)

Highlighting the above points, you can see that the EOA passes a certain amount of gas to the contract account when it sends a message. The EVM code runs and uses up some of the gas. If any gas is left over, it is refunded back to the EOA.

However, if the EVM code runs out of gas i.e. not enough gas was supplied, the execution would fail and the transaction would fail. No gas is refunded in this case as the EVM still had to execute all those operations to figure out that the gas supplied was too less, so the gas is charged for the work that was done.

## 👋 Conclusion

Ethereum is a complicated piece of software. If you have made it this far, props to you. I hope this level helped you in clearing some doubts around how Ethereum storage works, and how the EVM deals with data and executes transactions during runtime.

We could go even deeper and look at Assembly and OPCODES that run within the EVM, but that deserves one (or more) articles of it's own because that is a huge topic.

As always, if you have any questions or feel stuck or just want to say Hi, hit us up on the [Discord](https://discord.gg/learnweb3) and we'll be more than happy to help you out!

## References

- [EVM Illustrated](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf)

<SubmitQuiz />
