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

const infuraApiKey: string = `${process.env.INFURA_API_KEY}`;
const deployerKey: string = `${process.env.DEPLOYER_PRIVATE_KEY}`;

const chainIds = {
  "arbitrum-mainnet": 42161,
  avalanche: 43114,
  "base-mainnet": 8453,
  baseSepolia: 84532,
  bsc: 56,
  ganache: 1337,
  hardhat: 31337,
  mainnet: 1,
  "optimism-mainnet": 10,
  "polygon-mainnet": 137,
  "polygon-amoy": 80002,
  sepolia: 11155111,
};

function getChainConfig(chain: keyof typeof chainIds): NetworkUserConfig {
  let jsonRpcUrl: string;
  switch (chain) {
    case "avalanche":
      jsonRpcUrl = "https://api.avax.network/ext/bc/C/rpc";
      break;
    case "base-mainnet":
      jsonRpcUrl = "https://mainnet.base.org";
      break;
    case "baseSepolia":
      jsonRpcUrl = "https://sepolia.base.org";
      break;
    case "bsc":
      jsonRpcUrl = "https://bsc-dataseed1.binance.org";
      break;
    default:
      jsonRpcUrl = "https://" + chain + ".infura.io/v3/" + infuraApiKey;
  }

  return {
    accounts: deployerKey?.length ? [deployerKey] : [],
    chainId: chainIds[chain],
    url: jsonRpcUrl,
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
      chainId: chainIds.hardhat,
    },
    ganache: {
      accounts: deployerKey?.length ? [deployerKey] : [],
      chainId: chainIds.ganache,
      url: "http://127.0.0.1:8545",
    },
    arbitrum: getChainConfig("arbitrum-mainnet"),
    avalanche: getChainConfig("avalanche"),
    bsc: getChainConfig("bsc"),
    "base-mainnet": getChainConfig("base-mainnet"),
    baseSepolia: getChainConfig("baseSepolia"),
    mainnet: getChainConfig("mainnet"),
    optimism: getChainConfig("optimism-mainnet"),
    "polygon-mainnet": getChainConfig("polygon-mainnet"),
    "polygon-amoy": getChainConfig("polygon-amoy"),
    sepolia: getChainConfig("sepolia"),
  },
  // configuration for harhdat-verify plugin
  etherscan: {
    apiKey: {
      arbitrumOne: `${process.env.ARBISCAN_API_KEY}`,
      "base-mainnet": `${process.env.BASESCAN_API_KEY}`,
      baseSepolia: `${process.env.BASESCAN_API_KEY}`,
      // bsc: `${process.env.BSCSCAN_API_KEY}`,
      mainnet: `${process.env.ETHERSCAN_API_KEY}`,
      // optimisticEthereum: `${process.env.OPTIMISM_API_KEY}`,
      // polygon: `${process.env.POLYGONSCAN_API_KEY}`,
      // polygonMumbai: `${process.env.POLYGONSCAN_API_KEY}`,
      sepolia: `${process.env.ETHERSCAN_API_KEY}`,
    },
    customChains: [
      {
        network: "arbitrum-mainnet",
        chainId: 42161,
        urls: {
          apiURL: "https://api.arbiscan.io/api",
          browserURL: "https://arbiscan.io/",
        },
      },
      {
        network: "avalanche",
        chainId: 43114,
        urls: {
          apiURL: "https://api.snowtrace.io/api",
          browserURL: "https://snowtrace.io/",
        },
      },
      {
        network: "base-mainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com/",
        },
      },
      {
        network: "optimism-mainnet",
        chainId: 10,
        urls: {
          apiURL: "https://api-optimistic.etherscan.io/api",
          browserURL: "https://optimistic.etherscan.io/",
        },
      },
      {
        network: "polygon-mainnet",
        chainId: 137,
        urls: {
          apiURL: "https://api.polygonscan.com/api",
          browserURL: "https://polygonscan.com/",
        },
      },
      {
        network: "polygon-amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com/",
        },
      },
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io/",
        },
      },
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io/",
        },
      },
    ],
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
