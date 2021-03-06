const DappTokenSale = artifacts.require("./DappTokenSale");
const DappToken = artifacts.require("./DappToken");

contract('DappTokenSale', (accounts) => {
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000; // = 1e15
    var tokensAvailable = 750000;
    var admin = accounts[0];
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
        return DappToken.deployed().then(instance => {
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then((instance) => {
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable,{from: admin});
        }).then((receipt) => {
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
            return tokenInstance.balanceOf(buyer);
        }).then(balance => {
            assert.equal(balance.toNumber(),noOfTokens);
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(balance=> {
            assert.equal(balance.toNumber(),tokensAvailable - noOfTokens);
            return tokenSaleInstance.buyTokens(noOfTokens,{from: buyer, value: 1});
        }).then(assert.fail).catch(error => {
            assert(error.message.indexOf('revert') >= 0,'msg.value must be equal to tokens in wei');
            return tokenSaleInstance.buyTokens(800000,{from: buyer, value: noOfTokens*tokenPrice});
        }).then(assert.fail).catch(error => {
            assert(error.message.indexOf('revert') >= 0,'cannot purchase more tokens than available');
        });
    });

    it('end the Token sale', () => {
        return DappToken.deployed().then(instance => {
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then(instance => {
            tokenSaleInstance = instance;
            //Try to end sale by some account who is not the admin
            return tokenSaleInstance.endTokenSale({from: buyer});
        }).then(assert.fail).catch(error => {
            assert(error.message.indexOf('revert') >= 0,'only admin must end the tokenSale');
            return tokenSaleInstance.endTokenSale({from: admin});
        }).then(receipt => {
            return tokenInstance.balanceOf(admin);
        }).then(balance => {
            assert.equal(balance.toNumber(), 999990, 'returns all unsold DappTokens to admin');
        })
    });
});