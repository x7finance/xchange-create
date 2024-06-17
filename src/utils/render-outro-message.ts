import type { Options } from "../types";
import chalk from "chalk";
import { execa } from "execa";

export async function renderOutroMessage(options: Options) {
  let message = `
  \n
  ${chalk.bold.green("Congratulations!")} Your project has been created! 🔋

  ${chalk.bold("Next steps:")}
  
  ${chalk.dim("cd")} ${options.project}
  `;

  if (
    options.extensions.includes("hardhat") ||
    options.extensions.includes("foundry")
  ) {
    message += `
    \t${chalk.bold("Start the local development node")}
    \t${chalk.dim("pnpm run")} chain
    `;

    if (options.extensions.includes("foundry")) {
      try {
        await execa("foundryup", ["-h"]);
      } catch (error) {
        message += `
      \t${chalk.bold.yellow(
        "(NOTE: Foundryup is not installed in your system)"
      )}
      \t${chalk.dim("Checkout: https://getfoundry.sh")}
      `;
      }
    }

    message += `
    \t${chalk.bold("In a new terminal window, get your selected contract on chain")}
    \t${chalk.dim("pnpm run")} generate ${chalk.dim("// generates a new wallet")}
    \t${chalk.dim("pnpm run")} account ${chalk.dim("// ensure your wallet is funded")}
    
   `;
  }

  message += `
  \t${chalk.bold("In a new terminal window, start the frontend")}
  \t${chalk.dim("pnpm run")} start
  `;

  message += `
  ${chalk.bold.green("Thanks for using 🧪 Xchange Create, Trust No One. Trust Code. Long Live DeFi!")}
  `;

  console.log(message);
}
