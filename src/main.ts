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
import { getContractType } from "./utils/getContractType"
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
          DEPLOY_CHAIN: options.deployChain,
          DEPLOYER_PRIVATE_KEY: "",
          CONTRACT_TYPE: getContractType(options.contractType),
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
          `${getContractType(options.contractType)}.sol`
        )
        const newContractFilePath = path.join(
          path.dirname(contractFilePath),
          `${options.ticker}.sol`
        )

        // Read the contents of the contract file
        const contractContent = fs.readFileSync(contractFilePath, "utf8")

        // Replace the contract name in the file contents
        const updatedContractContent = contractContent.replace(
          new RegExp(`contract ${getContractType(options.contractType)}`, "g"),
          `contract ${options.project}`
        )

        // Write the updated contents to the new contract file
        fs.writeFileSync(newContractFilePath, updatedContractContent)

        // Remove the original contract file
        fs.unlinkSync(contractFilePath)

        // Update the CREATED_CONTRACTS export in the new project directory
        const constantsFilePath = path.join(
          targetDirectory,
          "packages",
          "hardhat",
          "utils",
          "constants.ts"
        )
        const constantsContent = fs.readFileSync(constantsFilePath, "utf8")
        const updatedConstantsContent = constantsContent.replace(
          /export const CREATED_CONTRACTS: Record<string, string> = {[^}]*}/,
          `export const CREATED_CONTRACTS: Record<string, string> = {
            ${options.project}: "${options.project}",
          }`
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
