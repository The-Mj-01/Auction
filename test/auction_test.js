const auction_test = artifacts.require("auction_test");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("auction_test", function (/* accounts */) {
  it("should assert true", async function () {
    await auction_test.deployed();
    return assert.isTrue(true);
  });
});
