import { HardhatRuntimeEnvironment } from "hardhat/types";
import deployContract from "./deploy-contract";
import createPair from "./create-pair";
import approveLendingPool from "./approve-lending-pool";
import takeLoan from "./initiate-loan";
import { isAddress } from "viem";
import { CREATED_CONTRACTS } from "../utils/constants";

export default async function deployAll(hre: HardhatRuntimeEnvironment) {
  let contractAddress = process.env.TOKEN_ADDRESS as `0x${string}`;

  if (!contractAddress) {
    const deployed = await deployContract(hre);
    if (!deployed) throw new Error("Failed to deploy contract");
    contractAddress = deployed;
  }

  // ensure contractAddress is a valid address
  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  if (contractAddress) {
    // if the contract type is BurnToken, DeflationaryToken or TaxToken, it's not necessary to create a pair, that happens in the contract creation
    if (
      !["BurnToken", "DeflationaryToken", "TaxToken"].includes(
        process.env.CONTRACT_TYPE as string,
      )
    ) {
      await createPair(hre, contractAddress);
    }
    await approveLendingPool(hre, contractAddress);
    await takeLoan(hre, contractAddress);

    if (process.env.CONTRACT_TYPE === "BurnToken") {
      // await burnTokens(hre, contractAddress);
      // need to call the contract to enable trading, the function accepts a boolean an is called enableTrading
      const burnToken = await hre.ethers.getContractAt(
        CREATED_CONTRACTS[
          process.env.TOKEN_NAME as keyof typeof CREATED_CONTRACTS
        ],
        contractAddress,
      );
      await burnToken.enableTrading();
    }
  } else {
    console.log("Contract not deployed");
  }
}

deployAll.tags = ["deploy:all"];
// pnpm run verify --network baseSepolia --api-url https://api-sepolia.basescan.org --api-key <api-key>
