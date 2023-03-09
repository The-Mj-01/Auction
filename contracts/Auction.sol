pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SimpleAuction is ERC721Holder {
  struct Auction {
    uint256 id;
    address tokenAddress;
    uint256 tokenId;
    address payable seller;
    uint256 reservePrice;
    uint256 startTime;
    uint256 endTime;
    address payable highestBidder;
    uint256 highestBid;
    bool ended;
  }

  mapping (uint256 => Auction) public auctions;
  uint256 public auctionId;

  event AuctionCreated(uint256 id, address tokenAddress, uint256 tokenId, uint256 reservePrice, uint256 startTime, uint256 endTime);
  event BidPlaced(uint256 auctionId, address bidder, uint256 bidAmount);
  event AuctionEnded(uint256 auctionId, address winner, uint256 highestBid);
  //    event debug(uint256 now, uint256 end);

  function createAuction(address _tokenAddress, uint256 _tokenId, uint256 _reservePrice, uint256 _duration) external {
    require(_reservePrice > 0, "Reserve price should be greater than zero");
    require(IERC721(_tokenAddress).ownerOf(_tokenId) == msg.sender, "Only owner can create auction");
    require(IERC721(_tokenAddress).getApproved(_tokenId) == address(this), "Contract should be approved to transfer NFT");

    auctionId++;

    Auction storage auction = auctions[auctionId];
    auction.id = auctionId;
    auction.tokenAddress = _tokenAddress;
    auction.tokenId = _tokenId;
    auction.seller = payable(msg.sender);
    auction.reservePrice = _reservePrice;
    auction.startTime = block.timestamp;
    auction.endTime = block.timestamp + _duration;
    auction.ended = false;

    emit AuctionCreated(auctionId, _tokenAddress, _tokenId, _reservePrice, auction.startTime, auction.endTime);
  }

  function placeBid(uint256 _auctionId) external payable {
    Auction storage auction = auctions[_auctionId];
    require(block.timestamp >= auction.startTime, "Auction not yet started");
    require(block.timestamp < auction.endTime, "Auction ended");
    require(msg.value > auction.highestBid, "Bid amount should be greater than highest bid");

    if (auction.highestBidder != address(0)) {
      payable(auction.highestBidder).transfer(auction.highestBid);
    }

    auction.highestBidder = payable(msg.sender);
    auction.highestBid = msg.value;

    emit BidPlaced(_auctionId, msg.sender, msg.value);
  }

  function endAuction(uint256 _auctionId) external {
    Auction memory auction = auctions[_auctionId];
    //        emit debug(block.timestamp, auction.endTime);
    //        return (block.timestamp >= auction.endTime);

    string memory auctionMsg = string(bytes.concat(bytes("Auction not yet ended: "), "  ",bytes(Strings.toString(block.timestamp))));
    auctionMsg = string(bytes.concat(bytes(auctionMsg), "   ", bytes(Strings.toString(auction.endTime))));

    require(block.timestamp >= auction.endTime, auctionMsg);

    require(!auction.ended , "Auction already ended");

    auctions[_auctionId].ended = true;

    if (auction.highestBid >= auction.reservePrice) {
      IERC721(auction.tokenAddress).safeTransferFrom(auction.seller, auction.highestBidder, auction.tokenId);
      auction.seller.transfer(auction.highestBid);
      emit AuctionEnded(_auctionId, auction.highestBidder, auction.highestBid);
    } else {
      emit AuctionEnded(_auctionId, address(0), 0);
    }
  }

  function cancelAuction(uint256 _auctionId) external {
    Auction storage auction = auctions[_auctionId];
    require(auction.seller == msg.sender, "Only seller can cancel the auction");
    require(!auction.ended, "Auction already ended");
    require(IERC721(auction.tokenAddress).getApproved(auction.tokenId) == address(0), "Has approved yet!");
    auction.ended = true;

    emit AuctionEnded(_auctionId, address(0), 0);
  }

  function getAuction(uint256 _auctionId) external view returns (
    address tokenAddress,
    uint256 tokenId,
    address payable seller,
    uint256 reservePrice,
    uint256 startTime,
    uint256 endTime,
    address highestBidder,
    uint256 highestBid,
    bool ended
  ) {
    Auction storage auction = auctions[_auctionId];
    return (
    auction.tokenAddress,
    auction.tokenId,
    auction.seller,
    auction.reservePrice,
    auction.startTime,
    auction.endTime,
    auction.highestBidder,
    auction.highestBid,
    auction.ended
    );
  }

  function getMyAuctions() external view returns (uint256[] memory) {
    uint256[] memory myAuctions = new uint256[](auctionId);
    uint256 counter = 0;
    for (uint256 i = 1; i <= auctionId; i++) {
      Auction storage auction = auctions[i];
      if (auction.seller == msg.sender) {
        myAuctions[counter] = auction.id;
        counter++;
      }
    }
    uint256[] memory result = new uint256[](counter);
    for (uint256 i = 0; i < counter; i++) {
      result[i] = myAuctions[i];
    }
    return result;
  }
}

