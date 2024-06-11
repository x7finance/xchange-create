import {
  copyTemplateFiles,
  createProjectDirectory,
  installPackages,
  createFirstGitCommit,
  prettierFormat,
} from "./tasks";
import type { Options } from "./types";
import { renderOutroMessage } from "./utils/render-outro-message";
import chalk from "chalk";
import Listr from "listr";
import path from "path";
import { getContractName } from "./utils/getContractName";
import { fileURLToPath } from "url";
import { parse, stringify } from "envfile";
import * as fs from "fs";

export async function createProject(options: Options) {
  console.log(`\n`);

  const currentFileUrl = import.meta.url;

  const templateDirectory = path.resolve(
    decodeURI(fileURLToPath(currentFileUrl)),
    "../../templates"
  );

  const targetDirectory = path.resolve(process.cwd(), options.project);

  const envFilePath = path.join(targetDirectory, "packages", "hardhat", ".env");

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
          : {};

        const newEnvConfig = {
          ...existingEnvConfig,
          TOKEN_NAME: options.project,
          TOKEN_SYMBOL: options.ticker,
          TOKEN_SUPPLY: options.supply.toString(),
          CONTRACT_NAME: getContractName(options.contractType),
          AMOUNT: "1000" ,
          LOAN_TERM_CONTRACT_ADDRESS: "0x1234567890123456789012345678901234567890" ,
          LOAN_AMOUNT: "500" ,
          LOAN_DURATION: "2592000" ,
          LIQUIDITY_RECEIVER_ADDRESS: "0x0987654321098765432109876543210987654321" ,
          DEADLINE: "1234567890" ,
          PAYABLE_AMOUNT: "0.1"
        };

        fs.writeFileSync(envFilePath, stringify(newEnvConfig));
      },
    },
    {
      title: `📦 Installing dependencies with pnpm, this could take a while`,
      task: () => installPackages(targetDirectory),
      skip: () => {
        if (!options.install) {
          return "Manually skipped";
        }
      },
    },
    {
      title: "🪄 Formatting files with prettier",
      task: () => prettierFormat(targetDirectory),
      skip: () => {
        if (!options.install) {
          return "Skipping because prettier install was skipped";
        }
      },
    },
    {
      title: `📡 Initializing Git repository ${
        options.extensions?.includes("foundry") ? "and submodules" : ""
      }`,
      task: () => createFirstGitCommit(targetDirectory, options),
    },
  ]);

  try {
    await tasks.run();
    renderOutroMessage(options);
  } catch (error) {
    console.log("%s Error occurred", chalk.red.bold("ERROR"), error);
    console.log("%s Exiting...", chalk.red.bold("Uh oh! 😕 Sorry about that!"));
  }
}
