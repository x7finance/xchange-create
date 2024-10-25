import { Config, typedContractTypeQuestion, typedQuestion } from "./types"

const config: Config = {
  questions: [
    typedQuestion({
      type: "single-select",
      name: "solidity-framework",
      message: "What solidity framework do you want to use?",
      extensions: ["hardhat", "foundry", null],
      default: "hardhat",
    }),
    typedContractTypeQuestion({
      type: "single-select",
      name: "contract-type",
      message: "What kind of token contract do you want to use?",
      contractTypes: [
        "standard-token",
        "tax-token",
        "burn-token",
        "deflationary-token",
        "test-erc20",
        "my-custom-contract",
      ],
      default: "standard-token",
    }),
  ],
}
export default config
