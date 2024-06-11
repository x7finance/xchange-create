import { DebugContracts } from "./_components/DebugContracts"
import type { NextPage } from "next"
import { getMetadata } from "~~/utils/xchange/getMetadata"

export const metadata = getMetadata({
  title: "Debug Contracts",
  description: "Debug your deployed 🧪 Xchange Create contracts in an easy way",
})

const Debug: NextPage = () => {
  return (
    <>
      <DebugContracts />
      <div className="bg-secondary mt-8 p-10 text-center">
        <h1 className="my-0 text-4xl">Debug Contracts</h1>
        <p className="text-neutral">
          You can debug & interact with your deployed contracts here.
          <br /> Check{" "}
          <code className="bg-zinc-300 px-1 text-base font-bold italic [word-spacing:-0.5rem]">
            packages / nextjs / app / debug / page.tsx
          </code>{" "}
        </p>
      </div>
    </>
  )
}

export default Debug
