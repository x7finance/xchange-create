"use client"

import { useEffect, useState } from "react"
import { InheritanceTooltip } from "./InheritanceTooltip"
import { Abi, AbiFunction } from "abitype"
import { Address } from "viem"
import { useReadContract } from "wagmi"
import {
  ContractInput,
  displayTxResult,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/app/admin/debug/_components/contract"
import { Button } from "~~/components/ui/button"
import { useTargetNetwork } from "~~/hooks/xchange-create/useTargetNetwork"
import { getParsedError, notification } from "~~/utils/xchange"

type ReadOnlyFunctionFormProps = {
  contractAddress: Address
  abiFunction: AbiFunction
  inheritedFrom?: string
  abi: Abi
}

export const ReadOnlyFunctionForm = ({
  contractAddress,
  abiFunction,
  inheritedFrom,
  abi,
}: ReadOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialFormState(abiFunction)
  )
  const [result, setResult] = useState<unknown>()
  const { targetNetwork } = useTargetNetwork()

  const { isFetching, refetch, error } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    args: getParsedContractFunctionArgs(form),
    chainId: targetNetwork.id,
    query: {
      enabled: false,
      retry: false,
    },
  })

  useEffect(() => {
    if (error) {
      const parsedError = getParsedError(error)
      notification.error(parsedError)
    }
  }, [error])

  const transformedFunction = transformAbiFunction(abiFunction)
  const inputElements = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex)
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setResult(undefined)
          setForm(updatedFormValue)
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    )
  })

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <p className="my-0 break-words font-medium">
        {abiFunction.name}
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </p>
      {inputElements}
      <div className="flex flex-wrap justify-between gap-2">
        <div className="w-4/5 flex-grow">
          {result !== null && result !== undefined && (
            <div className="bg-secondary break-words rounded-xl px-4 py-1.5 text-sm">
              <p className="m-0 mb-1 font-bold">Result:</p>
              <pre className="whitespace-pre-wrap break-words">
                {displayTxResult(result)}
              </pre>
            </div>
          )}
        </div>
        <Button
          variant="primary"
          className="ml-auto"
          onClick={async () => {
            const { data } = await refetch()
            setResult(data)
          }}
          loading={isFetching}
          disabled={isFetching}
        >
          Read
        </Button>
      </div>
    </div>
  )
}
