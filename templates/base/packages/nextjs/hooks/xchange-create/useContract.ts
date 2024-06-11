import { useTargetNetwork } from "./useTargetNetwork"
import { Account, Address, Chain, Client, getContract, Transport } from "viem"
import { usePublicClient } from "wagmi"
import { GetWalletClientReturnType } from "wagmi/actions"
import { useDeployedContractInfo } from "~~/hooks/xchange-create"
import { Contract, ContractName } from "~~/utils/xchange/contract"

/**
 * Gets a viem instance of the contract present in deployedContracts.ts or externalContracts.ts corresponding to
 * targetNetworks configured in xchange.config.ts. Optional walletClient can be passed for doing write transactions.
 * @param config - The config settings for the hook
 * @param config.contractName - deployed contract name
 * @param config.walletClient - optional walletClient from wagmi useWalletClient hook can be passed for doing write transactions
 */
export const useContract = <
  TContractName extends ContractName,
  TWalletClient extends Exclude<GetWalletClientReturnType, null> | undefined,
>({
  contractName,
  walletClient,
}: {
  contractName: TContractName
  walletClient?: TWalletClient | null
}) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } =
    useDeployedContractInfo(contractName)
  const { targetNetwork } = useTargetNetwork()
  const publicClient = usePublicClient({ chainId: targetNetwork.id })

  let contract = undefined
  if (deployedContractData && publicClient) {
    contract = getContract<
      Transport,
      Address,
      Contract<TContractName>["abi"],
      TWalletClient extends Exclude<GetWalletClientReturnType, null>
        ? {
            public: Client<Transport, Chain>
            wallet: TWalletClient
          }
        : { public: Client<Transport, Chain> },
      Chain,
      Account
    >({
      address: deployedContractData.address,
      abi: deployedContractData.abi as Contract<TContractName>["abi"],
      client: {
        public: publicClient,
        wallet: walletClient ? walletClient : undefined,
      } as any,
    })
  }

  return {
    data: contract,
    isLoading: deployedContractLoading,
  }
}
