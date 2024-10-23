import { parseEther, toHex } from "viem";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import LendingPoolABI from "../abis/LendingPool.json";
import {
  ChainId,
  XChangeContractsEnum,
  getScannerUrl,
  mainnetChainIds,
} from "../utils/constants";
import chalk from "chalk";
import ora from "ora";

export default async function initiateLoan(
  hre: HardhatRuntimeEnvironment,
  contractAddress: `0x${string}`,
) {
  const { ethers } = hre;
  console.log(chalk.blueBright(`----------------------------------------`));
  // your contract related params
  const chainId = hre.network.config.chainId?.toString() ?? ChainId.HARDHAT;
  const tokenAddress = process.env.TOKEN_ADDRESS ?? contractAddress;
  const tokenSupplyPaired = process.env.TOKEN_SUPPLY_PAIRED
    ? parseEther(process.env.TOKEN_SUPPLY_PAIRED)
    : toHex(0);
  const liquidityReceiverAddress = process.env.DEPLOYER_ADDRESS;

  // loan related terms
  const loanTermContractAddress = process.env.LOAN_TERM_CONTRACT_ADDRESS;
  const loanAmount = process.env.LOAN_AMOUNT
    ? parseEther(process.env.LOAN_AMOUNT)
    : toHex(0);

  const initialPaymentDue = process.env.INITIAL_PAYMENT_DUE
    ? parseEther(process.env.INITIAL_PAYMENT_DUE)
    : toHex(0);

  // Loan duration
  ///////////////// hours * min * sec
  const loanDuration = process.env.LOAN_DURATION
    ? parseInt(process.env.LOAN_DURATION)
    : 24 * 60 * 60; // 24 hours in seconds
  const now = Math.floor(Date.now() / 1000);
  const deadline = now + loanDuration;

  console.log(
    chalk.blueBright(`
Initiating a loan for your token on the X7 Lending Pool:
  
  Token Address: ${chalk.gray(
    getScannerUrl(
      hre.network.config.chainId ?? ChainId.HARDHAT,
      tokenAddress,
      "address",
    ),
  )}
  Loan Term Contract: ${chalk.gray(
    getScannerUrl(
      hre.network.config.chainId ?? ChainId.HARDHAT,
      `${loanTermContractAddress}`,
      "address",
    ),
  )}
  Loan Amount: ${chalk.gray(process.env.LOAN_AMOUNT)} ${chalk.blueBright(`ETH`)}
  Loan Duration: ${chalk.gray(loanDuration / 3600)} ${chalk.blueBright(`hours`)}
  `),
  );

  if (
    !tokenAddress ||
    !loanTermContractAddress ||
    !loanAmount ||
    !loanDuration ||
    !liquidityReceiverAddress ||
    !deadline
  ) {
    throw new Error(
      "Missing required environment variables for taking a loan.",
    );
  }

  const lendingPool = await ethers.getContractAt(
    LendingPoolABI,
    XChangeContractsEnum.X7_LendingPool(chainId),
  );

  const spinner = ora(
    chalk.yellow(`
    ┌───────────────────────────────────────────────┐
    │                                               │
    │      Creating a loan and funding your         │
    │                  new pool...                  │
    │                                               │
    └───────────────────────────────────────────────┘
  `),
  ).start();

  const createLoanTx = await lendingPool.getInitialLiquidityLoan(
    tokenAddress,
    tokenSupplyPaired,
    loanTermContractAddress,
    loanAmount,
    loanDuration,
    liquidityReceiverAddress,
    deadline,
    { value: initialPaymentDue, gasLimit: 10000000 },
  );

  await createLoanTx.wait();

  spinner.succeed(`
${chalk.green("Loan created and pool funded successfully")}
  
  Tx: ${chalk.gray(
    getScannerUrl(
      hre.network.config.chainId ?? ChainId.HARDHAT,
      createLoanTx.hash,
      "tx",
    ),
  )}
  `);

  console.log(
    chalk.greenBright(`
  🚀 Trading is now live on your token on ${hre.network.name}! 🚀

  Contract Address: ${chalk.gray(
    getScannerUrl(
      hre.network.config.chainId ?? ChainId.HARDHAT,
      contractAddress,
      "address",
    ),
  )}
  Xchange Trading: ${chalk.gray(
    `https://x7finance.org/?chainId=${chainId}&token0=NATIVE&token1=${contractAddress}`,
  )}
`),
  );
}

initiateLoan.tags = ["initiate:loan"];
