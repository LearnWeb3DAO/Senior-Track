# 🤖 Maximal Extractable Value (MEV)

![](https://i.imgur.com/frgXFRX.png)

MEV is a relatively new concept in the world of blockchains, and one that carries with it a lot of controversy. It refers to the maximum value that can be extracted from the block production apart from the standard block rewards.

Previously, it used to be called Miner Extractable Value, since miners were best positioned to extract value from block production, but as we move towards Proof of Stake and miners get replaced by validators, a more generic rename has been done to call it Maximal Extractable Value.

<Quiz questionId="41da4c35-5b68-4e4d-be8b-4fc97042971b" />

## 🤔 What is MEV?

In a nutshell, it's the concept of extracting value (profit) by making certain types of transactions on chain that are not block rewards themselves. Originally, it started happening because miners had control over which transactions they'd like to include in a block, and in which order. Since when creating a block, miners can include, exclude and change the transactions of the block as they wish, this means they can favor some transactions as compared to others and gain some additional profits by doing so. Note that we are talking about miners right now but things will change after [the merge](https://ethereum.org/en/upgrades/merge/).

Typically, MEV happens when a certain transaction must be included in a certain block (usually the current block) to actually be profitable. Additionally, it sometimes may also need to be in a specific place in the block - for example buying a highly contested NFT drop right after the contract gets deployed, within the same block the contract was deployed, unlike us normies who wait at least until the next block so Metamask recognizes the contract as having been deployed before it sends a transaction out by which time gas price may have gone up significantly.

## 🫶 MEV Extraction

In theory, MEV could only be extracted by miners, and this was true in the early days. With miners having control over block production, they could guarantee for themselves the execution of a profitable transaction, and just not include the transaction in the block if it didn't turn out to be profitable. Today, however, a large portion of MEV is extracted by independent network participants referred to as `Searchers`. We will learn more about exactly what they do, but in a nutshell they run complex algorithms to find opportunities for profiting on chain and have bots to automatically submit those transactions to the network.

Miners still continue to get a portion of the MEV profit made by searchers, as searchers generally tend to pay very high gas fees to try and ensure their transaction is included in the block. We'll look at some example cases shortly.

<Quiz questionId="66588d2f-ecfb-40c2-af1b-a0ee014c8ffd" />

## 🔍 Searchers

`Searchers` are participants which are looking for opportunities to make profitable transactions. These are generally regular users, who can code of course. Miners get benefited from these `Searchers` because "Searchers" usually have to pay very high gas fees to actually be able to make a profitable transaction as the competition is very high. One example that we studied was DEX Arbitrage in our flash loan example. While arbitrage could be done manually, the chances of you succeeding at doing that are miniscule. Searchers run bots to detect arbitrage opportunities on chain, and automatically submit transactions to make profit from such opportunities. Since arbitrage is one of the most common examples of MEV, searchers typically end up paying 90% of their profit to miners in gas fees to be included in the block.

This had led to the rise of research in the field of **Gas Golfing** - a fancy word for making minor optimizations to smart contracts and execution to try to minimize gas cost as much as possible, which allows Searchers to increase their gas price while lowering the gas fees thereby ending up with the same amount of total ETH paid for gas.

<Quiz questionId="99e3fc3d-d650-4663-9afb-8780f80e4e6d" />

`Searchers` use the concept of Gas Golfing to be able to program transactions in such a way that they use the least amount of gas. This is because of the formulae `gas fees = gas price * gas used`. So if you decrease your `gas used`, you can increase your `gas price` to arrive at the same `gas fees`. This helps in competitive MEV opportunities as by being able to pay higher gas fees than your competitors means that your chances of getting your transaction included are higher.

<Quiz questionId="0fa2eec9-9bf3-45a5-84c8-0a911ed4ca23" />

We talked about how to decrease gas usage in detail in one of our previous levels.

## 🏃 Frontrunning

There are generally two types of Searchers - those which are looking for very specific MEV opportunities, for example the NFT drop example mentioned above, and those which are running generalized bots willing to make all types of transactions which yield profit.

The latter is what are known as frontrunning bots. Frontrunners are bots that are actively looking through the mempool (transactions that have been sent by users but yet have not been mined) to search for profitable transactions. They replace the addresses with their own address, and test it locally to see if it's actually profitable. If it is they submit a modified transaction with a replaced address and a higher gas price than the original transaction, thereby extracting profit on the transaction.

Funny things can happen when multiple frontrunning bots get stuck in a loop of trying to frontrun each other, eventually ending up with virtually no profit at all.

## 🤖 Flashbots

We cannot talk about MEV without talking about Flashbots. Flashbots is an independent research project, which extended the `go-ethereum` client with a service that allows `Searchers` to submit transactions directly to `Miners`, without having to go through the public mempool. This means transactions submitted by a `Searcher` are not visible to others on the mempool unless they actually get included in a block by a miner, at which point it's too late to do anything about it.

As of today, the majority of MEV transactions take place through the Flashbots service, which means generalized frontrunners as described above are no longer as profitable as they used to be. Those frontrunners are based on the idea of copying transactions from the mempool and submitting them with a higher gas fees. Through Flashbots, however, transactions skip the mempool entirely, and therefore generalized frontrunners cannot pick up most of the MEV happening today.

<Quiz questionId="7fa5c6f8-57c6-4dfb-bb3d-b965ee73302b" />

Flashbots also democratized MEV much more, by providing direct access to miners for `Searchers` - thereby somewhat opening up the opportunity for regular users like you and me to extract MEV without being a miner ourselves.

<Quiz questionId="b76c9ca1-78ac-4f00-910c-748bcb6a198f" />

We will talk about Flashbots in more detail soon.

## Use cases of MEV and Flashbots

We have discussed arbitrage above, let's look at a few more examples of MEV.

### Liquidations

In DeFi lending protocols, where you can borrow an asset against collateral (for eg borrowing USDC against ETH), there is the concept of liquidation. When you borrow assets against collateral, you can only borrow less money than what your collateral is worth. For example, if I deposit 1 ETH when ETH is $3,000 - I can only borrow less than 3,000 USDC from the lending protocol. Different protocols set different limits, but typically no one lets you borrow 100% of your collateral because that means the smallest price movement in your collateral will affect your borrowed amount.

The closer I get to the upper range of my borrowing amount, the higher chance I have of getting liquidated. There might be a case because of market fluctuations that the value of your borrowed assets exceeds the value of the collateral you supplied, or exceeds the upper limit of how much you were allowed to borrow. In that case, your original collateral is snatched away

Every protocol has a different percentage but after that percentage is hit, most of the protocols allow anyone from the outside world to liquidate the borrower. Consider this very similar to how if someone doesn't pay the loan on time, their house which they kept as collateral is auctioned by the bank where the bank takes away the original value of the loan + interest and returns back the money which is left over.

Similarly, when the borrower gets liquidated, some part of their collateral goes to the lender which includes interest and the borrowed money. Along with that the borrower also has to pay a liquidation fee which goes to the user/bot which started the liquidation transaction.

`Searchers` run algorithms to keep track of borrowers on various lending protocols to detect if someone can be liquidated. If they find an opportunity to liquidate someone, they can extract MEV from that opportunity by being the first to get their liquidation transaction mined therefore earning the liquidating fees.

### Sandwich Attacks

Sandwich Trading is a concept that perfectly fits the use case of Flashbots and MEV. Let's explain this with an example.

Suppose a user was attempting to make a large trade on a DEX, looking to sell a lot of `Token A` for `Token B`.

Selling `A` for `B` would push down the price of `A` and increase the price of `B` after the trade is executed. A second transaction, which is the exact same, made after this first one would yield in a lower amount of Token `B` for the same amount of Token `A`. `Searchers` can exploit this fact to actually make the user pay more for `Token B` than they may have originally anticipated (recall Slippage from DeFi Exchange level in Sophomore).

Since Flashbots lets you communicate with miners directly, and miners decide the order of transactions in a block, you can actually design your flashbots transactions in a way where you can specify the order in which you want your transactions to be executed. By doing so, searchers can create two transactions - one before the user's trade, and one after the user's trade - to make a profit as follows.

1. Searcher sells a lot of `Token A` for `Token B`, driving down the price of `Token A` and driving up the price of `Token B`
2. User's transaction goes through, which also sells a lot of `Token A` for `Token B`, but receives less `Token B` than originally anticipated. This further drives down `Token A` price and increases `Token B` price.
3. Searcher sells back their `Token B` for `Token A`, ending up with more `Token A` than they started off with, making a profit.

Since searchers add two transactions to the block right before and after the user's large trade, it is called a _Sandwich Attack_.

Sandwich Attack bots became so rampant with the rise of MEV and Flashbots that special decentralized exchanges had to be made with functionality to prevent exactly this. For example, `mistX` is a DEX that itself submits all trade transactions through Flashbots, thereby bypassing the mempool entirely, which means other Searchers cannot sandwich attack trades happening on `mistX`, though the miner itself still can.

Sandwich Attacks are also a big reason why privacy focused L2's and private trades are a hot topic, as if it is not possible for a Searcher of miner to know who's address is trading what and how much of it, they cannot sandwich that trade.

### Recovering funds from compromised accounts

Let's look at a use case of Flashbots that is in fact a net positive, and doesn't hurt other legitimate users in the process unlike Sandwich Attacks.

Suppose your ETH private key gets stolen, and you had a bunch of mainnet funds and NFTs on it. There exist a lot of bots which scour Github for private keys which were accidentally pushed to try to steal funds from that account. Generally they are looking for ETH or other well known tokens, and often times don't care about NFTs, unclaimed airdrop tokens, lesser known tokens, or tokens staked in DeFi pools and protocols.

It is possible then, and happens occasionally, that a bot would steal all your ETH and tokens, but there are other assets they did not care about that are worth a decent amount and you want to retrieve them. Unfortunately, you need ETH to pay gas for transactions, and the second you send any ETH to a compromised account, it is likely to be stolen by the bot before you can do anything.

Enter Flashbots. A lot of people have used Flashbots for good in this case, where they can design a bundle of transactions which would first send some ETH to the compromised account from a different account, and then withdraw all the assets the bot did not steal automatically, and ask the miner to order them in that sequential order within the same block. By skipping the mempool and being sure that both transactions will get included within the same block, bots can no longer frontrun your transaction and steal your ETH before you can withdraw your assets.

In fact, this exact approach has led to countless people recovering (hundreds of) thousands from stolen accounts.

<Quiz questionId="a155780b-8703-473e-a76d-78ddf4f10bbf" />

# The good and the bad

# Pros

It's good for many Defi projects because arbitrage corrects the price between multiple DEX's and protocols rely on liquidations to ensure that the borrowers don't fall below their collateral which hurts the DeFi protocol. Also, use cases like recovering stolen funds are arguably a net-positive that helps the space.

# Cons

The cons are that frontrunners and gas wars result in very high gas prices for the users and it's not good for the user experience. Also, there may be a case where a miner may figure out after mining a block that there was an MEV opportunity where they could have made more profit. So in this case, they can remine blocks to include the MEV transaction which can cause instability in the system.

We learnt before that blocks can be reorganized if a fork happened due to latency on the network, and eventually the longest chain was chosen as the canonical chain which may involve certain blocks getting deleted and replaced on nodes which were following the other (shorter) chain. However, if the MEV opportunity is large enough, miners may try to deliberately cause a fork and reorganize blocks just to try to make profit, though it also involves some luck as they now have to be able to produce a longer chain than the other one.

## 🙋 Solution?

We briefly talked about Flashbots above but essentially Flashbots are being built so that they can solve the Cons related to MEV. They are trying to build an ecosystem that is permissionless, transparent, and fair for having better MEV and protection against front running. By democratizing access to MEV opportunities beyond just miners, Flashbots allows users like you and me to also act upon these opportunities instead of just being taken advantage of.

The issue with the current Ethereum ecosystem is that the transaction is sent in an open mempool that is viewable by all which leads to the potential for frontrunning. It also has the added disadvantage that if you send the transaction but your transaction actually doesn't get executed, you still end up losing some gas.

On the other hand, not having a public mempool is quite questionable and shady as well, as that means for sure the miners are the only one who can extract MEV. A good example of this is the Avalanche chain, where they modified the `go-ethereum` client to hide the public mempool entirely and only miners can receive pending transactions. This led to miners extracting all the MEV and users weren't able to do anything about it.

As a result, it spawned DAO's and projects that collaborated their resources to set up mining nodes, and then sold access to the mempool to multiple users for a fraction of the cost of running your own Avalanche node (which is currently upwards of $200,000 USD).

Instead, Flashbots created something which is really cool, they decided to allow users to privately communicate the transaction order they want and bid the amount they are willing to give. If their bid fails, the user doesn't end up paying anything, as the miner doesn't get anything if the transaction isn't profitable. This mechanism eliminates front running.

<Quiz questionId="f0a112f7-5ff2-429b-8a20-a77907afc7e4" />

## 📐 Architecture of Flash bots

Let's understand further down how everything works underneath in flashbots

![](https://i.imgur.com/l5ageJ7.png)

(Referenced from the [docs of flashbots](https://docs.flashbots.net/flashbots-auction/overview))

As you can see in the diagram there are three parties involved the searcher, the relay, and the miner.

Essentially `Searcher` wants to send a private request to the miner so that his transactions are not viewable in the open mempool of Ethereum and thus preventing him from front running.

The `Searcher` expresses their bids for inclusion through ethereum transactions in the form of gas price or direct payment to the coinbase address (address of the miner). Using direct payments instead of gas prices allows users to make payments only if their bids are successful, whereas only having a high gas fees means miners are still incentivized to include your transaction even if it not profitable, because they will still get the gas fees from you. However, using direct payments means your transactions must be executed through a smart contract (and not an EOA) because in smart contracts you have access to the `block.coinbase` variable. Depending on use case, you may need to deploy a new smart contract to mainnet for this to be possible.

Now the issue comes because "Searcher" doesn't have to pay anything for the failed bids, they might do a DOS attack and spam the miners with invalid transaction bundles. To prevent this the user's transactions are first sent to the relayer who validates the bundle and also does bundle merging. The relayer also has a reputation system, where legitimate searchers build up their reputation over time whereas DOS attackers and such lose reputation thereby making it harder for them to mess with the system.

The official documentation of flashbots suggests not to integrate with relayers other than the ones from Flashbots until the system is fully decentralized because relayers have access to the full transaction data and may use it for their own benefits.

<Quiz questionId="e7d999ff-faf9-4420-aba4-0b70a73c3106" />

The miners which want to support the Flashbots relay run the MEV-modified Ethereum client code, for eg. `mev-geth` which is an extension of `go-ethereum`. As of today, over 80% of Ethereum miners are using the MEV-modified version of Ethereum nodes.

The miner can evaluate transaction bundles and combine the ones which don't conflict to create the most profitable block.

## eth_sendBundle

Flashbots introduced a new `eth_sendBundle` RPC which is a standard format to interact with the flashbot relayers and miners. It includes array of arbitrary signed Ethereum transactions along with some metadata

Here is a list of all the params it takes:

```js
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_sendBundle",
  "params": [
    {
      txs,               // Array[String], A list of signed transactions to execute in an atomic bundle
      blockNumber,       // String, a hex encoded block number for which this bundle is valid on
      minTimestamp,      // (Optional) Number, the minimum timestamp for which this bundle is valid, in seconds since the unix epoch
      maxTimestamp,      // (Optional) Number, the maximum timestamp for which this bundle is valid, in seconds since the unix epoch
      revertingTxHashes, // (Optional) Array[String], A list of tx hashes that are allowed to revert
    }
  ]
}
```

<Quiz questionId="ca46196b-7f56-4cff-b433-a13f17c39b87" />

![](https://i.imgur.com/LSrgpr8.png)
(Referenced from the [docs of flashbots](https://docs.flashbots.net/flashbots-auction/overview))

## Explorer

To view how MEV is progressing over the years, the flashbot team has built an explorer. Do check it out, it's amazing. Follow this [link](https://explore.flashbots.net/)

## Example of MEV

- A real world arbitrage MEV [transaction](https://etherscan.io/tx/0x2bde6e654eb93c990ae5b50a75ce66ef89ea77fb05836d7f347a8409f141599f)

---

Right now most of the flashbots work is still in the research and early phases. But as we all can understand, it has a lot of potentials.

Web3 is full of potential and we are just getting started 🚀 👀

Just wow 🤯

# Recommended Readings

- [Ethereum is a Dark Forest](https://www.paradigm.xyz/2020/08/ethereum-is-a-dark-forest)
- [Escaping the Dark Forest](https://samczsun.com/escaping-the-dark-forest/)

# References

- [Ethereum.org docs](https://ethereum.org/en/developers/docs/mev/)
- [Flashbots docs](https://docs.flashbots.net/flashbots-auction/overview)

## 👋 Conclusion

Hope you learnt something from this level. If you have any questions or feel stuck or just want to say Hi, hit us up on our [Discord](https://discord.gg/learnweb3). We look forward to seeing you there!

<SubmitQuiz />
