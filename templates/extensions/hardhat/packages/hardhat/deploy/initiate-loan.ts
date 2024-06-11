import { parseEther, toHex } from "viem";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import LendingPoolABI from "../abis/LendingPool.json";
import {
  ChainId,
  XChangeContractsEnum,
  mainnetChainIds,
} from "../utils/constants";

export default async function initiateLoan(
  hre: HardhatRuntimeEnvironment,
  contractAddress: `0x${string}`,
) {
  const { ethers } = hre;

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
  const loanDuration = 24 * 60 * 60; // 24 hours in seconds
  const now = Math.floor(Date.now() / 1000);
  const deadline = now + loanDuration;

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
    XChangeContractsEnum.XCHANGE_LENDING_POOL_ADDRESS(
      chainId as (typeof mainnetChainIds)[number],
    ),
  );

  console.log("Creating a loan and funding the pool...");

  const createLoanTx = await lendingPool.getInitialLiquidityLoan(
    tokenAddress,
    tokenSupplyPaired,
    loanTermContractAddress,
    loanAmount,
    loanDuration,
    liquidityReceiverAddress,
    deadline,
    { value: initialPaymentDue, gasLimit: 2000000 },
  );

  await createLoanTx.wait();

  console.log(
    "Loan created and pool funded successfully @ ",
    createLoanTx.hash,
  );
}

initiateLoan.tags = ["initiate:loan"];
