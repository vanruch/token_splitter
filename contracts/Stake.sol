pragma solidity ^0.4.4;

import "./FixedSupplyToken.sol";

contract Stake {

    ERC20Interface token;

    function Stake(ERC20Interface _token){
        token=_token;
    }       

    function shareMoney(address stakeHolder1, address stakeHolder2, uint amount){
        token.transferFrom(msg.sender, stakeHolder1,amount/2);
        token.transferFrom(msg.sender, stakeHolder2,amount/2);
    }
    
    function getBalance(address stakeHolder) constant returns (uint){
        return token.balanceOf(stakeHolder);
    }
}
