// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/TestContract.sol";

contract TestContractTest is Test {
    TestContract public testContract;

    function setUp() public {
        testContract = new TestContract(vm.addr(1));
    }

    function testMessageOnDeployment() public view {
        require(
            keccak256(bytes(testContract.greeting()))
                == keccak256("Trust No One. Trust Code. Long Live DeFi!")
        );
    }

    function testSetNewMessage() public {
        testContract.setGreeting("Learn Xchange-Create! :)");
        require(
            keccak256(bytes(testContract.greeting()))
                == keccak256("Learn Xchange-Create! :)")
        );
    }
}
