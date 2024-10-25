import { ethers } from "ethers";
import path from "path";
import { parse, stringify } from "envfile";
import * as fs from "fs";
import chalk from "chalk";
import { UTILITY_DEPLOYER_ADDRESS } from "../utils/constants";

const envFilePath = "./.env";

/**
 * Generate a new random private key and write it to the .env file
 */
const setNewEnvConfig = (existingEnvConfig = {}) => {
  console.log(chalk.gray("Generating new wallet..."));
  const randomWallet = ethers.Wallet.createRandom();

  const newEnvConfig = {
    ...existingEnvConfig,
    DEPLOYER_ADDRESS: randomWallet.address,
    DEPLOYER_PRIVATE_KEY: randomWallet.privateKey,
  };

  // Store in .env
  fs.writeFileSync(envFilePath, stringify(newEnvConfig));
  console.log(chalk.gray("Private Key saved to packages/hardhat/.env file"));
  console.log(
    chalk.gray("Generated wallet address:"),
    chalk.green(randomWallet.address),
  );

  console.log(
    chalk.gray("Updating all the contracts with the new wallet address"),
  );

  const contractsDirectory = path.join(
    __dirname,
    "..",
    "..",
    "hardhat",
    "contracts",
  );
  const contractFiles = fs.readdirSync(contractsDirectory);
  contractFiles.forEach(file => {
    const contractContent = fs.readFileSync(
      path.join(contractsDirectory, file),
      "utf8",
    );
    const updatedContractContent = contractContent.replace(
      new RegExp(UTILITY_DEPLOYER_ADDRESS, "g"),
      randomWallet.address,
    );

    fs.writeFileSync(
      path.join(contractsDirectory, file),
      updatedContractContent,
    );
  });

  console.log(
    chalk.green(
      "Contracts have all been updated with newly generated wallet address!",
    ),
  );

  console.log(
    chalk.yellowBright(`
    ⚠️ IMPORTANT: To deploy your contract on the Base Sepolia network, you need to send 0.15 ETH to the newly generated wallet address:

    ${chalk.green(randomWallet.address)}

    Please make sure to send the funds before proceeding with the deployment.

    Once funds are in the wallet, you can run the following two commands to ensure you're ready to deploy:

    ${chalk.green("pnpm run account")}
    ${chalk.green("pnpm run task deploy:all")}

    Once these are completed, your token will be live and you'll have an address to trade the token on Xchange.
  `),
  );
};

async function main() {
  if (!fs.existsSync(envFilePath)) {
    // No .env file yet.
    setNewEnvConfig();
    return;
  }

  // .env file exists
  const existingEnvConfig = parse(fs.readFileSync(envFilePath).toString());
  if (existingEnvConfig.DEPLOYER_PRIVATE_KEY) {
    console.log(
      chalk.redBright(
        "⚠️ You already have a deployer account. Check the packages/hardhat/.env file",
      ),
    );
    return;
  }

  setNewEnvConfig(existingEnvConfig);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
