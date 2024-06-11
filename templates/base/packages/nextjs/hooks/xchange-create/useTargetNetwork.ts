import { useEffect } from "react"
import { useAccount } from "wagmi"
import { useGlobalState } from "~~/services/store/store"
import { ChainWithAttributes, NETWORKS_EXTRA_DATA } from "~~/utils/xchange"
import xchangeConfig from "~~/xchange.config"

/**
 * Retrieves the connected wallet's network from xchange.config or defaults to the 0th network in the list if the wallet is not connected.
 */
export function useTargetNetwork(): { targetNetwork: ChainWithAttributes } {
  const { chain } = useAccount()
  const targetNetwork = useGlobalState(({ targetNetwork }) => targetNetwork)
  const setTargetNetwork = useGlobalState(
    ({ setTargetNetwork }) => setTargetNetwork
  )

  useEffect(() => {
    const newSelectedNetwork = xchangeConfig.targetNetworks.find(
      targetNetwork => targetNetwork.id === chain?.id
    )
    if (newSelectedNetwork && newSelectedNetwork.id !== targetNetwork.id) {
      setTargetNetwork(newSelectedNetwork)
    }
  }, [chain?.id, setTargetNetwork, targetNetwork.id])

  return {
    targetNetwork: {
      ...targetNetwork,
      ...NETWORKS_EXTRA_DATA[targetNetwork.id],
    },
  }
}
