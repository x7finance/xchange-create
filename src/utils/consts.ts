export const baseDir = "base"

export const ChainId = {
  ETHEREUM: 1,
  ETHEREUM_TESTNET: 11155111,
  BSC: 56,
  BSC_TESTNET: 97,
  POLYGON: 137,
  POLYGON_TESTNET: 80002,
  ARBITRUM: 42161,
  ARBITRUM_TESTNET: 421614,
  OPTIMISM: 10,
  OPTIMISM_TESTNET: 11155420,
  BASE: 8453,
  BASE_TESTNET: 84532,
  HARDHAT: 31337,
} as const

export type ChainId = (typeof ChainId)[keyof typeof ChainId]
