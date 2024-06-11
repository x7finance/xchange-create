"use client"

import { useState } from "react"
import { Address, formatEther } from "viem"
import { useTargetNetwork } from "~~/hooks/xchange-create/useTargetNetwork"
import { useWatchBalance } from "~~/hooks/xchange-create/useWatchBalance"
import { useGlobalState } from "~~/services/store/store"
import { cn } from "~~/utils/xchange/cn"

type BalanceProps = {
  address?: Address
  className?: string
  usdMode?: boolean
}

/**
 * Display (ETH & USD) balance of an ETH address.
 */
export const Balance = ({ address, className = "", usdMode }: BalanceProps) => {
  const { targetNetwork } = useTargetNetwork()
  const price = useGlobalState(state => state.nativeCurrencyPrice)
  const {
    data: balance,
    isError,
    isLoading,
  } = useWatchBalance({
    address,
  })

  const [displayUsdMode, setDisplayUsdMode] = useState(
    price > 0 ? Boolean(usdMode) : false
  )

  const toggleBalanceMode = () => {
    if (price > 0) {
      setDisplayUsdMode(prevMode => !prevMode)
    }
  }

  if (!address || isLoading || balance === null) {
    return (
      <div className="flex animate-pulse space-x-4">
        <div className="h-6 w-6 rounded-md bg-slate-300"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 rounded bg-slate-300"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className={`flex max-w-fit cursor-pointer flex-col items-center rounded-md border-2 border-zinc-400 px-2`}
      >
        <div className="text-warning">Error</div>
      </div>
    )
  }

  const formattedBalance = balance ? Number(formatEther(balance.value)) : 0

  return (
    <button
      className={cn(
        `flex flex-col items-center hover:bg-transparent ${className}`
      )}
      onClick={toggleBalanceMode}
    >
      <div className="flex w-full items-center justify-center font-medium">
        {displayUsdMode ? (
          <>
            <span className="mr-1">$</span>
            <span>{(formattedBalance * price).toFixed(2)}</span>
          </>
        ) : (
          <>
            <span>{formattedBalance.toFixed(4)}</span>
            <span className="ml-1">{targetNetwork.nativeCurrency.symbol}</span>
          </>
        )}
      </div>
    </button>
  )
}
