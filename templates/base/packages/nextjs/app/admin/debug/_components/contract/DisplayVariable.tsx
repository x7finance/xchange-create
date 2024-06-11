"use client"

import { useEffect } from "react"
import { InheritanceTooltip } from "./InheritanceTooltip"
import { displayTxResult } from "./utilsDisplay"
import { Abi, AbiFunction } from "abitype"
import { RefreshCcw } from "lucide-react"
import { Address } from "viem"
import { useReadContract } from "wagmi"
import { useAnimationConfig } from "~~/hooks/xchange-create"
import { useTargetNetwork } from "~~/hooks/xchange-create/useTargetNetwork"
import { getParsedError, notification } from "~~/utils/xchange"

type DisplayVariableProps = {
  contractAddress: Address
  abiFunction: AbiFunction
  refreshDisplayVariables: boolean
  inheritedFrom?: string
  abi: Abi
}

export const DisplayVariable = ({
  contractAddress,
  abiFunction,
  refreshDisplayVariables,
  abi,
  inheritedFrom,
}: DisplayVariableProps) => {
  const { targetNetwork } = useTargetNetwork()

  const {
    data: result,
    isFetching,
    refetch,
    error,
  } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    chainId: targetNetwork.id,
    query: {
      retry: false,
    },
  })

  const { showAnimation } = useAnimationConfig(result)

  useEffect(() => {
    refetch()
  }, [refetch, refreshDisplayVariables])

  useEffect(() => {
    if (error) {
      const parsedError = getParsedError(error)
      notification.error(parsedError)
    }
  }, [error])

  return (
    <div className="space-y-1 pb-2 last:pb-0">
      <div className="flex items-center">
        <h3 className="mb-0 break-all font-medium">{abiFunction.name}</h3>
        <button
          className="btn btn-ghost btn-xs"
          onClick={async () => await refetch()}
        >
          {isFetching ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <RefreshCcw
              className="ml-1 h-3 w-3 cursor-pointer"
              aria-hidden="true"
            />
          )}
        </button>
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </div>
      <div className="flex flex-col items-start font-medium text-zinc-500">
        <div>
          <div
            className={`block break-all bg-transparent transition ${
              showAnimation ? "bg-warning animate-pulse-fast rounded-sm" : ""
            }`}
          >
            {displayTxResult(result)}
          </div>
        </div>
      </div>
    </div>
  )
}
