export type Chain = "base" | "polygon" | "bsc" | "mainnet" | "arbitrum" | "optimism" | "baseSepolia" | "sepolia";

export type AmmPool = "Xchange" | "Uniswap" | "Sushiswap";

export type AmmPoolsPerChain = {
  [chain in Chain]: AmmPool[];
};

export const ammPoolsPerChain: AmmPoolsPerChain = {
  base: ["Xchange", "Uniswap", "Sushiswap"],
  polygon: ["Xchange", "Uniswap", "Sushiswap"],
  bsc: ["Xchange", "Uniswap", "Sushiswap"],
  mainnet: ["Xchange", "Uniswap", "Sushiswap"],
  arbitrum: ["Xchange", "Uniswap", "Sushiswap"],
  optimism: ["Xchange", "Uniswap", "Sushiswap"],
  // testnets
  baseSepolia: ["Xchange", "Uniswap", "Sushiswap"],
  sepolia: ["Xchange", "Uniswap", "Sushiswap"],
};
