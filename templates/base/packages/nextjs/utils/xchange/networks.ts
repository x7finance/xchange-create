import * as chains from "viem/chains"
import xchangeConfig from "~~/xchange.config"

type ChainAttributes = {
  // color | [lightThemeColor, darkThemeColor]
  color: string | [string, string]
  // Used to fetch price by providing mainnet token address
  // for networks having native currency other than ETH
  nativeCurrencyTokenAddress?: string
}

export type ChainWithAttributes = chains.Chain & Partial<ChainAttributes>

// Mapping of chainId to RPC chain name an format followed by alchemy and infura
export const RPC_CHAIN_NAMES: Record<number, string> = {
  [chains.mainnet.id]: "eth-mainnet",
  [chains.sepolia.id]: "eth-sepolia",
  [chains.optimism.id]: "opt-mainnet",
  [chains.optimismSepolia.id]: "opt-sepolia",
  [chains.arbitrum.id]: "arb-mainnet",
  [chains.arbitrumSepolia.id]: "arb-sepolia",
  [chains.polygon.id]: "polygon-mainnet",
  [chains.polygonAmoy.id]: "polygon-amoy",
  [chains.astar.id]: "astar-mainnet",
  [chains.polygonZkEvm.id]: "polygonzkevm-mainnet",
  [chains.polygonZkEvmTestnet.id]: "polygonzkevm-testnet",
  [chains.base.id]: "base-mainnet",
  [chains.baseSepolia.id]: "base-sepolia",
}

export const DEXTOOLS_CHAIN_NAMES: Record<number, string> = {
  [chains.mainnet.id]: "ether",
  [chains.optimism.id]: "optimism",
  [chains.arbitrum.id]: "arbitrum",
  [chains.polygon.id]: "polygon",
  [chains.bsc.id]: "bnb",
  [chains.base.id]: "base",
}

export const SCANNER_URLS: Record<number, string> = {
  [chains.mainnet.id]: "https://etherscan.io",
  [chains.optimism.id]: "https://optimistic.etherscan.io",
  [chains.arbitrum.id]: "https://arbiscan.io",
  [chains.polygon.id]: "https://polygonscan.com",
  [chains.bsc.id]: "https://bscscan.com",
  [chains.base.id]: "https://basescan.org",
}

export const getAlchemyHttpUrl = (chainId: number) => {
  return RPC_CHAIN_NAMES[chainId]
    ? `https://${RPC_CHAIN_NAMES[chainId]}.g.alchemy.com/v2/${xchangeConfig.alchemyApiKey}`
    : undefined
}

export const getDextoolsHttpUrl = () => {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "0")
  return RPC_CHAIN_NAMES[chainId]
    ? `https://www.dextools.io/app/en/${RPC_CHAIN_NAMES[chainId]}/pair-explorer/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`
    : undefined
}

export const getScannerHttpUrl = () => {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "0")
  return SCANNER_URLS[chainId]
    ? `${SCANNER_URLS[chainId]}/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`
    : undefined
}

export const NETWORKS_EXTRA_DATA: Record<string, ChainAttributes> = {
  [chains.hardhat.id]: {
    color: "#b8af0c",
  },
  [chains.mainnet.id]: {
    color: "#ff8b9e",
  },
  [chains.sepolia.id]: {
    color: ["#5f4bb6", "#87ff65"],
  },
  [chains.gnosis.id]: {
    color: "#48a9a6",
  },
  [chains.polygon.id]: {
    color: "#2bbdf7",
    nativeCurrencyTokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  [chains.polygonMumbai.id]: {
    color: "#92D9FA",
    nativeCurrencyTokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  [chains.optimismSepolia.id]: {
    color: "#f01a37",
  },
  [chains.optimism.id]: {
    color: "#f01a37",
  },
  [chains.arbitrumSepolia.id]: {
    color: "#28a0f0",
  },
  [chains.arbitrum.id]: {
    color: "#28a0f0",
  },
  [chains.fantom.id]: {
    color: "#1969ff",
  },
  [chains.fantomTestnet.id]: {
    color: "#1969ff",
  },
  [chains.scrollSepolia.id]: {
    color: "#fbebd4",
  },
}

/**
 * Gives the block explorer transaction URL, returns empty string if the network is a local chain
 */
export function getBlockExplorerTxLink(chainId: number, txnHash: string) {
  const chainNames = Object.keys(chains)

  const targetChainArr = chainNames.filter(chainName => {
    const wagmiChain = chains[chainName as keyof typeof chains]
    return wagmiChain.id === chainId
  })

  if (targetChainArr.length === 0) {
    return ""
  }

  const targetChain = targetChainArr[0] as keyof typeof chains
  const blockExplorerTxURL = chains[targetChain]?.blockExplorers?.default?.url

  if (!blockExplorerTxURL) {
    return ""
  }

  return `${blockExplorerTxURL}/tx/${txnHash}`
}

/**
 * Gives the block explorer URL for a given address.
 * Defaults to Etherscan if no (wagmi) block explorer is configured for the network.
 */
export function getBlockExplorerAddressLink(
  network: chains.Chain,
  address: string
) {
  const blockExplorerBaseURL = network.blockExplorers?.default?.url
  if (network.id === chains.hardhat.id) {
    return `/admin/blockexplorer/address/${address}`
  }

  if (!blockExplorerBaseURL) {
    return `https://etherscan.io/address/${address}`
  }

  return `${blockExplorerBaseURL}/address/${address}`
}

/**
 * @returns targetNetworks array containing networks configured in xchange.config including extra network metadata
 */
export function getTargetNetworks(): ChainWithAttributes[] {
  return xchangeConfig.targetNetworks.map(targetNetwork => ({
    ...targetNetwork,
    ...NETWORKS_EXTRA_DATA[targetNetwork.id],
  }))
}
