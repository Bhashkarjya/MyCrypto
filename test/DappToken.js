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
        });
    });

    it("approves tokens for delegated transfer",() => {
        return DappToken.deployed().then(instance => {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1],100);
        }).then(success => {
            assert.equal(success,true,'it returns true');
            return tokenInstance.approve(accounts[1],100, {from: accounts[0]}); 
        }).then(receipt => {
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Approval','should emit the Approval event');
            assert.equal(receipt.logs[0].args._owner,accounts[0],'the tokens are transferred from this account');
            assert.equal(receipt.logs[0].args._spender,accounts[1],'the tokens are transferred to this account');
            assert.equal(receipt.logs[0].args._value,100,'the amount of tokens that have been transferred');
            return tokenInstance.allowance(accounts[0],accounts[1]);
        }).then(allowance => {
            assert.equal(allowance.toNumber(),100,"stores the allowance for the delegated transfer");
        });
    });

    it('handles delegated token transfers', () => {
        return DappToken.deployed().then(instance => {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
        }).then(receipt => {
            return tokenInstance.approve(spendingAccount,10, {from: fromAccount});
        }).then(receipt => {
            return tokenInstance.transferFrom(fromAccount,toAccount,9999,{from: spendingAccount});
        }).then(assert.fail).catch(error=>{
            assert(error.message.indexOf('revert')>=0,'cannot transfer value larger than balance');
            return tokenInstance.transferFrom(fromAccount,toAccount,20,{from: spendingAccount});
        }).then(assert.fail).catch(error=>{
            assert(error.message.indexOf('revert')>=0,'cannot transfer value larger than approved');
            return tokenInstance.transferFrom.call(fromAccount,toAccount,10,{from: spendingAccount});
        }).then(success => {
            assert.equal(success,true,'it returns true');
            return tokenInstance.transferFrom(fromAccount,toAccount,10,{from: spendingAccount});
        }).then(receipt => {
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Transfer','should emit the Transfer event');
            assert.equal(receipt.logs[0].args._from,fromAccount,'the tokens are transferred from this account');
            assert.equal(receipt.logs[0].args._to,toAccount,'the tokens are transferred to this account');
            assert.equal(receipt.logs[0].args._value,10,'the amount of tokens that have been transferred');
            return tokenInstance.balanceOf(fromAccount);
        }).then(balance => {
            assert.equal(balance.toNumber(),90,'deducts the amount from the sending Account');
            return tokenInstance.balanceOf(toAccount);
        }).then(balance => {
            assert.equal(balance.toNumber(),10,'adds the amount to the receiving Account');
            return tokenInstance.allowance(fromAccount,spendingAccount);
        }).then(allowance => {
            assert.equal(allowance,0,'deducts the amount from the allowance');
        })
    })
}); 