import { HardhatRuntimeEnvironment } from "hardhat/types";
import deployContract from "./deploy-contract";
import createPair from "./create-pair";
import approveLendingPool from "./approve-lending-pool";
import takeLoan from "./initiate-loan";

export default async function deployAll(hre: HardhatRuntimeEnvironment) {
  const contractAddress = await deployContract(hre);

  if (contractAddress) {
    await createPair(hre, contractAddress);
    await approveLendingPool(hre, contractAddress);
    await takeLoan(hre, contractAddress);
  } else {
    console.log("Contract not deployed");
  }
}

deployAll.tags = ["deploy:all"];
// pnpm run verify --network baseSepolia --api-url https://api-sepolia.basescan.org --api-key <api-key>
