import { formatEther } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { parse, stringify } from "envfile";
import * as fs from "fs";

const envFilePath = "./.env";

export default async function newDeployer(hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;

  // Read the existing .env file
  const existingEnvConfig = parse(fs.readFileSync(envFilePath).toString());

  // Extract the current deployer address and private key from the .env file
  const currentDeployerAddress = existingEnvConfig.DEPLOYER_ADDRESS;
  const currentDeployerPrivateKey = existingEnvConfig.DEPLOYER_PRIVATE_KEY;

  if (!currentDeployerAddress || !currentDeployerPrivateKey) {
    throw new Error(
      "Current deployer address or private key is missing in .env",
    );
  }

  // Create a wallet instance for the current deployer
  const currentDeployer = new ethers.Wallet(
    currentDeployerPrivateKey,
    ethers.provider,
  );

  console.log(`Current deployer address: ${currentDeployerAddress}`);

  // Check if current deployer has funds
  const balance = await ethers.provider.getBalance(currentDeployer.address);
  if (balance === 0n) {
    throw new Error("Current deployer has no funds");
  }

  // Generate a new account and get the new deployer address
  const newDeployer = ethers.Wallet.createRandom();

  // Reserve 0.01 ETH for gas fees
  const gasReserve = ethers.parseEther("0.01");
  if (balance <= gasReserve) {
    throw new Error(`Insufficient funds. Balance: ${formatEther(balance)} ETH`);
  }

  const transferAmount = balance - gasReserve;

  const newEnvConfig = {
    ...existingEnvConfig,
    DEPLOYER_ADDRESS: newDeployer.address,
    DEPLOYER_PRIVATE_KEY: newDeployer.privateKey,
  };

  // Send the funds
  try {
    const tx = await currentDeployer.sendTransaction({
      to: newDeployer.address,
      value: transferAmount,
    });

    await tx.wait();
    console.log(
      `Sent ${formatEther(transferAmount)} ETH to ${newDeployer.address}`,
    );
    // Store in .env
    fs.writeFileSync(envFilePath, stringify(newEnvConfig));
  } catch (error) {
    console.error("Failed to send funds:", error);
    throw error;
  }
}

newDeployer.tags = ["new:deployer"];
