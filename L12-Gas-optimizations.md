# ⛽ Gas Optimizations in Solidity

In this tutorial, we will learn about some of the gas optimization techniques in Solidity. This has been one of our most-requested levels, so let's get started without further ado 👀

## Tips and Tricks

### Variable Packing

If you remember we talked about storage slots in one of our previous levels. Now the interesting point in solidity if you remember is that each storage slot is 32 bytes.

This storage can be optimized which will further mean gas optimization when you deploy your smart contract if you pack your variables correctly.

Packing your variables means that you pack or put together variables of smaller size so that they collectively form `32 bytes`. For example, you can pack 32 `uint8` into one storage slot but for that to happen it is important that you declare them consecutively because the order of declaration of variables matters in solidity.

Given two code samples:

```solidity
uint8 num1;
uint256 num2;
uint8 num3;
uint8 num4;
uint8 num5;
```

```solidity
uint8 num1;
uint8 num3;
uint8 num4;
uint8 num5;
uint256 num2;
```

The second one is better because in the second one solidity compiler will put all the `uint8`'s in one storage slot but in the first case it will put `uint8 num1` in one slot but now the next one it will see is a `uint256` which is in itself requires 32 bytes cause `256/8 bits = 32 bytes` so it can't be put in the same storage slot as `uint8 num1` so now it will require another storage slot. After that `uint8 num3, num4, num5` will be put in another storage slot. Thus the second example requires 2 storage slots as compared to the first example which requires 3 storage slots.

It's also important to note that elements in `memory` and `calldata` can not be packed and are not optimized by solidity's compiler.

<Quiz questionId="3f7890cd-ffdb-4fa2-8241-df57a9f4533e" />

## Storage vs Memory

Changing storage variables requires more gas than variables in memory.
It's better to update storage variables at the end after all the logic has already been implemented.

So given two samples of code

```solidity
contract A {
    uint public counter = 0;

    function count() {
        for(uint i = 0; i < 10; i++) {
            counter++;
        }
    }

}
```

```solidity
contract B {
    uint public counter = 0;

    function count() {
        uint copyCounter;
        for(uint i = 0; i < 10; i++) {
            copyCounter++;
        }
        counter = copyCounter;
    }

}
```

The second sample of code is more gas optimized because we are only writing to the storage variable `counter` only once as compared to the first sample where we were writing to storage in every iteration. Even though we are performing one extra write overall in the second code sample, the 10 writes to `memory` and 1 write to `storage` is still cheaper than 10 writes directly to `storage`.

<Quiz questionId="bd7cd38d-d7f2-4078-a282-c5a7adde7405" />

## Fixed length and Variable-length variables

We talked about how fixed length and variable length variables are stored. Fixed-length variables are stored in a stack whereas variable-length variables are stored in a heap.

Essentially why this happens is because in a stack you exactly know where to find a variable and its length whereas in a heap there is an extra cost of traversing given the variable nature of the variable

So if you can make your variables fixed size, it's always good for gas optimizations

Given two examples of code:

```solidity
string public text = "Hello";
uint[] public arr;
```

```solidity
bytes32 public text = "Hello";
uint[2] public arr;
```

The second example is more gas optimized because all the variables are of fixed length.

# External, Internal, and Public functions

Calling functions in solidity can be very gas-intensive, its better you call one function and extract all data from it than call multiple functions

Recall the `public` functions are those which can be called both externally (by users and other smart contracts) and internally (from another function in the same contract).

However, when your contract is creating functions that will only be called externally it means the contract itself cant call these functions, it's better you use the `external` keyword instead of `public` because all the input variables in `public` functions are copied to memory which costs gas whereas for `external` functions input variables are stored in `calldata` which is a special data location used to store function arguments and it requires less gas to store in calldata than in memory

The same principle applies as to why it's cheaper to call `internal` functions rather than `public` functions. This is because when you call `internal` functions the arguments are passed as references of the variables and are not again copied into memory but that doesn't happen in the case of `public` functions.

<Quiz questionId="291907c1-c12f-4b42-b600-d28c7d0fb51e" />

## Function modifiers

This is a fascinating one because a few weeks ago, I was debugging this error from one of our students and they were experiencing the error “Stack too deep”. This usually happens when you declare a lot of variables in your function and the available stack space for that function is no longer available. As we saw in the Ethereum Storage level, the EVM only allows up to 16 variables within a single function as that it can not perform operations beyond 16 levels of depth in the stack.

Now even after moving a lot of the require statements in the `modifier` it wasn't helping because function modifiers use the same stack as the function on which they are put. To solve this issue we used an `internal` function inside the `modifier` because `internal` functions don't share the same restricted stack as the `original function` but `modifier` does.

<Quiz questionId="07163f50-45f3-45aa-8e4d-801760b92737" />
<Quiz questionId="317e398a-d2a8-49c5-b6fc-de79b04fdd55" />

## Use libraries

Libraries are stateless contracts that don't store any state. Now when you call a public function of a library from your contract, the bytecode of that function doesn't get deployed with your contract, and thus you can save some gas costs. For example, if your contract has functions to sort or to do maths etc. You can put them in a library and then call these library functions to do the maths or sorting for your contract. To read more about libraries follow this [link](https://jeancvllr.medium.com/solidity-tutorial-all-about-libraries-762e5a3692f9).

There is a small caveat however. If you are writing your own libraries, you will need to deploy them and pay gas - but once deployed, it can be reused by other smart contracts without deploying it themselves. Since they don't store any state, libraries only need to be deployed once to the blockchain and are assigned an address that the Solidity compiler is smart enough to figure out itself. Therefore, if you use libraries from OpenZeppelin for example, they will not add to your deployment cost.

## Short Circuiting Conditionals

If you are using (||) or (&&) it's better to write your conditions in such a way so that the least functions/variable values are executed or retrieved in order to determine if the entire statement is true or false.

Since conditional checks will stop the second they find the first value which satisfies the condition, you should put the variables most likely to validate/invalidate the condition first. In OR conditions (||), try to put the variable with the highest likelihood of being `true` first, and in AND conditions (&&), try to put the variable with the highest likelihood of being `false` first. As soon as that variable is checked, the conditional can exit without needing to check the other values, thereby saving gas.

<Quiz questionId="dc5793a3-18c1-41f7-987d-cc3ae3bc0f18" />

## Free up Storage

Since storage space costs gas, you can actually free up storage and delete unnecessary data to get gas refunds. So if you no longer need some state values, use the `delete` keyword in Solidity for some gas refunds.

## Short Error Strings

Make sure that the error strings in your require statements are of very short length, the more the length of the string, the more gas it will cost.

```solidity
require(counter >= 100, "NOT REACHED"); // Good
require(balance >= amount, "Counter is still to reach the value greater than or equal to 100, ............................................";
```

The first requirement is more gas optimized than the second one.

> NOTE: In newer versions of Solidity, there are now custom errors using the `error` keyword which behave very similar to `events` and can achieve similar gas optimizations.

---

Thank you all for staying tuned to this article 🚀 Hope you liked it :)

<Quiz questionId="c2222fea-abeb-4566-b981-01f85853592b" />

## 👋 Conclusion

Hope you learnt something from this level. If you have any questions or feel stuck or just want to say Hi, hit us up on our [Discord](https://discord.gg/learnweb3). We look forward to seeing you there!

<SubmitQuiz />
