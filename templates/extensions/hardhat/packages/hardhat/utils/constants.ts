export const CONTRACT_TYPES = {
  BurnToken: "BurnToken",
  DeflationaryToken: "DeflationaryToken",
  ReflectionToken: "ReflectionToken",
  StandardToken: "StandardToken",
  TaxToken: "TaxToken",
};

export const CREATED_CONTRACTS: Record<string, string> = {};

export const APPROVAL_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

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
} as const;

export type ChainId = (typeof ChainId)[keyof typeof ChainId];

export const mainnetChainIds: ChainId[] = [
  ChainId.BASE,
  ChainId.ETHEREUM,
  ChainId.POLYGON,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM,
  ChainId.BSC,
];

export const UTILITY_DEPLOYER_ADDRESS =
  "0xf7c5c8Bdd689767e039c631Ad42482128BD54Ba3";

export const XChangeContractsEnum = {
  X7_LendingPool: (chainId: ChainId | string | number): `0x${string}` => {
    const numericChainId =
      typeof chainId === "string" ? parseInt(chainId, 10) : chainId;

    switch (numericChainId) {
      case ChainId.ETHEREUM:
        return "0x74001DcFf64643B76cE4919af4DcD83da6Fe1E02";
      case ChainId.BASE:
        return "0x4eE199B7DFED6B96402623BdEcf2B1ae2f3750Dd";
      case ChainId.BSC:
        return "0x6396898c25b2bbF824DcdEc99A6F4061CC12f573";
      case ChainId.POLYGON:
        return "0xF57C56270E9FbF18B254E05168C632c9f3D9a442";
      case ChainId.ARBITRUM:
        return "0x7F3F8bcF93e17734AEec765128156690e8c7e8d3";
      case ChainId.OPTIMISM:
        return "0x94ada63c4B836AbBA14D2a20624bDF39b9DD5Ed5";
      case ChainId.OPTIMISM_TESTNET:
        return "0x0E2F369Fdc070521ae23A8BcB4Bad0310044a1e8";
      case ChainId.ETHEREUM_TESTNET:
        return "0xcad129C25D092a48bAC897CfbA887F16762E139f";
      case ChainId.ARBITRUM_TESTNET:
        return "0x3503A77fde88dfce8315116D58c9fe0bC1eCb953";
      case ChainId.BASE_TESTNET:
        return "0x0E2F369Fdc070521ae23A8BcB4Bad0310044a1e8";
      case ChainId.POLYGON_TESTNET:
        return "0xD18175c2BFad3a594FeBFe3f0426d4f8F714149C";
      case ChainId.BSC_TESTNET:
        return "0xA377d8B82dF8b3EE1fd849BA231F036db5eE8d83";
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  },
  X7InitialLiquidityLoanTerm005: (chainId: ChainId): `0x${string}` => {
    switch (chainId) {
      case ChainId.ETHEREUM:
      case ChainId.BASE:
      case ChainId.BSC:
      case ChainId.POLYGON:
      case ChainId.ARBITRUM:
      case ChainId.OPTIMISM:
        return "0x90482AD3aa56675ba313dAC14C3a7717bAD5B24D";
      case ChainId.ETHEREUM_TESTNET:
      case ChainId.BASE_TESTNET:
      case ChainId.POLYGON_TESTNET:
      case ChainId.ARBITRUM_TESTNET:
      case ChainId.OPTIMISM_TESTNET:
      case ChainId.BSC_TESTNET:
        return "0x97dD34dF320CC490A071b794756423e2bE7D4B3b";
      default:
        throw new Error(`Unsupported chainId: ${chainId}`);
    }
  },
  XCHANGE_FACTORY_ADDRESS: "0x8B76C05676D205563ffC1cbd11c0A6e3d83929c5",
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
  [ChainId.ETHEREUM_TESTNET]: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",

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
