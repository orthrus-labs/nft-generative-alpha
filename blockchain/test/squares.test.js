const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Squares Contract", function () {
  before(async () => {
    //get Signers
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners()
    //deploying contracts
    Squares = await ethers.getContractFactory('Squares');
    squares = await Squares.deploy("Test", "test");
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
      await squares.setCost(0, {from: owner.address});
      expect(await squares.cost()).to.equal(0);
      //only the owner can change the base price
      try{
        await squares.connect(addr1).setCost(0 ,{from: addr1.address});
      }catch(err){
        expect(err).to.not.be.undefined;
      } 
    });
  });

  describe("BaseURi", async () => {
    it("Should set the correct URI", async ()  => {
      await squares.setBaseURI("test", {from: owner.address});
      expect(await squares.baseURI()).to.equal("test");
    })
    it("Should set the correct TokenURI", async ()  => {
      expect(await squares.tokenURI(1)).to.equal("test1");
    })
    it("Shouldn't allow anyone to change the baseURI more than one time", async ()  => {
      try{
        await squares.setBaseURI("newTest" ,{from: owner.address});
      }catch(err){
        expect(err).to.not.be.undefined;
        expect(await squares.tokenURI(1)).to.equal("test1");
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
      expect(await squares.ProvenanceHash()).to.be.equal("");
    })
    it("Should allow the user to change the provenance hash", async ()  => {
      await squares.setProvenanceHash("AAA", {from : owner.address});
      expect(await squares.ProvenanceHash()).to.be.equal("AAA");
    })
  });

});