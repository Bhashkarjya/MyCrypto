var DappToken = artifacts.require("DappToken");

contract('DappToken',function(accounts){
    it('sets the totalSupply after deployment',()=>{
        return DappToken.deployed().then(instance =>{
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(totalSupply => {
            assert.equal(totalSupply.toNumber(),1000000,'sets the totalSupply to 1,000,000')
        });
    });
});