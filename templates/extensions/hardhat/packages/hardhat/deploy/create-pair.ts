import { HardhatRuntimeEnvironment } from "hardhat/types";
import XchangeFactoryABI from "../abis/XchangeFactory.json";
import {
  ChainId,
  NativeTokenContracts,
  XChangeContractsEnum,
  getScannerUrl,
  mainnetChainIds,
} from "../utils/constants";
import chalk from "chalk";
import ora from "ora";

export default async function createPair(
  hre: HardhatRuntimeEnvironment,
  contractAddress: `0x${string}`,
) {
  const { ethers } = hre;
  if (!process.env.PAIR_ADDRESS) {
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

    const factoryAbi = XchangeFactoryABI;

    const factory: any = await ethers.getContractAt(
      factoryAbi,
      XChangeContractsEnum.XCHANGE_FACTORY_ADDRESS(
        chainId as (typeof mainnetChainIds)[number],
      ),
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

    const createPairTx = await factory.createPair(tokenA, tokenB);
    await createPairTx.wait();

    spinner.succeed(`
${chalk.green(`Xchange Pair successfully created`)}

  Tx: ${chalk.gray(
    getScannerUrl(
      hre.network.config.chainId ?? ChainId.HARDHAT,
      createPairTx.hash,
      "tx",
    ),
  )}
  `);
    console.log(chalk.blueBright(`----------------------------------------`));
  }
}

createPair.tags = ["create:pair"];
