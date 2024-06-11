import { wagmiConnectors } from "./wagmiConnectors"
import { Chain, createClient, http } from "viem"
import { hardhat, mainnet } from "viem/chains"
import { createConfig } from "wagmi"
import { getAlchemyHttpUrl } from "~~/utils/xchange"
import xchangeConfig from "~~/xchange.config"

const { targetNetworks } = xchangeConfig

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find(
  (network: Chain) => network.id === 1
)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const)

export const wagmiConfig: any = createConfig({
  chains: enabledChains,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(getAlchemyHttpUrl(chain.id)),
      ...(chain.id !== (hardhat as Chain).id
        ? {
            pollingInterval: xchangeConfig.pollingInterval,
          }
        : {}),
    })
  },
})
