var DappToken = artifacts.require("DappToken");

contract('DappToken',function(accounts){

    var totalInstance;
    // var acc = web3.eth.getAccounts();
    it('initializes the contract with the correct values', () => {
        return DappToken.deployed().then(instance => {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(name => {
            assert.equal(name, "Dapp Token", "sets the correct name");
            return tokenInstance.symbol();
        }).then(symbol => {
            assert.equal(symbol, 'Dapp Symbol', "sets the correct symbol");
            return tokenInstance.standard();
        }).then(standard => {
            assert.equal(standard, "Dapp Token version 1.0","sets the correct standard");
        });
    });

    it('allocates the initial supply after deployment',()=>{
        return DappToken.deployed().then(instance =>{
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(totalSupply => {
            assert.equal(totalSupply.toNumber(),1000000,'sets the totalSupply to 1,000,000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(adminBalance => {
            assert(adminBalance.toNumber(),1000000,"it allocates the initial supply to the admin account");
        });
    });

    it('transfers token ownership', ()=> {
        return DappToken.deployed().then(instance => {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1],99999999999999);
        }).then(assert.fail).catch(error=>{
            assert(error.message.indexOf('revert')>= 0,'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1],250000,{from: accounts[0]});
        }).then(success => {
            assert.equal(success,true,'it returns true');
            return tokenInstance.transfer(accounts[1],250000,{from: accounts[0]});
        }).then(receipt => {
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Transfer','should emit the Transfer event');
            assert.equal(receipt.logs[0].args._from,accounts[0],'the tokens are transferred from this account');
            assert.equal(receipt.logs[0].args._to,accounts[1],'the tokens are transferred to this account');
            assert.equal(receipt.logs[0].args._value,250000,'the amount of tokens that have been transferred');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(balance =>{
            assert.equal(balance.toNumber(),250000,'adds the amount to the receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(balance => {
            assert.equal(balance.toNumber(),750000,'debits the amounts from the sending account');
        })
    })
});