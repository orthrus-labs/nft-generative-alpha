const { expect } = require("chai");

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const Squares = await ethers.getContractFactory("Squares");

    const squares = await Squares.deploy("Random Squares", "RS");
    expect(await squares.totalSupply()).to.equal(3);
  });
});