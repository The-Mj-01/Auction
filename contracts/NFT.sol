pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
  uint256 private _tokenIdCounter;

  constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
    _tokenIdCounter = 0;
  }

  function mint(address _to, uint256 _tokenId) external onlyOwner returns (uint256) {

    _safeMint(_to, _tokenId);
    return _tokenIdCounter;
  }
}
