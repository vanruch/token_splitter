require("babel-polyfill");

// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import stake_artifacts from '../../build/contracts/Stake.json'
import token_artifacts from '../../build/contracts/FixedSupplyToken.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Stake = contract(stake_artifacts);
var FixedSupplyToken = contract(token_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Stake.setProvider(web3.currentProvider);
    FixedSupplyToken.setProvider(web3.currentProvider);
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalance();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: async function() {
    var self = this;    
    var stake = await Stake.deployed();
    try{
      var value = await stake.getBalance(account, {from: account});
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }
    catch(e){
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    }


  },

  refreshReceiversBalance: async function(){
    var stake = await Stake.deployed();
    var receiver1 = document.getElementById("receiver1").value;
    var receiver2 = document.getElementById("receiver2").value;
    var receiver1Balance = 0;
    var receiver2Balance = 0;
    try{
      if (receiver1){
        receiver1Balance = await stake.getBalance(receiver1);
      }
      if (receiver2){
        receiver2Balance = await stake.getBalance(receiver2);
      }
    }
    catch(e){
      console.log(e);
    }
    document.getElementById("r1balance").innerHTML = receiver1Balance;
    document.getElementById("r2balance").innerHTML = receiver2Balance;
  },

  sendCoin: async function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver1 = document.getElementById("receiver1").value;
    var receiver2 = document.getElementById("receiver2").value;

    this.setStatus("Initiating transaction... (please wait)");

    var token = await FixedSupplyToken.deployed();
    var stake = await Stake.deployed();

    try{

      await token.approve.sendTransaction(stake.address, amount, {from: account});
      await stake.shareMoney.sendTransaction(receiver1, receiver2, amount, {from: account});
      self.setStatus("Transaction complete!");
      self.refreshBalance();
      self.refreshReceiversBalance();
    }
    catch(e){
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    }

  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
