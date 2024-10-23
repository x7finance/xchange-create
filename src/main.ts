import {
  copyTemplateFiles,
  createProjectDirectory,
  installPackages,
  createFirstGitCommit,
  prettierFormat,
} from "./tasks"
import type { Options } from "./types"
import { renderOutroMessage } from "./utils/render-outro-message"
import chalk from "chalk"
import Listr from "listr"
import path from "path"
import { getContractName } from "./utils/getContractName"
import { fileURLToPath } from "url"
import { parse, stringify } from "envfile"
import * as fs from "fs"

export async function createProject(options: Options) {
  console.log(`\n`)

  const currentFileUrl = import.meta.url

  const templateDirectory = path.resolve(
    decodeURI(fileURLToPath(currentFileUrl)),
    "../../templates"
  )

  const targetDirectory = path.resolve(process.cwd(), options.project)

  const envFilePath = path.join(targetDirectory, "packages", "hardhat", ".env")

  const tasks = new Listr([
    {
      title: `📁 Create project directory ${targetDirectory}`,
      task: () => createProjectDirectory(options.project),
    },
    {
      title: `🧪 Creating a new Xchange project in ${chalk.green.bold(
        options.project
      )}`,
      task: () =>
        copyTemplateFiles(options, templateDirectory, targetDirectory),
    },
    {
      title: "📝 Writing options to .env file",
      task: () => {
        const existingEnvConfig = fs.existsSync(envFilePath)
          ? parse(fs.readFileSync(envFilePath, "utf8"))
          : {}

        const newEnvConfig = {
          ...existingEnvConfig,
          TOKEN_NAME: options.project,
          TOKEN_SYMBOL: options.ticker,
          TOKEN_SUPPLY: options.supply.toString(),
          TOKEN_SUPPLY_PAIRED: options.supply,
          DEPLOYER_PRIVATE_KEY: "",
          CONTRACT_NAME: getContractName(options.contractType),
          LOAN_TERM_CONTRACT_ADDRESS:
            "0xd95f799276A8373F7F234A7F211DE9E3a0ae6639",
          LOAN_AMOUNT: 0.5,
          INITIAL_PAYMENT_DUE: 0.11,
        }

        fs.writeFileSync(envFilePath, stringify(newEnvConfig))

        // Rename the contract file to the TOKEN_NAME in the new project directory
        const contractFilePath = path.join(
          targetDirectory,
          "packages",
          "hardhat",
          "contracts",
          `${getContractName(options.contractType)}.sol`
        )
        const newContractFilePath = path.join(
          path.dirname(contractFilePath),
          `${options.project}.sol`
        )

        // Read the contents of the contract file
        const contractContent = fs.readFileSync(contractFilePath, "utf8")

        // Replace the contract name in the file contents
        const updatedContractContent = contractContent.replace(
          new RegExp(`contract ${getContractName(options.contractType)}`, "g"),
          `contract ${options.project}`
        )

        // Write the updated contents to the new contract file
        fs.writeFileSync(newContractFilePath, updatedContractContent)

        // Remove the original contract file
        fs.unlinkSync(contractFilePath)

        // Update the CONTRACT_NAMES export in the new project directory
        const constantsFilePath = path.join(
          targetDirectory,
          "packages",
          "hardhat",
          "utils",
          "constants.ts"
        )
        const constantsContent = fs.readFileSync(constantsFilePath, "utf8")
        const updatedConstantsContent = constantsContent.replace(
          /export const CONTRACT_NAMES = {[^}]*}/,
          `export const CONTRACT_NAMES = {
            StandardToken: "StandardToken",
            DeflationaryToken: "DeflationaryToken",
            MockERC20: "MockERC20",
            ${options.project}: "${options.project}",
          };`
        )
        fs.writeFileSync(constantsFilePath, updatedConstantsContent)
      },
    },
    {
      title: `📦 Installing dependencies with pnpm, this could take a while`,
      task: () => installPackages(targetDirectory),
      skip: () => {
        if (!options.install) {
          return "Manually skipped"
        }
      },
    },
    {
      title: `🪄${"  "}Formatting files with prettier`,
      task: () => prettierFormat(targetDirectory),
      skip: () => {
        if (!options.install) {
          return "Skipping because prettier install was skipped"
        }
      },
    },
    {
      title: `📡${" "}Initializing Git repository ${
        options.extensions?.includes("foundry") ? "and submodules" : ""
      }`,
      task: () => createFirstGitCommit(targetDirectory, options),
    },
  ])

  try {
    await tasks.run()
    renderOutroMessage(options)
  } catch (error) {
    console.log("%s Error occurred", chalk.red.bold("ERROR"), error)
    console.log("%s Exiting...", chalk.red.bold("Uh oh! 😕 Sorry about that!"))
  }
}
