import { CONTRACT_TYPES } from "../../templates/extensions/hardhat/packages/hardhat/utils/constants"
import { ContractType } from "../types"

export function getContractType(
  contractType: ContractType
): keyof typeof CONTRACT_TYPES | undefined {
  switch (contractType) {
    case "standard-token":
      return "StandardToken"
    case "burn-token":
      return "BurnToken"
    case "tax-token":
      return "TaxToken"
    case "deflationary-token":
      return "DeflationaryToken"
    case "reflection-token":
      return "ReflectionToken"
    case "my-custom-contract":
      return undefined // Return undefined for custom contracts
    default:
      return undefined
  }
}
