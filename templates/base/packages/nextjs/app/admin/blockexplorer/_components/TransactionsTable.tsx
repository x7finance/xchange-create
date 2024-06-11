import { TransactionHash } from "./TransactionHash"
import { formatEther } from "viem"
import { Address } from "~~/components/xchange"
import { useTargetNetwork } from "~~/hooks/xchange-create/useTargetNetwork"
import {
  TransactionsTableProps,
  TransactionWithFunction,
} from "~~/utils/xchange"

export const TransactionsTable = ({
  blocks,
  transactionReceipts,
}: TransactionsTableProps) => {
  const { targetNetwork } = useTargetNetwork()

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-300 dark:divide-zinc-700">
        <thead className="bg-zinc-100 dark:bg-zinc-800">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Transaction Hash
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Function Called
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Block Number
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Time Mined
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              From
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              To
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Value ({targetNetwork.nativeCurrency.symbol})
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
          {blocks.map(block =>
            (block.transactions as TransactionWithFunction[]).map(tx => {
              const receipt = transactionReceipts[tx.hash]
              const timeMined = new Date(
                Number(block.timestamp) * 1000
              ).toLocaleString()
              const functionCalled = tx.input.substring(0, 10)

              return (
                <tr
                  key={tx.hash}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <TransactionHash hash={tx.hash} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {tx.functionName === "0x" ? (
                      ""
                    ) : (
                      <span className="mr-1">{tx.functionName}</span>
                    )}
                    {functionCalled !== "0x" && (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {functionCalled}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {block.number?.toString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {timeMined}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Address address={tx.from} size="sm" />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {!receipt?.contractAddress ? (
                      tx.to && <Address address={tx.to} size="sm" />
                    ) : (
                      <div className="relative">
                        <Address address={receipt.contractAddress} size="sm" />
                        <small className="absolute left-5 text-center text-[10px] text-zinc-500 dark:text-zinc-400">
                          (Contract Creation)
                        </small>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    {formatEther(tx.value)}{" "}
                    {targetNetwork.nativeCurrency.symbol}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
