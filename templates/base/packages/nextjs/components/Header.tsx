"use client"

import React from "react"
import Link from "next/link"
import { buttonVariants } from "./ui/button"
import { CandlestickChartIcon } from "lucide-react"
import { cn } from "~~/utils/xchange/cn"

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 mx-auto w-full overflow-hidden border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          className="flex items-center gap-2 text-lg font-semibold sm:w-36"
          href="#"
        >
          <span className="">🧪</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-6">
          <Link
            className="[&.active].dark:text-zinc-50 [&.active].dark:after:bg-zinc-50 relative text-nowrap text-xs font-medium transition-colors hover:text-zinc-900 sm:text-sm dark:hover:text-zinc-50 [&.active]:text-zinc-900 [&.active]:after:absolute [&.active]:after:-bottom-1 [&.active]:after:left-0 [&.active]:after:h-0.5 [&.active]:after:w-full [&.active]:after:bg-zinc-900"
            href="/admin"
          >
            Admin Home
          </Link>
          <Link
            className="[&.active].dark:text-zinc-50 [&.active].dark:after:bg-zinc-50 relative text-nowrap text-xs font-medium transition-colors hover:text-zinc-900 sm:text-sm dark:hover:text-zinc-50 [&.active]:text-zinc-900 [&.active]:after:absolute [&.active]:after:-bottom-1 [&.active]:after:left-0 [&.active]:after:h-0.5 [&.active]:after:w-full [&.active]:after:bg-zinc-900"
            href="/admin/blockexplorer"
          >
            Block Explorer
          </Link>
          <Link
            className="[&.active].dark:text-zinc-50 [&.active].dark:after:bg-zinc-50 relative text-nowrap text-xs font-medium transition-colors hover:text-zinc-900 sm:text-sm dark:hover:text-zinc-50 [&.active]:text-zinc-900 [&.active]:after:absolute [&.active]:after:-bottom-1 [&.active]:after:left-0 [&.active]:after:h-0.5 [&.active]:after:w-full [&.active]:after:bg-zinc-900"
            href="/admin/debug"
          >
            Debug
          </Link>
        </nav>
        <div className="sm:w-36">
          <Link
            href="https://www.x7finance.org"
            className={cn(
              buttonVariants({
                variant: "primary",
              })
            )}
          >
            <CandlestickChartIcon className="mr-1 h-4 w-4" />
            Test Trade
          </Link>
        </div>
      </div>
    </header>
  )
}
