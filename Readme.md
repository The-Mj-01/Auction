# Simple Auction Smart Contract

The Simple Auction Smart Contract is a Solidity-based smart contract that enables the creation of a simple auction system for Non-Fungible Tokens (NFTs). The contract allows bidders to place bids on a specific NFT, with the highest bidder being declared the winner when the auction ends. The owner of the NFT can set a reserve price, and the auction will not end if the highest bid is below the reserve price.

The Simple Auction Smart Contract is designed to handle multiple simultaneous auctions for different NFTs.

## Getting Started

### Prerequisites

To use the Simple Auction Smart Contract, you will need:

- An Ethereum wallet such as [MetaMask](https://metamask.io/)
- Access to the Ethereum network, either through a local development environment or a public network such as Rinkeby or Mainnet.

### Deployment

To deploy the Simple Auction Smart Contract:

1. Copy the contents of `contracts/simple_auction.sol` into a new file in your Solidity development environment.
2. Compile the contract using a Solidity compiler such as [Remix](https://remix.ethereum.org/).
3. Deploy the contract to the Ethereum network using a tool such as [Truffle](https://www.trufflesuite.com/truffle) or [Hardhat](https://hardhat.org/).

### Interacting with the Contract

Once deployed, you can interact with the Simple Auction Smart Contract using an Ethereum wallet such as MetaMask.

#### Creating an Auction

To create a new auction, call the `createAuction` function with the following parameters:

- `nftAddress`: The address of the NFT contract.
- `tokenId`: The ID of the NFT being auctioned.
- `reservePrice`: The reserve price for the auction.
- `duration`: The duration of the auction in seconds.

The function will return the ID of the new auction.

#### Placing a Bid

To place a bid on an auction, call the `placeBid` function with the following parameters:

- `auctionId`: The ID of the auction.
- `amount`: The amount of the bid, in Wei.

If the bid is successful, the function will return `true`. If the bid is not successful, it will throw an error.

#### Cancelling an Auction

To cancel an auction, call the `cancelAuction` function with the following parameter:

- `auctionId`: The ID of the auction to cancel.

The function will cancel the auction and return the NFT to the owner.

#### Ending an Auction

To end an auction, call the `endAuction` function with the following parameter:

- `auctionId`: The ID of the auction to end.

The function will transfer the NFT to the highest bidder and transfer the bid amount to the owner of the NFT.

