pragma solidity >=0.4.22 <0.9.0;
//SPDX-License-Identifier: MIT
contract DappToken{
    string public name = "Dapp Token";
    string public symbol = "Dapp Symbol";
    string public standard = "Dapp Token version 1.0";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval (
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    constructor (uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success){
        // Transfer()
        // ---> Transfers the given tokens to the address
        // ---> Throws an exception if the account balance is less the amount that you are sending
        require(balanceOf[msg.sender]>=_value);
        //If it returns false, then the execution of the function stops after this line, else it continues
        balanceOf[msg.sender]-= _value;
        balanceOf[_to] += _value;
        //credited and debited
        emit Transfer(msg.sender, _to, _value);
        //emit the Transfer event
        return true;
        //returns a boolean value
    }

    function approve(address _spender, uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
        require(_value <= balanceOf[_from]);
        require(_value <=allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}