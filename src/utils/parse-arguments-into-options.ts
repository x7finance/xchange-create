import type { Args, ContractType, Extension, RawOptions } from "../types"
import arg from "arg"
import { ChainId } from "./consts"

export function parseArgumentsIntoOptions(rawArgs: Args): RawOptions {
  const args = arg(
    {
      "--project": String,
      "-p": "--project",

      "--install": Boolean,
      "-i": "--install",

      "--skip-install": Boolean,
      "--skip": "--skip-install",
      "-s": "--skip-install",

      "--dev": Boolean,

      "--ticker": String,
      "-t": "--ticker",

      "--supply": Number,
      "-u": "--supply",

      "--contract-type": String,
      "-c": "--contract-type",

      "--extensions": [String],
      "-e": "--extensions",

      "--help": Boolean,
      "-h": "--help",

      "--quote": Boolean,
      "-q": "--quote",

      "--usd": Boolean,

      "--deploy-chain": Number,
      "-n": "--deploy-chain",

      // "--network": String,
      // "-n": "--network",
    },
    {
      argv: rawArgs.slice(2).map(a => a.toLowerCase()),
    }
  )

  const install = args["--install"] ?? null
  const skipInstall = args["--skip-install"] ?? null
  const hasInstallRelatedFlag = install || skipInstall

  const dev = args["--dev"] ?? false
  const project = args["--project"] ?? null
  const ticker = args["--ticker"] ?? null

  const deployChain = (args["--deploy-chain"] as ChainId) ?? null
  const supply = args["--supply"] ?? null
  const contractType = (args["--contract-type"] as ContractType) ?? null
  const extensions = (args["--extensions"] as Extension[]) ?? null
  const help = args["--help"] ?? false
  const usd = args["--usd"] ?? false

  const quote = args["--quote"] ?? false
  // const network = (args["--network"] as Network) ?? null

  return {
    project,
    install: hasInstallRelatedFlag ? install || !skipInstall : null,
    ticker,
    supply,
    contractType,
    dev,
    extensions,
    help,
    quote,
    deployChain,
    // network,
    usd,
  }
}
