// Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract PFPTest is ERC721, Ownable, PaymentSplitter {
    using Strings for uint256;
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant RESERVED_TOKENS = 30;
    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant MAX_PURCHASE = 20;
    uint256 public constant TOKEN_PRICE = 0.0001 ether;
    address[] private ADDRESS_LIST = [
        0xD1aDe89F8826d122F0a3Ab953Bc293E144042539,
        0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    ];
    uint256[] private SHARE_LIST = [95, 5];

    uint256 public revealTimestamp;
    bool public saleIsActive = false;

    constructor()
        ERC721("PFP Test", "PFPT")
        PaymentSplitter(ADDRESS_LIST, SHARE_LIST)
    {
        reserveTokens();
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmaNUFKMgdFGgTWd9ZWfLNozoXU4tCnNEs2qarLwxTreK7/";
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        ".json"
                    )
                )
                : "";
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function reserveTokens() public onlyOwner {
        uint256 i;
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

    function mintToken(uint256 numberOfTokens) public payable {
        require(saleIsActive, "Sale must be active to mint a token");
        require(
            numberOfTokens <= MAX_PURCHASE,
            "Can only mint 20 tokens at a time"
        );
        require(
            _tokenIds.current().add(numberOfTokens) <= MAX_SUPPLY,
            "Purchase would exceed max supply of tokens"
        );
        require(
            TOKEN_PRICE.mul(numberOfTokens) <= msg.value,
            "Ether value sent is not correct"
        );

        for (uint256 i = 0; i < numberOfTokens; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            if (newItemId < MAX_SUPPLY) {
                _safeMint(msg.sender, newItemId);
            }
        }
    }
}
