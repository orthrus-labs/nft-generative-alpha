const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Squares Contract", function () {
  before(async () => {
    //get Signers
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners()
    //deploying contracts
    Squares = await ethers.getContractFactory('Squares');
    squares = await Squares.deploy("name", "symbol", "notRevealedUri", "provenanceHash");
    await squares.deployed();
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
      try{
        await squares.connect(addr1).mint(addr1.address, 1 ,{from: addr1.address, value:0});
      }catch(err){
        expect(err).to.not.be.undefined;
        console.log(err);
      } 
      await squares.connect(addr1).mint(addr1.address, 5 ,{from: addr1.address, value:ethers.constants.WeiPerEther});
      expect(await squares.totalSupply()).to.equal(8);
    });
    it("Shouldn't allow a user to mint when the contract is paused", async () => {
      await squares.connect(owner).pause(true ,{from: owner.address});
      expect(await squares.paused()).to.equal(true);
      try{
        await squares.connect(addr1).mint(addr1.address, 5 ,{from: addr1.address, value:ethers.constants.WeiPerEther});
      }catch(err){
        expect(err).to.not.be.undefined;
      }      
    });
    it("Should change the base price", async () => {
      await squares.setCost(100, {from: owner.address});
      expect(await squares.cost()).to.equal(100);
      //only the owner can change the base price
      try{
        await squares.connect(addr1).setCost(0 ,{from: addr1.address});
      }catch(err){
        expect(err).to.not.be.undefined;
      } 
    });
  });

  describe("BaseURi and Reveal", async () => {
    it("Should set the initial TokenURIs  equal to notRevealedUri", async ()  => {
      expect(await squares.tokenURI(1)).to.equal("notRevealedUri");
      expect(await squares.tokenURI(2)).to.equal("notRevealedUri");
      expect(await squares.tokenURI(3)).to.equal("notRevealedUri");
    })
    it("Should set the correct TokenURI after the reveal", async ()  => {
      //await squares.setBaseURI("test/",{from: owner.address});
      await squares.reveal("ipfs://QmUZCdKUv6Kj6CrkpAkyTN3prbdNv1g7eqUDAyRHSjZLg9/opera-",{from:owner.address});
      expect(await squares.tokenURI(1)).to.equal("ipfs://QmUZCdKUv6Kj6CrkpAkyTN3prbdNv1g7eqUDAyRHSjZLg9/opera-1");
      expect(await squares.tokenURI(2)).to.equal("ipfs://QmUZCdKUv6Kj6CrkpAkyTN3prbdNv1g7eqUDAyRHSjZLg9/opera-2");
      expect(await squares.tokenURI(3)).to.equal("ipfs://QmUZCdKUv6Kj6CrkpAkyTN3prbdNv1g7eqUDAyRHSjZLg9/opera-3");
    })
    it("Shouldn't allow anyone to change the baseURI more than one time", async ()  => {
      try{
        await squares.setBaseURI("newTest" ,{from: owner.address});
      }catch(err){
        expect(err).to.not.be.undefined;
      } 
    })
  });

  describe("Withdraw", async () => {
    it("Should let the owner withdraw ether from the contract", async ()  => {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      await squares.withdraw({from: owner.address});
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.above(initialBalance);
    })
  });

  describe("Provenance Hash", async () => {
    it("Should set the initial provenance hahs to an empty string", async ()  => {
      expect(await squares.ProvenanceHash()).to.be.equal("provenanceHash");
    })
    it("Should allow the user to change the provenance hash", async ()  => {
      await squares.setProvenanceHash("AAA", {from : owner.address});
      expect(await squares.ProvenanceHash()).to.be.equal("AAA");
    })
  });

  describe("Whitelist", async () => {
    it("Should set the isWhiteListActive variable to true", async ()  => {
      await squares.setIsWhiteListActive(true, {from: owner.address});
      expect(await squares.isWhiteListActive()).to.equal(true);
    })
    it("Should add addr2 to the whitelist and give it 5 NFTs available to mint with the mintWhiteList function", async ()  => {
      await squares.setWhiteList([addr2.address], 5, {from: owner.address});
      expect(await squares.numAvailableToMint(addr2.address)).to.equal(5);
      try{
        await squares.connect(addr2).mintWhiteList(5, {from: addr2.address, value: 0});
      }catch(err){
        expect(err).to.not.be.undefined;
        console.log(err);
        console.log(await squares.totalSupply())
        console.log(await squares.cost())
      } 
    })
    it("Should let addr2 to mint 5 NFTs with the mintWhiteList function", async ()  => {
      console.log(await squares.totalSupply())
      await squares.connect(addr2).mintWhiteList(5, {from: addr2.address, value: 500});
      expect(await squares.balanceOf(addr2.address)).to.equal(5);
      expect(await squares.numAvailableToMint(addr2.address)).to.equal(0);
      try{
        await squares.connect(addr2).mintWhiteList(1, {from: addr2.address, value:ethers.constants.WeiPerEther});
      }catch(err){
        expect(err).to.not.be.undefined;
      } 
    })
  });

});