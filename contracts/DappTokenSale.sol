pragma solidity >=0.4.22 <0.9.0;
//SPDX-License-Identifier: MIT
import "./DappToken.sol";

contract DappTokenSale {

    address admin;
    uint256 public tokenPrice;
    DappToken public tokenContract;
    uint256 public tokensSold;

    event Sell(
        address _buyer, uint256 _amount
    );

    constructor (DappToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x,uint y) internal pure returns (uint z)
    {
        require(y == 0 || (z = x*y)/ y == x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable
    {
        require(msg.value == multiply(_numberOfTokens,tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endTokenSale() public {
        //Require that only admin can end a sale
        require(msg.sender == admin);
        //Transfer remaining Dapp Tokens to the admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        //Destroy the token
    }
}