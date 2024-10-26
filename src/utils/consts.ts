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

export const XChangeContractsEnum = {
  X7_LendingPool: (chainId: ChainId | string | number): `0x${string}` => {
    const numericChainId =
      typeof chainId === "string" ? parseInt(chainId, 10) : chainId

    switch (numericChainId) {
      case ChainId.ETHEREUM:
        return "0x74001DcFf64643B76cE4919af4DcD83da6Fe1E02"
      case ChainId.BASE:
        return "0x4eE199B7DFED6B96402623BdEcf2B1ae2f3750Dd"
      case ChainId.BSC:
        return "0x6396898c25b2bbF824DcdEc99A6F4061CC12f573"
      case ChainId.POLYGON:
        return "0xF57C56270E9FbF18B254E05168C632c9f3D9a442"
      case ChainId.ARBITRUM:
        return "0x7F3F8bcF93e17734AEec765128156690e8c7e8d3"
      case ChainId.OPTIMISM:
        return "0x94ada63c4B836AbBA14D2a20624bDF39b9DD5Ed5"
      case ChainId.OPTIMISM_TESTNET:
        return "0x0E2F369Fdc070521ae23A8BcB4Bad0310044a1e8"
      case ChainId.ETHEREUM_TESTNET:
        return "0xcad129C25D092a48bAC897CfbA887F16762E139f"
      case ChainId.ARBITRUM_TESTNET:
        return "0x3503A77fde88dfce8315116D58c9fe0bC1eCb953"
      case ChainId.BASE_TESTNET:
        return "0x0E2F369Fdc070521ae23A8BcB4Bad0310044a1e8"
      case ChainId.POLYGON_TESTNET:
        return "0xD18175c2BFad3a594FeBFe3f0426d4f8F714149C"
      case ChainId.BSC_TESTNET:
        return "0xA377d8B82dF8b3EE1fd849BA231F036db5eE8d83"
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`)
    }
  },
  XchangeRouter: (chainId: ChainId): `0x${string}` => {
    switch (chainId) {
      case ChainId.ETHEREUM:
        return "0x6b5422D584943BC8Cd0E10e239d624c6fE90fbB8"
      case ChainId.BASE:
        return "0xC2defaD879dC426F5747F2A5b067De070928AA50"
      case ChainId.BSC:
        return "0x32e9eDEaBd5A8034468497A4782b1a9EB95C4A67"
      case ChainId.POLYGON:
        return "0xA72618ff64468Dff871e980fB657dE3Ca5Ae0aba"
      case ChainId.ARBITRUM:
        return "0x7C79C9483Ee518783b31C78920f73D0fDeabe246"
      case ChainId.OPTIMISM:
        return "0x2A382e8eB22Ecb02dD67C30243A4D0A01474b042"
      // Testnets
      case ChainId.ETHEREUM_TESTNET:
        return "0x05B5034BfDbd930a93283aa52A10D700454A7a47"
      case ChainId.BASE_TESTNET:
        return "0xde472CFDC852c45FA8AC082A07662cA4846bD9A2"
      case ChainId.POLYGON_TESTNET:
        return "0x6CeBbc8c4f918afb417cdB07BF73701E15a9Dd56"
      case ChainId.ARBITRUM_TESTNET:
        return "0x4d80bB62013cD35da82b6bA377cBB4D2bEC2C1aa"
      case ChainId.OPTIMISM_TESTNET:
        return "0x8fCead21747F5C35E36223C08F5C1Aa1cB0f143c"
      case ChainId.BSC_TESTNET:
        return "0x9D137b29e761bB9D793979Cf0DF29135DEe35000"
      default:
        throw new Error(`Unsupported chainId: ${chainId}`)
    }
  },
  XCHANGE_FACTORY_ADDRESS: "0x8B76C05676D205563ffC1cbd11c0A6e3d83929c5",
}
