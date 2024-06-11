import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  APPROVAL_AMOUNT,
  CONTRACT_NAMES,
  ChainId,
  XChangeContractsEnum,
  mainnetChainIds,
} from "../utils/constants";

export default async function approveLendingPool(
  hre: HardhatRuntimeEnvironment,
  contractA: `0x${string}`,
) {
  const { ethers } = hre;

  const chainId = hre.network.config.chainId?.toString() ?? ChainId.HARDHAT;
  const contractName = process.env.TOKEN_NAME as keyof typeof CONTRACT_NAMES;
  const contractAddress = process.env.TOKEN_ADDRESS ?? contractA;

  if (!contractName || !contractAddress) {
    throw new Error(
      "CONTRACT_NAME and CONTRACT_ADDRESS environment variables are required.",
    );
  }

  const tokenContract = await ethers.getContractAt(
    CONTRACT_NAMES[contractName],
    contractAddress,
  );

  console.log(
    `Approving lending pool ${XChangeContractsEnum.XCHANGE_LENDING_POOL_ADDRESS(
      chainId as (typeof mainnetChainIds)[number],
    )} to spend the maximum amount of tokens...`,
  );

  const approveTx = await tokenContract.approve(
    XChangeContractsEnum.XCHANGE_LENDING_POOL_ADDRESS(
      chainId as (typeof mainnetChainIds)[number],
    ),
    APPROVAL_AMOUNT,
  );
  await approveTx.wait();

  console.log(
    "X7 Lending Pool approved as spender with the maximum amount.: ",
    approveTx.hash,
  );
}

approveLendingPool.tags = ["approve:lendingpool"];
