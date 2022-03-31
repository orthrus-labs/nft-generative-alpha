// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import './interface/IERC721.sol';

contract Test{

    address public contractAddress;

    constructor(address _contractAddress){
        contractAddress = _contractAddress;
    }

    function callMint() public payable{
        IERC721(contractAddress).mint(msg.sender, 1);
    }

    function callMintWhitelist() public payable{
        IERC721(contractAddress).mintWhiteList(1);
    }    

}