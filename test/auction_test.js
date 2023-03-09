const Auction = artifacts.require("Auction");
const NFT = artifacts.require("MyNFT");


// Test Auction
contract("Auction", accounts => {

  let Auction;
  let nft;

  //accounts
  const owner = accounts[0];
  const bidder1 = accounts[1];
  const bidder2 = accounts[2];

  //deploy NFT & Auction smart contract
  before(async () => {
    nft = await NFT.new("My NFT", "MNT", {from: owner});
    Auction = await Auction.new({from: owner});
  });

  //Create Auction test
  it("should create an auction11", async () => {
    const reservePrice = web3.utils.toWei("1", "ether");

    const startTime = Math.floor(Date.now() / 1000);
    const duration = 86400; // 1 day
    const tokenId = 1;

    //mint NFT
    await nft.mint(owner, tokenId, {from: owner});
    //approve to smart contract
    await nft.approve(simpleAuction.address, tokenId, {from: owner});
    //Create auction11
    const result = await simpleAuction.createAuction(nft.address, tokenId, reservePrice, duration, {from: owner});
    const auctionId = result.logs[0].args.id;

    const auction = await simpleAuction.getAuction(auctionId);

    assert.equal(auction.tokenAddress, nft.address);
    assert.equal(auction.tokenId, tokenId);
    assert.equal(auction.seller, owner);
    assert.equal(auction.reservePrice, reservePrice);
    assert.equal(auction.startTime, startTime);
    assert.equal(auction.endTime, startTime + duration);
    assert.equal(auction.highestBidder, "0x0000000000000000000000000000000000000000");
    assert.equal(auction.highestBid, 0);
    assert.equal(auction.ended, false);
  });

  //Place bid test
  it("should place a bid", async () => {
    const bidAmount = web3.utils.toWei("1.5", "ether");


    await simpleAuction.placeBid(1, {from: bidder1, value: bidAmount});

    const updatedAuction = await simpleAuction.getAuction(1);

    assert.equal(updatedAuction.highestBidder, bidder1);
    assert.equal(updatedAuction.highestBid, bidAmount);
  });

  //Cancel auction11 test
  it("should cancel an auction11", async () => {
    const auction = await simpleAuction.getAuction(1);
    //un-approve to smart contract
    await nft.approve("0x0000000000000000000000000000000000000000", auction.tokenId, {from: owner});

    //Cancel Auction
    await simpleAuction.cancelAuction(1, {from: owner});

    const updatedAuction = await simpleAuction.getAuction(1);
    assert.equal(updatedAuction.ended, true);
  });

  it("should transfer NFT to highest bidder and bid amount to owner", async () => {

    const reservePrice = web3.utils.toWei("1", "ether");
    const duration = 86400; // 1 day
    const tokenId = 2;

    //Mint NFT
    await nft.mint(owner, tokenId, {from: owner});

    //Approve to smart contract
    await nft.approve(simpleAuction.address, tokenId, {from: owner});

    //Create Auction
    await simpleAuction.createAuction(nft.address, tokenId, reservePrice, duration, {from: owner});

    //Place Bid
    const bidAmount1 = web3.utils.toWei("1.5", "ether");
    await simpleAuction.placeBid(2, {from: bidder1, value: bidAmount1});


    const bidder1BalanceBefore = await web3.eth.getBalance(bidder1);

    //Place Bid 2
    const bidAmount2 = web3.utils.toWei("2", "ether");
    await simpleAuction.placeBid(2, {from: bidder2, value: bidAmount2});


    const bidder2BalanceBefore = await web3.eth.getBalance(bidder2);
    const ownerBalanceBefore = await web3.eth.getBalance(owner);


    await time.increase(duration); // in order to simulate block time change
    await time.advanceBlock();

    const tx = await simpleAuction.endAuction(2, {from: owner});

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "AuctionEnded");


    //Get Balances
    const ownerBalanceAfter = await web3.eth.getBalance(owner);
    const bidder1BalanceAfter = await web3.eth.getBalance(bidder1);
    const bidder2BalanceAfter = await web3.eth.getBalance(bidder2);
    const gasPrice = await web3.eth.getGasPrice();
    const gasUsed = tx.receipt.gasUsed;


    //Calculate Balances
    const expectedOwnerBalance = web3.utils.toBN(ownerBalanceBefore).add(web3.utils.toBN(bidAmount2)).sub(web3.utils.toBN(gasPrice).mul(web3.utils.toBN(gasUsed)));
    const expectedBidder1Balance = web3.utils.toBN(bidder1BalanceBefore).add(web3.utils.toBN(bidAmount1));
    const expectedBidder2Balance = web3.utils.toBN(bidder2BalanceBefore);

    //Assertion
    assert.equal((Math.round(web3.utils.fromWei(ownerBalanceAfter, "ether") * 100) / 100).toString(), (Math.round(web3.utils.fromWei(expectedOwnerBalance, "ether") * 100) / 100).toString());
    assert.equal(bidder1BalanceAfter.toString(), expectedBidder1Balance.toString());
    assert.equal(bidder2BalanceAfter.toString(), expectedBidder2Balance.toString());
    const endedAuction = await simpleAuction.getAuction(2);

    assert.equal(endedAuction.ended, true);

  });
});