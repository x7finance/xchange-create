"use client"

import React from "react"
import Link from "next/link"
import { buttonVariants } from "./ui/button"
import { DollarSignIcon, SearchIcon } from "lucide-react"
import { hardhat } from "viem/chains"
import { SwitchTheme } from "~~/components/SwitchTheme"
import { Faucet } from "~~/components/xchange"
import { useTargetNetwork } from "~~/hooks/xchange-create/useTargetNetwork"
import { useGlobalState } from "~~/services/store/store"
import { cn } from "~~/utils/xchange/cn"

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrencyPrice)
  const { targetNetwork } = useTargetNetwork()
  const isLocalNetwork = targetNetwork.id === hardhat.id

  return (
    <footer className="bottom sticky bg-zinc-100 py-8 text-black dark:bg-zinc-900 dark:text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between">
          <div className="mb-4 w-full md:mb-0 md:w-auto">
            <Link href="/" className="text-2xl font-bold">
              Create Xchange App 🧪
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {nativeCurrencyPrice > 0 && (
              <div className="flex items-center space-x-2 rounded-full bg-green-500 px-3 py-1 text-white">
                <DollarSignIcon className="h-4 w-4" />
                <span>{nativeCurrencyPrice}</span>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link
                  href="/admin/blockexplorer"
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                    })
                  )}
                >
                  <SearchIcon className="mr-1 h-4 w-4" />
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
        </div>
        <hr className="my-8 border-zinc-700" />
        <div className="flex flex-wrap items-center justify-between">
          <div className="mb-4 w-full md:mb-0 md:w-auto">
            <p className="text-sm italic">
              Trust No One. Trust Code. Long Live DeFi
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <SwitchTheme />
            <Link
              href="https://github.com/x7finance"
              className="text-sm hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Github
            </Link>
            <Link
              href="https://www.x7finance.org"
              className="text-sm hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Xchange
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
