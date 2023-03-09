const Auction = artifacts.require("SimpleAuction");

module.exports = function (deployer) {
    deployer.deploy(Auction);
};