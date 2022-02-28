const hre = require("hardhat");

async function main() {
  const Squares = await hre.ethers.getContractFactory("Squares");
  const squares = await Squares.deploy("Generation 101", "G101");
  await squares.deployed();
  console.log("NFTSquares deployed to:", squares.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
