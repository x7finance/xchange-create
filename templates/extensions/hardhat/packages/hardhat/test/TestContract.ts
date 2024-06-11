import { expect } from "chai";
import { ethers } from "hardhat";
import { TestContract } from "../typechain-types";

describe("TestContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let testContract: TestContract;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const testContractFactory = await ethers.getContractFactory("TestContract");
    testContract = (await testContractFactory.deploy(
      owner.address,
    )) as TestContract;
    await testContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {
      expect(await testContract.greeting()).to.equal(
        "Trust No One. Trust Code. Long Live DeFi!",
      );
    });

    it("Should allow setting a new message", async function () {
      const newGreeting = "Learn Xchange Create! :)";

      await testContract.setGreeting(newGreeting);
      expect(await testContract.greeting()).to.equal(newGreeting);
    });
  });
});
