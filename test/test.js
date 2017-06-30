require("babel-polyfill");

var Stake = artifacts.require("./Stake.sol");
var FixedSupplyToken = artifacts.require("./FixedSupplyToken.sol")

contract('FixedSupplyToken', function(accounts){
  it('transfer tokens', async function(){
    var token = await FixedSupplyToken.new();

    await token.transfer(accounts[1], 5);

    assert.equal(await token.balanceOf(accounts[1]), 5, "didn't get tokens");
    assert.equal(await token.balanceOf(accounts[0]), 1000000-5, "didn't spend tokens"); 
    
  })
});

contract('Stake', function(accounts) {
  var token, stake;
  beforeEach(async function(){
    token = await FixedSupplyToken.new();
    stake = await Stake.new(token.address);
  })

  it("should split 10000 ethers in half", async function() {
    var amount = 10000;
    

    var accountOneBalanceBefore = await stake.getBalance(accounts[1]);
    var accountTwoBalanceBefore = await stake.getBalance(accounts[2]);   

    await token.approve(stake.address, amount);
    await stake.shareMoney(accounts[1],accounts[2], amount);

    var accountOneBalanceAfter = await stake.getBalance(accounts[1]);
    var accountTwoBalanceAfter = await stake.getBalance(accounts[2]);    
    
    assert.equal(accountOneBalanceAfter.minus(accountOneBalanceBefore) , amount/2, "should get 5000");
    assert.equal(accountTwoBalanceAfter.minus(accountTwoBalanceBefore), amount/2, "should get 5000");
    
  });

  it("should have 1000000 tokens in begining", async function() {
    
    var balance = await stake.getBalance(accounts[0]);
        
    assert.equal(balance.valueOf() , 1000000, "should get 1000000");
    
  });

  it("should remove our 10000 tokens", async function() {
    var amount = 10000;
    

    var accountBalanceBefore = await stake.getBalance(accounts[0]);

    await token.approve(stake.address, amount);
    await stake.shareMoney(accounts[1],accounts[2], amount);

    var accountBalanceAfter = await stake.getBalance(accounts[0]);
    
    assert.equal(accountBalanceBefore.minus(accountBalanceAfter) , amount, "should get 10000");
    
  });

  it("should not make transaction with not enough money", async function(){
    var amount = 1000000000;    

    var accountBalanceBefore = await stake.getBalance(accounts[0]);

    await token.approve(stake.address, amount);
    try{
      await stake.shareMoney(accounts[1],accounts[2], amount);
      assert(false, 'expected exception');
    }
    catch(e){
      var accountBalanceAfter = await stake.getBalance(accounts[0]);
      assert.equal(accountBalanceBefore, accountBalanceAfter);
    }

  });

});
