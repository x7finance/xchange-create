"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeftIcon } from "lucide-react"
import {
  formatEther,
  formatUnits,
  Hash,
  Transaction,
  TransactionReceipt,
} from "viem"
import { hardhat } from "viem/chains"
import { usePublicClient } from "wagmi"
import { Button } from "~~/components/ui/button"
import { Address } from "~~/components/xchange"
import { useTargetNetwork } from "~~/hooks/xchange-create/useTargetNetwork"
import { decodeTransactionData, getFunctionDetails } from "~~/utils/xchange"
import { replacer } from "~~/utils/xchange/common"

const TransactionComp = ({ txHash }: { txHash: Hash }) => {
  const client = usePublicClient({ chainId: hardhat.id })
  const router = useRouter()
  const [transaction, setTransaction] = useState<Transaction>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()
  const [functionCalled, setFunctionCalled] = useState<string>()

  const { targetNetwork } = useTargetNetwork()

  useEffect(() => {
    if (txHash && client) {
      const fetchTransaction = async () => {
        const tx = await client.getTransaction({ hash: txHash })
        const receipt = await client.getTransactionReceipt({ hash: txHash })

        const transactionWithDecodedData = decodeTransactionData(tx)
        setTransaction(transactionWithDecodedData)
        setReceipt(receipt)

        const functionCalled = transactionWithDecodedData.input.substring(0, 10)
        setFunctionCalled(functionCalled)
      }

      fetchTransaction()
    }
  }, [client, txHash])

  return (
    <div className="container mx-auto mb-20 mt-10 px-4">
      <Button variant="outline" onClick={() => router.back()}>
        <ChevronLeftIcon
          className="relative right-1 h-5 w-5"
          aria-hidden="true"
        />
        Back
      </Button>
      {transaction ? (
        <div className="overflow-x-auto">
          <h2 className="mb-6 text-center text-3xl font-bold text-zinc-800 dark:text-zinc-200">
            Transaction Details
          </h2>
          <table className="min-w-full divide-y divide-zinc-300 dark:divide-zinc-700">
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
              <tr>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                  Transaction Hash:
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  {transaction.hash}
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                  Block Number:
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  {Number(transaction.blockNumber)}
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                  From:
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  <Address address={transaction.from} format="long" />
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                  To:
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  {!receipt?.contractAddress ? (
                    transaction.to && (
                      <Address address={transaction.to} format="long" />
                    )
                  ) : (
                    <span>
                      Contract Creation:
                      <Address
                        address={receipt.contractAddress}
                        format="long"
                      />
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                  Value:
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  {formatEther(transaction.value)}{" "}
                  {targetNetwork.nativeCurrency.symbol}
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                  Function called:
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  <div className="overflow-x-auto">
                    {functionCalled === "0x" ? (
                      "This transaction did not call any function."
                    ) : (
                      <>
                        <span className="mr-2">
                          {getFunctionDetails(transaction)}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          {functionCalled}
                        </span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                  Gas Price:
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  {formatUnits(transaction.gasPrice || 0n, 9)} Gwei
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                  Data:
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  <textarea
                    readOnly
                    value={transaction.input}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:focus:ring-zinc-600"
                    rows={5}
                  />
                </td>
              </tr>
              <tr>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-zinc-200">
                  Logs:
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  <ul className="space-y-2">
                    {receipt?.logs?.map((log, i) => (
                      <li key={i}>
                        <strong>Log {i} topics:</strong>{" "}
                        {JSON.stringify(log.topics, replacer, 2)}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-2xl text-zinc-500 dark:text-zinc-400">Loading...</p>
      )}
    </div>
  )
}

export default TransactionComp
