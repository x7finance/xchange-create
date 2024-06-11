import { useState } from "react"
import { useTargetNetwork } from "./useTargetNetwork"
import { MutateOptions } from "@tanstack/react-query"
import { Abi, ExtractAbiFunctionNames } from "abitype"
import {
  Config,
  useAccount,
  useWriteContract as useWagmiWriteContract,
  UseWriteContractParameters,
} from "wagmi"
import { WriteContractErrorType, WriteContractReturnType } from "wagmi/actions"
import { WriteContractVariables as WagmiWriteContractVariables } from "wagmi/query"
import { useDeployedContractInfo, useTransactor } from "~~/hooks/xchange-create"
import { notification } from "~~/utils/xchange"
import {
  ContractAbi,
  ContractName,
  WriteContractOptions,
  XchangeWriteContractVariables,
} from "~~/utils/xchange/contract"

/**
 * Wrapper around wagmi's useWriteContract hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in xchange.config.ts
 * @param contractName - name of the contract to be written to
 * @param writeContractParams - wagmi's useWriteContract parameters
 */
export const useWriteContract = <TContractName extends ContractName>(
  contractName: TContractName,
  writeContractParams?: UseWriteContractParameters
) => {
  const { chain } = useAccount()
  const writeTx = useTransactor()
  const [isMining, setIsMining] = useState(false)
  const { targetNetwork } = useTargetNetwork()

  const wagmiContractWrite = useWagmiWriteContract(writeContractParams)

  const { data: deployedContractData } = useDeployedContractInfo(contractName)

  const sendContractWriteAsyncTx = async <
    TFunctionName extends ExtractAbiFunctionNames<
      ContractAbi<TContractName>,
      "nonpayable" | "payable"
    >,
  >(
    variables: XchangeWriteContractVariables<TContractName, TFunctionName>,
    options?: WriteContractOptions
  ) => {
    if (!deployedContractData) {
      notification.error(
        "Target Contract is not deployed, did you forget to run `pnpm run deploy`?"
      )
      return
    }

    if (!chain?.id) {
      notification.error("Please connect your wallet")
      return
    }
    if (chain?.id !== targetNetwork.id) {
      notification.error("You are on the wrong network")
      return
    }

    try {
      setIsMining(true)
      const { blockConfirmations, onBlockConfirmation, ...mutateOptions } =
        options || {}
      const makeWriteWithParams = () =>
        wagmiContractWrite.writeContractAsync(
          {
            abi: deployedContractData.abi as Abi,
            address: deployedContractData.address,
            ...variables,
          } as WagmiWriteContractVariables<Abi, string, any[], Config, number>,
          mutateOptions as
            | MutateOptions<
                WriteContractReturnType,
                WriteContractErrorType,
                WagmiWriteContractVariables<Abi, string, any[], Config, number>,
                unknown
              >
            | undefined
        )
      const writeTxResult = await writeTx(makeWriteWithParams, {
        blockConfirmations,
        onBlockConfirmation,
      })

      return writeTxResult
    } catch (e: any) {
      throw e
    } finally {
      setIsMining(false)
    }
  }

  const sendContractWriteTx = <
    TContractName extends ContractName,
    TFunctionName extends ExtractAbiFunctionNames<
      ContractAbi<TContractName>,
      "nonpayable" | "payable"
    >,
  >(
    variables: XchangeWriteContractVariables<TContractName, TFunctionName>,
    options?: Omit<
      WriteContractOptions,
      "onBlockConfirmation" | "blockConfirmations"
    >
  ) => {
    if (!deployedContractData) {
      notification.error(
        "Target Contract is not deployed, did you forget to run `pnpm run deploy`?"
      )
      return
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet")
      return
    }
    if (chain?.id !== targetNetwork.id) {
      notification.error("You are on the wrong network")
      return
    }

    wagmiContractWrite.writeContract(
      {
        abi: deployedContractData.abi as Abi,
        address: deployedContractData.address,
        ...variables,
      } as WagmiWriteContractVariables<Abi, string, any[], Config, number>,
      options as
        | MutateOptions<
            WriteContractReturnType,
            WriteContractErrorType,
            WagmiWriteContractVariables<Abi, string, any[], Config, number>,
            unknown
          >
        | undefined
    )
  }

  return {
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's writeContactAsync
    writeContractAsync: sendContractWriteAsyncTx,
    // Overwrite wagmi's writeContract
    writeContract: sendContractWriteTx,
  }
}
