import { CREATED_CONTRACTS } from "../utils/constants";
import { writeABI } from "../utils/io";

export default async function exportABI() {
  const contractName = process.env.TOKEN_NAME as keyof typeof CREATED_CONTRACTS;
  const contractPath = process.env.CONTRACT_PATH;

  if (!contractName || !contractPath) {
    throw new Error(
      "TOKEN_NAME and CONTRACT_PATH environment variables are required.",
    );
  }

  writeABI(contractPath, CREATED_CONTRACTS[contractName]);
}

exportABI.tags = ["export:abi"];
