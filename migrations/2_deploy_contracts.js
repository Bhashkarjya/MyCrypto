const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

module.exports = function (deployer) {
  deployer.deploy(DappToken, 1000000). then( ()=> {
    var tokenPrice = 1000000000000000; // =1e15 in wei; 1 ether = 1e18 wei
    return deployer.deploy(DappTokenSale,DappToken.address,tokenPrice);
  });
};
