"use client"

import { useEffect } from "react"
import { ArrowUpWideNarrowIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useLocalStorage } from "usehooks-ts"
import { ContractUI } from "~~/app/admin/debug/_components/contract"
import { Button } from "~~/components/ui/button"
import { ContractName } from "~~/utils/xchange/contract"
import { getAllContracts } from "~~/utils/xchange/contractsData"

const selectedContractStorageKey = "xchangeCreate.selectedContract"
const contractsData = getAllContracts()
const contractNames = Object.keys(contractsData) as ContractName[]

export function DebugContracts() {
  const [selectedContract, setSelectedContract] = useLocalStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
    { initializeWithValue: false }
  )
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!contractNames.includes(selectedContract)) {
      setSelectedContract(contractNames[0])
    }
  }, [selectedContract, setSelectedContract])

  return (
    <div className="flex flex-col items-center justify-center gap-y-6 py-8 lg:gap-y-8 lg:py-12">
      {contractNames.length === 0 ? (
        <p className="mt-14 text-3xl">No contracts found!</p>
      ) : (
        <>
          {contractNames.length > 1 && (
            <div className="flex w-full max-w-7xl flex-row flex-wrap gap-2 px-6 pb-1 lg:px-10">
              {contractNames.map(contractName => (
                <Button
                  key={contractName}
                  onClick={() => setSelectedContract(contractName)}
                  variant={
                    contractName === selectedContract ? "default" : "ghost"
                  }
                  className={`${
                    resolvedTheme === "dark"
                      ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                      : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  } ${
                    contractName === selectedContract
                      ? "ring-2 ring-green-500"
                      : ""
                  }`}
                >
                  {contractName}
                  {contractsData[contractName].external && (
                    <span
                      className="tooltip tooltip-top tooltip-accent"
                      data-tip="External contract"
                    >
                      <ArrowUpWideNarrowIcon className="h-4 w-4 cursor-pointer" />
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )}
          {contractNames.map(contractName => (
            <ContractUI
              key={contractName}
              contractName={contractName}
              className={contractName === selectedContract ? "" : "hidden"}
            />
          ))}
        </>
      )}
    </div>
  )
}
