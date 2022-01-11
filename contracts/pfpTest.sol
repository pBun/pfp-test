// Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract PFPTest is ERC721, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint public constant RESERVED_TOKENS = 30;
    uint256 public constant MAX_SUPPLY = 100;
    uint public constant MAX_PURCHASE = 20;
    uint256 public constant TOKEN_PRICE = 80000000000000000; //0.08 ETH

    uint256 public totalSupply;
    uint256 public revealTimestamp;
    bool public saleIsActive = false;

    constructor() public ERC721('PFP Test', 'PFPT') {}

    function _baseURI() internal pure override returns (string memory) {
        // return 'https://gateway.pinata.cloud/ipfs/QmNbpTjX6C7k6j7wytuBsESGXhxPBxNTK1g8GEgC6X663h/';
        return 'ipfs://QmNbpTjX6C7k6j7wytuBsESGXhxPBxNTK1g8GEgC6X663h/';
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function reserveTokens() public onlyOwner {        
        uint i;
        for (i = 0; i < RESERVED_TOKENS; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            _safeMint(msg.sender, newItemId);
        }
    }

    function startSale(uint256 revealTimeStamp) public onlyOwner {
        saleIsActive = true;
        revealTimestamp = revealTimeStamp;
    }

    function pauseSale() public onlyOwner {
        saleIsActive = false;
    }

    function saleStatus() public view returns (bool) {
        return saleIsActive;
    }

    function mintToken(uint numberOfTokens) public payable {
        require(saleIsActive, "Sale must be active to mint a token");
        require(numberOfTokens <= MAX_PURCHASE, "Can only mint 20 tokens at a time");
        require(totalSupply.add(numberOfTokens) <= MAX_SUPPLY, "Purchase would exceed max supply of tokens");
        require(TOKEN_PRICE.mul(numberOfTokens) <= msg.value, "Ether value sent is not correct");

        for(uint i = 0; i < numberOfTokens; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            if (totalSupply < MAX_SUPPLY) {
                _safeMint(msg.sender, newItemId);
            }
        }

        totalSupply = totalSupply.add(numberOfTokens);
    }
}