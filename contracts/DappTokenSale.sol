pragma solidity >=0.4.22 <0.9.0;
import "./DappToken.sol";

contract DappTokenSale {

    address admin;
    uint256 public tokenPrice;
    DappToken public tokenContract;
    uint256 public tokensSold;

    event Sell(
        address _buyer, uint256 _amount
    );

    constructor (DappToken _token_contract, uint256 _token_price) public {
        admin = msg.sender;
        tokenContract = _token_contract;
        tokenPrice = _token_price;
    }

    function multiply(uint x,uint y) internal pure returns (uint z){
        require(y == 0 || (z = x*y)/ y == x);
    }
    function buyTokens(uint256 _numberOfTokens) public payable{
        require(msg.value == multiply(_numberOfTokens,tokenPrice));
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }
}