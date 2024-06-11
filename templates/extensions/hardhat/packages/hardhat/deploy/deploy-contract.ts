import { HardhatRuntimeEnvironment } from "hardhat/types";

import { CONTRACT_NAMES } from "../utils/constants";
import { parseEther } from "viem";

export default async function deployContract(
  hre: HardhatRuntimeEnvironment,
): Promise<`0x${string}` | undefined> {
  const contractName = process.env.CONTRACT_NAME as keyof typeof CONTRACT_NAMES;

  if (!contractName) {
    throw new Error("CONTRACT_NAME environment variables are required.");
  }
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `pnpm run deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `pnpm run generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `pnpm run account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  try {
    const res = await deploy(contractName, {
      from: deployer,
      // Contract constructor arguments
      args: generateArgs(contractName),
      log: true,
      autoMine: true,
    });

    console.log("Contract deployed to:", res.address);

    return res.address as `0x${string}`;
  } catch (error) {
    console.error("There was a problem deploying the contract:", error);
  }
}

deployContract.tags = ["deployContract"];

function generateArgs(contractName: keyof typeof CONTRACT_NAMES): any[] {
  if (
    !process.env.TOKEN_NAME ||
    !process.env.TOKEN_SYMBOL ||
    !process.env.TOKEN_SUPPLY
  ) {
    throw new Error(
      "TOKEN_NAME, TOKEN_SYMBOL, and TOKEN_SUPPLY environment variables are required.",
    );
  }

  switch (contractName) {
    case CONTRACT_NAMES.MOCK_ERC20:
      return [
        process.env.TOKEN_NAME,
        process.env.TOKEN_SYMBOL,
        parseEther(process.env.TOKEN_SUPPLY),
      ];

    case CONTRACT_NAMES.StandardToken:
      return [
        process.env.TOKEN_NAME,
        process.env.TOKEN_SYMBOL,
        parseEther(process.env.TOKEN_SUPPLY),
      ];

    case CONTRACT_NAMES.DeflationaryToken:
      return [
        process.env.TOKEN_NAME,
        process.env.TOKEN_SYMBOL,
        parseEther(process.env.TOKEN_SUPPLY),
      ];

    default:
      throw new Error(`Unknown contract name: ${contractName}`);
  }
}

deployContract.tags = ["deploy:contract"];
