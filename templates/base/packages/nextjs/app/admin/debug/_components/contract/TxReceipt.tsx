import { TransactionReceipt } from "viem"
import { displayTxResult } from "~~/app/admin/debug/_components/contract"
import { CopyButton } from "~~/components/ui/copy-button"

export const TxReceipt = (
  txResult:
    | string
    | number
    | bigint
    | Record<string, any>
    | TransactionReceipt
    | undefined
) => {
  return (
    <div className="bg-secondary flex min-h-0 rounded-xl py-0 text-sm peer-checked:rounded-b-none">
      <div className="mt-1 pl-2">
        <CopyButton
          buttonPositionClass={"ring-0"}
          title="Tx Hash"
          size={4}
          content={displayTxResult(txResult) as string}
        />
      </div>
      <div className="collapse-arrow collapse flex-wrap">
        <input type="checkbox" className="peer min-h-0" />
        <div className="collapse-title min-h-0 py-1.5 pl-1 text-sm">
          <strong>Transaction Receipt</strong>
        </div>
        <div className="collapse-content bg-secondary overflow-auto rounded-xl rounded-t-none">
          <pre className="pt-4 text-xs">{displayTxResult(txResult)}</pre>
        </div>
      </div>
    </div>
  )
}
