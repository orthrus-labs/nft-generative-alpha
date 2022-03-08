// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Squares is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string public baseURI;
    uint256 public cost = 0.01 ether;
    uint256 public maxSupply = 100;
    uint256 public maxMintAmount = 5;
    bool public paused = false;
    string public ProvenanceHash = "";
    mapping(address => uint256) private whitelist;
    bool public locked = false;
    bool public revealed = false;
    bool public isWhiteListActive = false;
    string public notRevealedUri;

    constructor(string memory _name, string memory _symbol, string memory _notRevealedUri, string memory _provenanceHash)
        ERC721(_name, _symbol)
    {
        notRevealedUri = _notRevealedUri;
        ProvenanceHash = _provenanceHash;
        mint(msg.sender, 3);
    }

    // internal
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // public
    function mint(address _to, uint256 _mintAmount) public payable {
        uint256 supply = totalSupply();
        require(!paused, "The mint function is paused");
        require(_mintAmount > 0, "You must mint at least 1 NFT");
        require(_mintAmount <= maxMintAmount, "Max mint amount exceeded");
        require(supply + _mintAmount <= maxSupply, "Max supply exceeded");

        if (msg.sender != owner()) {
            require(msg.value >= cost * _mintAmount,"Ether value sent is not correct");
        }

        for (uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(_to, supply + i);
        }
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
        
        if(revealed == false) {
            return notRevealedUri;
        }

        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, tokenId.toString()))
            : "";
    }

    function reveal(string memory newURI) public onlyOwner {
        setBaseURI(newURI);
        revealed = true;
    }

    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    //only owner
    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        require(locked == false);
        baseURI = _newBaseURI;
        locked = true;
    }

    function setProvenanceHash(string memory provenanceHash) public onlyOwner {
        ProvenanceHash = provenanceHash;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function setIsWhiteListActive(bool _isWhiteListActive) external onlyOwner {
        isWhiteListActive = _isWhiteListActive;
    }

    function setWhiteList(address[] calldata addresses, uint256 numAllowedToMint) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = numAllowedToMint;
        }
    }

    function mintWhiteList(uint256 numberOfTokens) external payable {
        uint256 supply = totalSupply();
        require(isWhiteListActive, "Allow list is not active");
        require(numberOfTokens <= whitelist[msg.sender], "Exceeded max available to purchase");
        require(numberOfTokens > 0, "You must mint at least 1 NFT");
        require(numberOfTokens <= maxMintAmount, "Max mint amount exceeded");
        require(supply + numberOfTokens <= maxSupply, "Max supply exceeded");
        require(msg.value >= cost * numberOfTokens, "Ether value sent is not correct");

        whitelist[msg.sender] -= numberOfTokens;
        for (uint256 i = 1; i <= numberOfTokens; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    function numAvailableToMint(address addr) external view returns (uint256) {
        return whitelist[addr];
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
