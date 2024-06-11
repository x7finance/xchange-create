"use client"

// @refresh reset
import { useReducer } from "react"
import { ContractReadMethods } from "./ContractReadMethods"
import { ContractVariables } from "./ContractVariables"
import { ContractWriteMethods } from "./ContractWriteMethods"
import { Address, Balance } from "~~/components/xchange"
import {
  useDeployedContractInfo,
  useNetworkColor,
} from "~~/hooks/xchange-create"
import { useTargetNetwork } from "~~/hooks/xchange-create/useTargetNetwork"
import { ContractName } from "~~/utils/xchange/contract"

type ContractUIProps = {
  contractName: ContractName
  className?: string
}

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({
  contractName,
  className = "",
}: ContractUIProps) => {
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(
    value => !value,
    false
  )
  const { targetNetwork } = useTargetNetwork()
  const { data: deployedContractData, isLoading: deployedContractLoading } =
    useDeployedContractInfo(contractName)
  const networkColor = useNetworkColor()

  if (deployedContractLoading) {
    return (
      <div className="mt-14">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!deployedContractData) {
    return (
      <p className="mt-14 text-3xl">
        {`No contract found by the name of "${contractName}" on chain "${targetNetwork.name}"!`}
      </p>
    )
  }

  return (
    <div
      className={`my-0 grid w-full max-w-7xl grid-cols-1 px-6 lg:grid-cols-6 lg:gap-12 lg:px-10 ${className}`}
    >
      <div className="col-span-5 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-300 p-6 shadow-md dark:border-zinc-700 dark:bg-zinc-700">
            <div className="mb-4">
              <h3 className="mb-2 font-bold text-zinc-600 dark:text-zinc-400">
                Contract Name
              </h3>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {contractName}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="mb-2 font-bold text-zinc-600 dark:text-zinc-400">
                Contract Address
              </h3>
              <Address address={deployedContractData.address} />
            </div>
            <div className="mb-4">
              <h3 className="mb-2 font-bold text-zinc-600 dark:text-zinc-400">
                Contract Balance
              </h3>
              <Balance
                address={deployedContractData.address}
                className="text-xl font-bold text-green-500 dark:text-green-400"
              />
            </div>
            {targetNetwork && (
              <div>
                <h3 className="mb-2 font-bold text-zinc-600 dark:text-zinc-400">
                  Contract Network
                </h3>
                <p className="font-medium" style={{ color: networkColor }}>
                  {targetNetwork.name}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-zinc-300 px-6 py-4 dark:bg-zinc-700">
            <h3 className="mb-2 font-bold text-zinc-600 dark:text-zinc-400">
              Contract Variables
            </h3>
            <ContractVariables
              refreshDisplayVariables={refreshDisplayVariables}
              deployedContractData={deployedContractData}
            />
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
          <div className="z-10">
            <div className="relative mt-10 flex flex-col rounded-xl border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="absolute -left-[1px] -top-[38px] -z-10 h-[5rem] w-[5.5rem] self-start rounded-xl bg-zinc-300 py-[0.65rem] dark:bg-zinc-700">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm">Read</p>
                </div>
              </div>
              <div className="divide-y divide-zinc-300 p-5 dark:divide-zinc-700">
                <ContractReadMethods
                  deployedContractData={deployedContractData}
                />
              </div>
            </div>
          </div>
          <div className="z-10">
            <div className="relative mt-10 flex flex-col rounded-xl border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="absolute -left-[1px] -top-[38px] -z-10 h-[5rem] w-[5.5rem] self-start rounded-xl bg-zinc-300 py-[0.65rem] dark:bg-zinc-700">
                <div className="flex items-center justify-center space-x-2">
                  <p className="my-0 text-sm">Write</p>
                </div>
              </div>
              <div className="divide-y divide-zinc-300 p-5 dark:divide-zinc-700">
                <ContractWriteMethods
                  deployedContractData={deployedContractData}
                  onChange={triggerRefreshDisplayVariables}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
