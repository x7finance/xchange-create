import Link from "next/link"
import { CopyButton } from "~~/components/ui/copy-button"

export const TransactionHash = ({ hash }: { hash: string }) => {
  return (
    <div className="flex items-center">
      <Link
        href={`/admin/blockexplorer/transaction/${hash}`}
        className="text-sm"
      >
        {hash?.substring(0, 6)}...{hash?.substring(hash.length - 4)}
      </Link>
      <CopyButton
        buttonPositionClass={"ring-0 py-1 ml-1 px-2"}
        title=""
        justIcon={true}
        size={4}
        content={hash}
      />
    </div>
  )
}
