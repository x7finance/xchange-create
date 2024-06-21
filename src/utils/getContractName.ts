import { CONTRACT_NAMES } from "../../templates/extensions/hardhat/packages/hardhat/utils/constants";
import { ContractType } from "../types";

export function getContractName(contractType: ContractType): keyof typeof CONTRACT_NAMES | undefined {
  switch (contractType) {
    case "standard-token":
      return "StandardToken";
    case "tax-token":
      return "StandardToken"; // Assuming tax-token also uses StandardToken
    case "deflationary-token":
      return "DeflationaryToken";
    case "test-erc20":
      return "MockERC20";
    case "my-custom-contract":
      return undefined; // Return undefined for custom contracts
    default:
      return undefined;
  }
}