import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  APPROVAL_AMOUNT,
  CONTRACT_NAMES,
  ChainId,
  XChangeContractsEnum,
  getScannerUrl,
  mainnetChainIds,
} from "../utils/constants";
import chalk from "chalk";
import ora from "ora";

export default async function approveLendingPool(
  hre: HardhatRuntimeEnvironment,
  contractA: `0x${string}`,
) {
  const { ethers } = hre;
  console.log(chalk.blueBright(`----------------------------------------`));
  const chainId = hre.network.config.chainId?.toString() ?? ChainId.HARDHAT;
  const contractName = process.env.TOKEN_NAME as keyof typeof CONTRACT_NAMES;
  const contractAddress = process.env.TOKEN_ADDRESS ?? contractA;

  if (!contractName || !contractAddress) {
    throw new Error(
      "TOKEN_NAME and CONTRACT_ADDRESS environment variables are required.",
    );
  }

  const tokenContract = await ethers.getContractAt(
    CONTRACT_NAMES[contractName],
    contractAddress,
  );

  console.log(
    chalk.blueBright(`
Approving X7 Lending Pool for maxiumum tokens to fund liquidity`),
  );

  const spinner = ora(
    chalk.yellow(`
  ┌───────────────────────────────────────────────┐
  │                                               │
  │    Approving X7 Lending Pool to spend the     │
  │           maximum amount of tokens            │
  │                                               │
  └───────────────────────────────────────────────┘
`),
  ).start();

  const approveTx = await tokenContract.approve(
    XChangeContractsEnum.X7_LendingPool(chainId),
    APPROVAL_AMOUNT,
  );

  await approveTx.wait();

  spinner.succeed(`
${chalk.green("X7 Lending Pool approved as spender with the maximum amount")}

  Tx: ${chalk.gray(
    getScannerUrl(
      hre.network.config.chainId ?? ChainId.HARDHAT,
      approveTx.hash,
      "tx",
    ),
  )}
`);

  console.log(chalk.blueBright(`----------------------------------------`));
}

approveLendingPool.tags = ["approve:lendingpool"];
