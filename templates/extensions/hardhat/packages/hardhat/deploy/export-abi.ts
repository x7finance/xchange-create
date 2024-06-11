import { CONTRACT_NAMES } from "../utils/constants";
import { writeABI } from "../utils/io";

export default async function exportABI() {
  const contractName = process.env.CONTRACT_NAME as keyof typeof CONTRACT_NAMES;
  const contractPath = process.env.CONTRACT_PATH;

  if (!contractName || !contractPath) {
    throw new Error(
      "CONTRACT_NAME and CONTRACT_PATH environment variables are required.",
    );
  }

  writeABI(contractPath, CONTRACT_NAMES[contractName]);
}

exportABI.tags = ["export:abi"];
