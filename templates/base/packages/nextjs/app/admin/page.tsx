"use client"

import Link from "next/link"
import { BugIcon, SearchIcon } from "lucide-react"
import type { NextPage } from "next"
import { useAccount } from "wagmi"
import { Address } from "~~/components/xchange"

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount()

  return (
    <>
      <div className="flex flex-grow flex-col items-center pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="mb-2 block text-xl">welcome to</span>
            <span className="block text-4xl font-bold">
              Create Xchange App 🧪
            </span>
          </h1>
          <div className="mt-8 flex items-center justify-center space-x-2">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">
            This is the admin page which you can access via /admin
          </p>
          <p className="mb-2 mt-8 text-center text-lg">
            To edit your default launch landing page, edit{" "}
            <code className="inline-block max-w-full break-words break-all bg-zinc-700 font-bold italic text-green-500">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract{" "}
            <code className="inline-block max-w-full break-words break-all bg-zinc-700 font-bold italic text-green-500">
              TokenContract.sol
            </code>{" "}
            in{" "}
            <code className="inline-block max-w-full break-words break-all bg-zinc-700 font-bold italic text-green-500">
              packages/hardhat/contracts
            </code>
          </p>
        </div>

        <div className="w-full flex-grow px-8 py-12">
          <h3 className="mb-4 text-center font-bold text-green-500">
            cxa comes out of the box with
          </h3>
          <div className="flex flex-col items-center justify-center gap-12 sm:flex-row">
            <div className="flex max-w-xs flex-col items-center rounded-xl bg-zinc-100 px-10 py-10 text-center dark:bg-zinc-900">
              <BugIcon className="fill-secondary mb-2 h-8 w-8" />
              <p>
                Tinker with your tokens smart contract using the{" "}
                <Link href="/admin/debug" passHref className=" underline">
                  Debug
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex max-w-xs flex-col items-center rounded-xl bg-zinc-100 px-10 py-10 text-center dark:bg-zinc-900">
              <SearchIcon className="fill-secondary mb-2 h-8 w-8" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/admin/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
