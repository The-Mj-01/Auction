const MyNFT = artifacts.require("MyNFT");

module.exports = async function (deployer) {
    await deployer.deploy(MyNFT, "MyNFT", "MNFT");
};