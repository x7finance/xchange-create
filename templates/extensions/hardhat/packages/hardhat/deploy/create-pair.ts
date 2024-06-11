import { HardhatRuntimeEnvironment } from "hardhat/types";
import XchangeFactoryABI from "../abis/XchangeFactory.json";
import {
  ChainId,
  NativeTokenContracts,
  XChangeContractsEnum,
  mainnetChainIds,
} from "../utils/constants";

export default async function createPair(
  hre: HardhatRuntimeEnvironment,
  contractAddress: `0x${string}`,
) {
  const { ethers } = hre;

  const tokenA = process.env.TOKEN_ADDRESS ?? contractAddress;
  const chainId = hre.network.config.chainId?.toString() ?? ChainId.HARDHAT;

  if (!tokenA) {
    throw new Error("CONTRACT_ADDRESS environment variables are required.");
  }

  if (!chainId || !(chainId in NativeTokenContracts)) {
    throw new Error("Unsupported chain ID.");
  }

  const tokenB = NativeTokenContracts[chainId];

  const factoryAbi = XchangeFactoryABI;

  const factory: any = await ethers.getContractAt(
    factoryAbi,
    XChangeContractsEnum.XCHANGE_FACTORY_ADDRESS(
      chainId as (typeof mainnetChainIds)[number],
    ),
  );

  console.log(
    `Creating pair for tokens ${tokenA} and ${tokenB} on Xchange factory...`,
  );

  const createPairTx = await factory.createPair(tokenA, tokenB);
  await createPairTx.wait();

  console.log("Pair created successfully: ", createPairTx.hash);
}

createPair.tags = ["create:pair"];
