# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

## Test

Run before: `export NODE_OPTIONS=--openssl-legacy-provider`

## Etherscan Verification

 Verify with `npx hardhat verify --network rinkeby 0xe1F870f9c77BDd55eAB931D0E2b1c1b3c0BB2f20 "Generation 101" "G101"`