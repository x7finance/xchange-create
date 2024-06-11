//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/TestContract.sol";
import "./DeployHelpers.s.sol";

contract DeployScript is XchangeCreateDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `pnpm run generate` to generate a new random account"
            );
        }
        vm.startBroadcast(deployerPrivateKey);
        TestContract testContract =
            new TestContract(vm.addr(deployerPrivateKey));
        console.logString(
            string.concat(
                "TestContract deployed at: ", vm.toString(address(testContract))
            )
        );
        vm.stopBroadcast();

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the custom xchange-create hooks, for example.
         * This function should be called last.
         */
        exportDeployments();
    }

    function test() public {}
}
