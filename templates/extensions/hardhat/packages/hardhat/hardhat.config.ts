import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { NetworkUserConfig } from "hardhat/types";
import { vars } from "hardhat/config";

const alchemyApiKey: string = `${process.env.ALCHEMY_API_KEY}`;
const deployerKey: string = `${process.env.DEPLOYER_PRIVATE_KEY}`;

enum ChainAlchemyLinksEnum {
  eth = "https://eth-mainnet.g.alchemy.com/v2/",
  eth_testnet = "https://eth-sepolia.g.alchemy.com/v2/",
  bsc = "https://bnb-mainnet.g.alchemy.com/v2/",
  bsc_testnet = "https://bnb-testnet.g.alchemy.com/v2/",
  optimism = "https://opt-mainnet.g.alchemy.com/v2/",
  optimism_testnet = "https://opt-sepolia.g.alchemy.com/v2/",
  arbitrum = "https://arb-mainnet.g.alchemy.com/v2/",
  arbitrum_testnet = "https://arb-sepolia.g.alchemy.com/v2/",
  polygon = "https://polygon-mainnet.g.alchemy.com/v2/",
  polygon_testnet = "https://polygon-amoy.g.alchemy.com/v2/",
  base = "https://base-mainnet.g.alchemy.com/v2/",
  base_testnet = "https://base-sepolia.g.alchemy.com/v2/",
}

const chainConfig: Record<
  string,
  { chainId: number; url: string; gasPrice?: number }
> = {
  mainnet: { chainId: 1, url: ChainAlchemyLinksEnum.eth + alchemyApiKey },
  sepolia: {
    chainId: 11155111,
    url: ChainAlchemyLinksEnum.eth_testnet + alchemyApiKey,
  },
  bsc: { chainId: 56, url: ChainAlchemyLinksEnum.bsc + alchemyApiKey },
  bscTestnet: {
    chainId: 97,
    url: ChainAlchemyLinksEnum.bsc_testnet + alchemyApiKey,
    gasPrice: 20000000000,
  },
  optimism: {
    chainId: 10,
    url: ChainAlchemyLinksEnum.optimism + alchemyApiKey,
  },
  optimismSepolia: {
    chainId: 11155420,
    url: ChainAlchemyLinksEnum.optimism_testnet + alchemyApiKey,
  },
  arbitrum: {
    chainId: 42161,
    url: ChainAlchemyLinksEnum.arbitrum + alchemyApiKey,
  },
  arbitrumSepolia: {
    chainId: 421614,
    url: ChainAlchemyLinksEnum.arbitrum_testnet + alchemyApiKey,
  },
  polygon: { chainId: 137, url: ChainAlchemyLinksEnum.polygon + alchemyApiKey },
  polygonAmoy: {
    chainId: 80002,
    url: ChainAlchemyLinksEnum.polygon_testnet + alchemyApiKey,
  },
  base: {
    chainId: 8453,
    url: "https://base-rpc.publicnode.com/",
  },
  baseSepolia: {
    chainId: 84532,
    url: ChainAlchemyLinksEnum.base_testnet + alchemyApiKey,
  },
};

function getChainConfig(network: keyof typeof chainConfig): NetworkUserConfig {
  return {
    url: chainConfig[network].url,
    accounts: deployerKey?.length ? [deployerKey] : [],
    timeout: 10000000,
    chainId: chainConfig[network].chainId,
    ...(network === "base" && {
      gasPrice: "auto",
      gas: "auto",
      maxFeePerGas: "auto",
      maxPriorityFeePerGas: "auto",
    }),
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
        runs: 200,
      },
    },
  },
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    ganache: {
      accounts: deployerKey ? [deployerKey] : [],
      chainId: 1337,
      url: "http://127.0.0.1:8545",
    },
    ...Object.fromEntries(
      Object.entries(chainConfig).map(([network]) => [
        network,
        getChainConfig(network as keyof typeof chainConfig),
      ]),
    ),
  },
  // configuration for harhdat-verify plugin
  etherscan: {
    apiKey: {
      mainnet: vars.get("ETHERSCAN_API_KEY", ""),
      sepolia: vars.get("ETHERSCAN_API_KEY", ""),
      bsc: vars.get("BSCSCAN_API_KEY", ""),
      bscTestnet: vars.get("BSCSCAN_API_KEY", ""),
      optimism: vars.get("OPTIMISM_API_KEY", ""),
      optimismSepolia: vars.get("OPTIMISM_API_KEY", ""),
      arbitrum: vars.get("ARBISCAN_API_KEY", ""),
      arbitrumSepolia: vars.get("ARBISCAN_API_KEY", ""),
      polygon: vars.get("POLYGONSCAN_API_KEY", ""),
      polygonAmoy: vars.get("POLYGONSCAN_API_KEY", ""),
      base: vars.get("BASESCAN_API_KEY", ""),
      baseSepolia: vars.get("BASESCAN_API_KEY", ""),
    },
    customChains: Object.entries(chainConfig).map(([network, { chainId }]) => {
      let apiURL: string;
      let browserURL: string;

      const networkBase = network
        .split(/Testnet|Sepolia|Amoy/)[0]
        .toLowerCase();
      const isTestnet =
        network.includes("Testnet") ||
        network.includes("Sepolia") ||
        network.includes("Amoy");

      switch (network) {
        case "base":
          apiURL = "https://api.basescan.org/api";
          browserURL = "https://basescan.org";
          break;
        case "baseSepolia":
          apiURL = "https://api-sepolia.basescan.org/api";
          browserURL = "https://sepolia.basescan.org";
          break;
        case "optimism":
          apiURL = "https://api-optimistic.etherscan.io/api";
          browserURL = "https://optimistic.etherscan.io";
          break;
        case "optimismSepolia":
          apiURL = "https://api-sepolia-optimistic.etherscan.io/api";
          browserURL = "https://sepolia-optimistic.etherscan.io";
          break;
        case "arbitrum":
          apiURL = "https://api.arbiscan.io/api";
          browserURL = "https://arbiscan.io";
          break;
        case "arbitrumSepolia":
          apiURL = "https://api-sepolia.arbiscan.io/api";
          browserURL = "https://sepolia.arbiscan.io";
          break;
        case "mainnet":
          apiURL = "https://api.etherscan.io/api";
          browserURL = "https://etherscan.io";
          break;
        case "sepolia":
          apiURL = "https://api-sepolia.etherscan.io/api";
          browserURL = "https://sepolia.etherscan.io";
          break;
        case "bsc":
          apiURL = "https://api.bscscan.com/api";
          browserURL = "https://bscscan.com";
          break;
        case "bscTestnet":
          apiURL = "https://api-testnet.bscscan.com/api";
          browserURL = "https://testnet.bscscan.com";
          break;
        case "polygon":
          apiURL = "https://api.polygonscan.com/api";
          browserURL = "https://polygonscan.com";
          break;
        case "polygonAmoy":
          apiURL = "https://api-amoy.polygonscan.com/api";
          browserURL = "https://amoy.polygonscan.com/";
          break;
        default:
          apiURL = `https://api${
            isTestnet ? "-testnet" : ""
          }.${networkBase}scan.com/api`;
          browserURL = `https://${
            isTestnet ? "testnet." : ""
          }${networkBase}scan.com`;
      }

      return {
        network,
        chainId,
        urls: { apiURL, browserURL },
      };
    }),
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
  },
  sourcify: {
    enabled: false,
  },
  external: {
    contracts: [
      {
        artifacts: "artifacts",
      },
    ],
  },
};

export default config;

// Custom CLI parameters
export interface ExportAbiTaskArgs {
  contractName: string;
  contractPath: string;
}

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    contractName: string;
    contractPath: string;
  }
}
