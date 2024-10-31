import { HardhatRuntimeEnvironment } from "hardhat/types";
import XchangeFactoryABI from "../abis/XchangeFactory.json";
import {
  ChainId,
  NativeTokenContracts,
  XChangeContractsEnum,
  getScannerUrl,
} from "../utils/constants";
import chalk from "chalk";
import ora from "ora";

export default async function createPair(
  hre: HardhatRuntimeEnvironment,
  contractAddress: `0x${string}`,
): Promise<`0x${string}`> {
  const { ethers } = hre;
  let pairAddress: `0x${string}` = process.env.PAIR_ADDRESS as `0x${string}`;

  if (!pairAddress) {
    const tokenA = process.env.TOKEN_ADDRESS ?? contractAddress;
    const chainId = hre.network.config.chainId?.toString() ?? ChainId.HARDHAT;

    console.log(chalk.blueBright(`----------------------------------------`));

    if (!tokenA) {
      throw new Error("CONTRACT_ADDRESS environment variables are required.");
    }

    if (!chainId || !(chainId in NativeTokenContracts)) {
      throw new Error("Unsupported chain ID.");
    }

    console.log(
      chalk.blueBright(`
Creating an Xchange Pair for: ${chalk.gray(
        getScannerUrl(
          hre.network.config.chainId ?? ChainId.HARDHAT,
          tokenA,
          "address",
        ),
      )} and ${chalk.gray(
        getScannerUrl(
          hre.network.config.chainId ?? ChainId.HARDHAT,
          NativeTokenContracts[chainId],
          "address",
        ),
      )}`),
    );

    const tokenB = NativeTokenContracts[chainId];

    const factory = await ethers.getContractAt(
      XchangeFactoryABI,
      XChangeContractsEnum.XCHANGE_FACTORY_ADDRESS,
    );

    const spinner = ora(
      chalk.yellowBright(`
    ┌───────────────────────────────────────────────┐
    │                                               │
    │           Creating pair for tokens            │
    │                                               │
    │                                               │
    │            on Xchange factory...              │
    │                                               │
    └───────────────────────────────────────────────┘
  `),
    ).start();

    try {
      const createPairTx = await factory.createPair(tokenA, tokenB);
      const receipt = await createPairTx.wait();

      // Get pair address from PairCreated event
      const pairCreatedEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === "PairCreated",
      );

      if (!pairCreatedEvent?.args?.[2]) {
        throw new Error("Failed to get pair address from event");
      }

      pairAddress = pairCreatedEvent.args[2] as `0x${string}`;

      spinner.succeed(`
${chalk.green(`Xchange Pair successfully created`)}

  Pair Address: ${chalk.gray(
    getScannerUrl(
      hre.network.config.chainId ?? ChainId.HARDHAT,
      pairAddress,
      "address",
    ),
  )}
  Tx: ${chalk.gray(
    getScannerUrl(
      hre.network.config.chainId ?? ChainId.HARDHAT,
      createPairTx.hash,
      "tx",
    ),
  )}
  `);
    } catch (error) {
      spinner.fail(chalk.red(`Failed to create pair: ${error.message}`));
      throw error;
    }

    console.log(chalk.blueBright(`----------------------------------------`));
  }

  if (!pairAddress) {
    throw new Error("Failed to create or get pair address");
  }

  return pairAddress;
}

createPair.tags = ["create:pair"];
