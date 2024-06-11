import React from "react"
import { getMetadata } from "~~/utils/xchange/getMetadata"

export const metadata = getMetadata({
  title: "Block Explorer",
  description: "Block Explorer created with 🧪 Xchange Create",
})

const BlockExplorerLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export default BlockExplorerLayout
