
var FixedSupplyToken = artifacts.require("./FixedSupplyToken.sol");
var Stake = artifacts.require("./Stake.sol");

module.exports = function(deployer) {
  deployer.deploy(FixedSupplyToken).then(()=>deployer.deploy(Stake, FixedSupplyToken.address));
  // deployer.link(ConvertLib, MetaCoin);
   //deployer.deploy(Stake);
};
