import { createProject } from "./main"
import { parseArgumentsIntoOptions } from "./utils/parse-arguments-into-options"
import { promptForMissingOptions } from "./utils/prompt-for-missing-options"
import { renderIntroMessage } from "./utils/render-intro-message"
import type { Args } from "./types"
import { displayQuote } from "./utils/quote"

export async function cli(args: Args) {
  const rawOptions = parseArgumentsIntoOptions(args)

  if (rawOptions.help) {
    displayHelp()
    return
  }

  if (rawOptions.quote) {
    const options = await promptForMissingOptions(rawOptions, "quote")

    await displayQuote(options)
    return
  }

  renderIntroMessage()

  const options = await promptForMissingOptions(rawOptions, "create")

  await createProject(options)
}

function displayHelp() {
  console.log(`
  Usage: xc [options]

  Options:
    --project, -p <name>         Specify the project name
    --ticker, -t <symbol>        Specify the ticker symbol
    --supply, -u <number>        Specify the token supply
    --contract-type, -c <type>   Specify the contract type
    --extensions, -e <list>      Specify the extensions (comma-separated)
    --install, -i                Install dependencies
    --skip-install, -s           Skip dependency installation
    --dev                        Enable development mode
    --help, -h                   Display help information
    --quote, -q                  Display deployment cost quote
    --usd              Display cost in USD
    --network, -n <network>      Specify the network
  
  Examples:
    xc --project my-project --ticker MYTICKER --supply 1000000 --contract-type standard-token --extensions extension1,extension2 --install --dev
    xc -p my-project -t MYTICKER -u 1000000 -c standard-token -e extension1,extension2 -i --dev
    xc --quote --network eth --contract-type standard-token --usd
`)
}
