"use client"

import { useEffect, useState } from "react"
import { InheritanceTooltip } from "./InheritanceTooltip"
import { Abi, AbiFunction } from "abitype"
import { Address, TransactionReceipt } from "viem"
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import {
  ContractInput,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
  TxReceipt,
} from "~~/app/admin/debug/_components/contract"
import { Button } from "~~/components/ui/button"
import { IntegerInput } from "~~/components/xchange"
import { useTransactor } from "~~/hooks/xchange-create"
import { useTargetNetwork } from "~~/hooks/xchange-create/useTargetNetwork"
import { cn } from "~~/utils/xchange/cn"

type WriteOnlyFunctionFormProps = {
  abi: Abi
  abiFunction: AbiFunction
  onChange: () => void
  contractAddress: Address
  inheritedFrom?: string
}

export const WriteOnlyFunctionForm = ({
  abi,
  abiFunction,
  onChange,
  contractAddress,
  inheritedFrom,
}: WriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialFormState(abiFunction)
  )
  const [txValue, setTxValue] = useState<string | bigint>("")
  const { chain } = useAccount()
  const writeTxn = useTransactor()
  const { targetNetwork } = useTargetNetwork()
  const writeDisabled = !chain || chain?.id !== targetNetwork.id

  const { data: result, isPending, writeContractAsync } = useWriteContract()

  const handleWrite = async () => {
    if (writeContractAsync) {
      try {
        const makeWriteWithParams = () =>
          writeContractAsync({
            address: contractAddress,
            functionName: abiFunction.name,
            abi: abi,
            args: getParsedContractFunctionArgs(form),
            value: BigInt(txValue),
          })
        await writeTxn(makeWriteWithParams)
        onChange()
      } catch (e: any) {
        console.error(
          "⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error",
          e
        )
      }
    }
  }

  const [displayedTxResult, setDisplayedTxResult] =
    useState<TransactionReceipt>()
  const { data: txResult } = useWaitForTransactionReceipt({
    hash: result,
  })
  useEffect(() => {
    setDisplayedTxResult(txResult)
  }, [txResult])

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
  const transformedFunction = transformAbiFunction(abiFunction)
  const inputs = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex)
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setDisplayedTxResult(undefined)
          setForm(updatedFormValue)
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    )
  })
  const zeroInputs =
    inputs.length === 0 && abiFunction.stateMutability !== "payable"

  return (
    <div className="space-y-3 py-5 first:pt-0 last:pb-1">
      <div
        className={`flex gap-3 ${
          zeroInputs ? "flex-row items-center justify-between" : "flex-col"
        }`}
      >
        <p className="my-0 break-words font-medium">
          {abiFunction.name}
          <InheritanceTooltip inheritedFrom={inheritedFrom} />
        </p>
        {inputs}
        {abiFunction.stateMutability === "payable" ? (
          <div className="flex w-full flex-col gap-1.5">
            <div className="ml-2 flex items-center">
              <span className="mr-2 text-xs font-medium leading-none">
                payable value
              </span>
              <span className="block text-xs font-extralight leading-none">
                wei
              </span>
            </div>
            <IntegerInput
              value={txValue}
              onChange={updatedTxValue => {
                setDisplayedTxResult(undefined)
                setTxValue(updatedTxValue)
              }}
              placeholder="value (wei)"
            />
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          {!zeroInputs && (
            <div className="flex-grow basis-0">
              {displayedTxResult ? (
                <TxReceipt txResult={displayedTxResult} />
              ) : null}
            </div>
          )}
          <div
            className={cn(
              `flex ${
                writeDisabled &&
                "tooltip before:left-auto before:right-[-10px] before:transform-none before:content-[attr(data-tip)]"
              }`
            )}
            data-tip={cn(
              `${
                writeDisabled && "Wallet not connected or in the wrong network"
              }`
            )}
          >
            <Button
              variant="primary"
              className="ml-auto"
              disabled={writeDisabled || isPending}
              onClick={handleWrite}
              loading={isPending}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
      {zeroInputs && txResult ? (
        <div className="flex-grow basis-0">
          <TxReceipt txResult={txResult} />
        </div>
      ) : null}
    </div>
  )
}
