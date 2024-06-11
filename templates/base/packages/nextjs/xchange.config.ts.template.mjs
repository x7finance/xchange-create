import { withDefaults } from "../../../utils.js"

const contents = ({ chainName }) =>
  `import * as chains from "viem/chains";

export type XchangeConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

const xchangeConfig = {
  // The networks on which your DApp is live
  targetNetworks: [chains.${chainName[0]}],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "Ts4GhP05ruTtQDLTcush3QMJWi-F9Gdj",

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "f0ef33556bb61c70e74ccac8688c03e8",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
} as const satisfies XchangeConfig;

export default xchangeConfig;
`

export default withDefaults(contents, {
  chainName: "mainnet",
})
