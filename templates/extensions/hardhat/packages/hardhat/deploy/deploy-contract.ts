import { HardhatRuntimeEnvironment } from "hardhat/types";

import ora from "ora";
import { CREATED_CONTRACTS, ChainId, getScannerUrl } from "../utils/constants";
import chalk from "chalk";
import { parseEther } from "viem";
import fs from "fs";
import path from "path";

export default async function deployContract(
  hre: HardhatRuntimeEnvironment,
): Promise<`0x${string}` | undefined> {
  const contractName = process.env.TOKEN_NAME as keyof typeof CREATED_CONTRACTS;

  if (!contractName) {
    throw new Error("Contract has not been created or created properly.");
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
    console.log(chalk.blueBright(`----------------------------------------`));
    console.log(
      chalk.blueBright(`
Xchange Create is deploying ${contractName} from: ${chalk.gray(
        getScannerUrl(
          hre.network.config.chainId ?? ChainId.HARDHAT,
          deployer,
          "address",
        ),
      )}`),
    );

    const spinner = ora(
      chalk.yellowBright(`
      ┌───────────────────────────────────────────────┐
      │                                               │
      │            Deploying your contract...         │
      │                                               │
      └───────────────────────────────────────────────┘
      `),
    ).start();

    const res = await deploy(contractName, {
      from: deployer,
      args: generateContractArgs(),
      log: true,
      autoMine: true,
    });

    // Add contract address to .env file
    const envPath = path.join(__dirname, "../.env");
    const envContent = fs.readFileSync(envPath, "utf8");
    const updatedContent = envContent.includes("TOKEN_ADDRESS=")
      ? envContent.replace(/TOKEN_ADDRESS=.*/, `TOKEN_ADDRESS=${res.address}`)
      : `${envContent}\nTOKEN_ADDRESS=${res.address}`;

    fs.writeFileSync(envPath, updatedContent);

    spinner.succeed(`
${chalk.green(`Contract successfully deployed`)}
  
  Contract: ${chalk.gray(contractName)}
  Address:  ${chalk.gray(
    getScannerUrl(
      hre.network.config.chainId ?? ChainId.HARDHAT,
      res.address,
      "address",
    ),
  )}
  Tx:  ${chalk.gray(
    getScannerUrl(
      hre.network.config.chainId ?? ChainId.HARDHAT,
      `${res.transactionHash}`,
      "tx",
    ),
  )}
  `);

    console.log(chalk.blueBright(`----------------------------------------`));
    return res.address as `0x${string}`;
  } catch (error) {
    console.error("There was a problem deploying the contract:", error);
  }
}

deployContract.tags = ["deployContract"];

function generateContractArgs(): any[] {
  if (
    !process.env.TOKEN_NAME ||
    !process.env.TOKEN_SYMBOL ||
    !process.env.TOKEN_SUPPLY
  ) {
    throw new Error(
      "TOKEN_NAME, TOKEN_SYMBOL, and TOKEN_SUPPLY environment variables are required.",
    );
  }

  return [
    process.env.TOKEN_NAME,
    process.env.TOKEN_SYMBOL,
    parseEther(process.env.TOKEN_SUPPLY),
  ];
}

deployContract.tags = ["deploy:contract"];
