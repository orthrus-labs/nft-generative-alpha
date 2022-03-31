const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Squares Contract", function () {
  before(async () => {
    //get Signers
    [owner, royaltiesAddress, addr1, addr2, addr3, ...addrs] = await ethers.getSigners()
    //deploying contracts
    Squares = await ethers.getContractFactory('Squares');
    squares = await Squares.deploy("name", "symbol", "notRevealedUri", "");
    await squares.deployed();
    Test = await ethers.getContractFactory('Test');
    test = await Test.deploy(squares.address);
    await test.deployed();
  });
  describe("Owner", async function () {
    it("Should set the correct owner", async () => {
      expect(await squares.owner()).to.equal(owner.address);
    });
  });

  describe("Mint", async function () {
    it("Should mint 3 NFTs to the owner when deployed", async () => {
      expect(await squares.totalSupply()).to.equal(3);
      expect(await squares.ownerOf(1)).to.equal(owner.address);
      expect(await squares.ownerOf(2)).to.equal(owner.address);
      expect(await squares.ownerOf(3)).to.equal(owner.address);
    });
    it("Should mint the selected amount of NFTs", async () => {
      await expect(squares.connect(addr1).mint(addr1.address, 1, { from: addr1.address, value: 0 })).to.be.revertedWith("Ether value sent is not correct")
      await squares.connect(addr1).mint(addr1.address, 5, { from: addr1.address, value: ethers.utils.parseEther("0.05") });
      expect(await squares.totalSupply()).to.equal(8);
    });
    it("Shouldn't allow a user to mint more than 5 NFTs", async () => {
      await expect(squares.mint(owner.address, 6, { from: owner.address, value: ethers.utils.parseEther("0.06") })).to.be.revertedWith('Max mint amount exceeded')
      expect(await squares.totalSupply()).to.equal(8);
    });
    it("Shouldn't allow a user to mint when the contract is paused", async () => {
      await squares.connect(owner).pause(true, { from: owner.address });
      expect(await squares.paused()).to.equal(true);
      await expect(squares.connect(addr1).mint(addr1.address, 5, { from: addr1.address, value: ethers.utils.parseEther("0.05")})).to.be.revertedWith('The mint function is paused')
      expect(await squares.totalSupply()).to.equal(8);
    });
    it("Should change the base price", async () => {
      await squares.setCost(100, { from: owner.address });
      expect(await squares.cost()).to.equal(100);
    });
  });

  describe("BaseURi and Reveal", async () => {
    it("Should set the initial TokenURIs  equal to notRevealedUri", async () => {
      expect(await squares.tokenURI(1)).to.equal("notRevealedUri");
      expect(await squares.tokenURI(2)).to.equal("notRevealedUri");
      expect(await squares.tokenURI(3)).to.equal("notRevealedUri");
    })
    it("Should set the correct TokenURI after the reveal", async () => {
      //await squares.setBaseURI("test/",{from: owner.address});
      await squares.reveal("ipfs://QmUZCdKUv6Kj6CrkpAkyTN3prbdNv1g7eqUDAyRHSjZLg9/opera-", { from: owner.address });
      expect(await squares.tokenURI(1)).to.equal("ipfs://QmUZCdKUv6Kj6CrkpAkyTN3prbdNv1g7eqUDAyRHSjZLg9/opera-1");
      expect(await squares.tokenURI(2)).to.equal("ipfs://QmUZCdKUv6Kj6CrkpAkyTN3prbdNv1g7eqUDAyRHSjZLg9/opera-2");
      expect(await squares.tokenURI(3)).to.equal("ipfs://QmUZCdKUv6Kj6CrkpAkyTN3prbdNv1g7eqUDAyRHSjZLg9/opera-3");
    })
    it("Shouldn't allow anyone to change the baseURI more than one time", async () => {
      await expect(squares.setBaseURI("newTest", { from: owner.address })).to.be.revertedWith('The base URI cannot be changed again');
    })
  });

  describe("Withdraw", async () => {
    it("Should let the owner withdraw ether from the contract", async () => {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      await squares.withdraw({ from: owner.address });
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.above(initialBalance);
    })
  });

  describe("Provenance Hash", async () => {
    it("Should set the initial provenance hahs to an empty string", async () => {
      expect(await squares.ProvenanceHash()).to.be.equal("");
    })
    it("Should allow the user to change the provenance hash", async () => {
      await squares.setProvenanceHash("AAA", { from: owner.address });
      expect(await squares.ProvenanceHash()).to.be.equal("AAA");
    })
  });

  describe("Whitelist", async () => {
    it("Should set the isWhiteListActive variable to true", async () => {
      await squares.setIsWhiteListActive(true, { from: owner.address });
      expect(await squares.isWhiteListActive()).to.equal(true);
    })
    it("Should add addr2 to the whitelist and give it 5 NFTs available to mint with the mintWhiteList function", async () => {
      await squares.setWhiteList([addr2.address], 5, { from: owner.address });
      expect(await squares.numAvailableToMint(addr2.address)).to.equal(5);
      await expect(squares.connect(addr2).mintWhiteList(5, { from: addr2.address, value: 0 })).to.be.revertedWith('Ether value sent is not correct')
    })
    it("Should let addr2 to mint 5 NFTs with the mintWhiteList function", async () => {
      await squares.connect(addr2).mintWhiteList(5, { from: addr2.address, value: 500 });
      expect(await squares.balanceOf(addr2.address)).to.equal(5);
      expect(await squares.numAvailableToMint(addr2.address)).to.equal(0);
      await expect(squares.connect(addr2).mintWhiteList(1, { from: addr2.address, value: ethers.utils.parseEther("0.01") })).to.be.revertedWith('Exceeded max available to purchase')
    })
  });

  describe("Royalties", async () => {
    it("Should set the correct address for the royalties wallet", async () => {
      squares.setRoyaltiesWallet(royaltiesAddress.address, { from: owner.address });
      expect(await squares.royaltiesWallet()).to.be.equal(royaltiesAddress.address);
    })
    it("Should return the correct royalty info", async () => {
      const royaltyInfo = await squares.royaltyInfo(1, 10000)
      expect(royaltyInfo[1]).to.eq(500)
      expect(royaltyInfo[0]).to.eq(royaltiesAddress.address)
    })
  });

  describe("Caller is user", async () => {
    it("Shouldn't mint from Test contract", async () => {
      await expect(test.callMint({from: owner.address})).to.be.revertedWith("The caller is another contract");
      await expect(test.callMintWhitelist({from: owner.address})).to.be.revertedWith("The caller is another contract");
    })
  })

  describe("Owner", async () => {
    it("Should set the correct owner", async () => {
      expect(await squares.owner()).to.eq(owner.address)
    })
    it("Shouldn't allow addr1 to call only owner functions", async () => {
      await expect(squares.connect(addr1).setCost(100, {from: addr1.address})).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(squares.connect(addr1).setmaxMintAmount(100, {from: addr1.address})).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(squares.connect(addr1).setBaseURI('newBaseURI', {from: addr1.address})).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(squares.connect(addr1).setProvenanceHash('newProvenanceHash', {from: addr1.address})).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(squares.connect(addr1).pause(true, {from: addr1.address})).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(squares.connect(addr1).setIsWhiteListActive(false, {from: addr1.address})).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(squares.connect(addr1).setWhiteList([addr1.address], 5, {from: addr1.address})).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(squares.connect(addr1).setRoyaltiesWallet(addr1.address, {from: addr1.address})).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(squares.connect(addr1).withdraw({from: addr1.address})).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(squares.connect(addr1).reveal('newURI',{from: addr1.address})).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })

});