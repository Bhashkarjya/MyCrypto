const DappTokenSale = artifacts.require("DappTokenSale");

contract('DappTokenSale', (accounts) => {
    var tokenSaleInstance;
    var tokenPrice = 1000000000000000; // = 1e15
    var buyer = accounts[1];
    var noOfTokens;
    it('initializes the contract with the correct values', () => {
        return DappTokenSale.deployed().then(instance => {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(address => {
            assert.notEqual(address,0x0,"has contract address");
            return tokenSaleInstance.tokenContract;
        }).then(address => {
            assert.notEqual(address,0x0,"has token contract address");
            return tokenSaleInstance.tokenPrice();
        }).then(price => {
            assert.equal(price, tokenPrice, "has correct token price");
        })
    });

    it('facilitates token buying', () => {
        return DappTokenSale.deployed().then(instance => {
            tokenSaleInstance = instance;
            noOfTokens = 10;
            return tokenSaleInstance.buyTokens(noOfTokens, {from: buyer, value: noOfTokens*tokenPrice});
        }).then(receipt => {
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Sell','triggers the Sell event');
            assert.equal(receipt.logs[0].args._buyer,buyer,'logs the account that purchases the tokens');
            assert.equal(receipt.logs[0].args._amount,noOfTokens,'logs the amount of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(amount => {
            assert.equal(amount.toNumber(),noOfTokens,'increments the number of Tokens sold');
            return tokenSaleInstance.buyTokens(noOfTokens,{from: buyer, value: 1});
        }).then(assert.fail).catch(error => {
            assert(error.message.indexOf('revert') >= 0,'msg.value must be equal to tokens in wei');
        });
    });
});