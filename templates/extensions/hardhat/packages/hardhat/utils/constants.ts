export const CONTRACT_NAMES = {
  StandardToken: "StandardToken",
  DeflationaryToken: "DeflationaryToken",
  MockERC20: "MockERC20",
};

export const APPROVAL_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const ChainId = {
  ETHEREUM: 1,
  BSC: 56,
  BSC_TESTNET: 97,
  POLYGON: 137,
  POLYGON_TESTNET: 80001,
  ARBITRUM: 42161,
  ARBITRUM_TESTNET: 79377087078960,
  OPTIMISM: 10,
  SEPOLIA: 11155111,
  BASE: 8453,
  BASE_TESTNET: 84532,
  HARDHAT: 31337,
} as const;

export const mainnetChainIds = [
  ChainId.BASE,
  ChainId.ETHEREUM,
  ChainId.POLYGON,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM,
  ChainId.BSC,
];

export const XChangeContractsEnum = {
  XCHANGE_LENDING_POOL_ADDRESS: (chainId: (typeof mainnetChainIds)[number]) =>
    mainnetChainIds.includes(chainId)
      ? "0x74001DcFf64643B76cE4919af4DcD83da6Fe1E02"
      : "0xB2996ee6b84E03D33c276cE4ca8d5e268fB29908",
  XCHANGE_FACTORY_ADDRESS: (chainId: (typeof mainnetChainIds)[number]) =>
    mainnetChainIds.includes(chainId)
      ? "0x7de800467aFcE442019884f51A4A1B9143a34fAc"
      : "0x659Bb4214AE3808870DA2fD84AC0fD5a7e1E20FC",
};

export const NativeTokenContracts: Record<string, `0x${string}`> = {
  // MAINNETS
  [ChainId.ETHEREUM]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [ChainId.BSC]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  [ChainId.POLYGON]: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  [ChainId.ARBITRUM]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  [ChainId.OPTIMISM]: "0x4200000000000000000000000000000000000006",
  [ChainId.BASE]: "0x4200000000000000000000000000000000000006",

  // TESTNETS
  [ChainId.BASE_TESTNET]: "0x4200000000000000000000000000000000000006",
  [ChainId.SEPOLIA]: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",

  // LOCAL
  [ChainId.HARDHAT]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

export function getChainScanUrl(chainId: number) {
  switch (chainId) {
    case ChainId.ETHEREUM:
      return "https://etherscan.io";
    case ChainId.BSC:
      return "https://bscscan.com";
    case ChainId.POLYGON:
      return "https://polygonscan.com";
    case ChainId.ARBITRUM:
      return "https://arbiscan.io";
    case ChainId.OPTIMISM:
      return "https://optimistic.etherscan.io";
    case ChainId.BASE:
      return "https://basescan.org";
    case ChainId.BASE_TESTNET:
      return "https://sepolia.basescan.org";
    case ChainId.HARDHAT:
      return "https://localhost:8545";
    default:
      throw new Error("Unsupported chain ID.");
  }
}

export function getScannerUrl(
  chainId: number,
  address: string,
  type: "address" | "tx",
) {
  const chainScanUrl = getChainScanUrl(chainId);
  return `${chainScanUrl}/${type}/${address}`;
}
