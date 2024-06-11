"use client"

import React, { useEffect, useState } from "react"
import { TooltipProvider } from "./ui/tooltip"
import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { Toaster } from "react-hot-toast"
import { WagmiProvider } from "wagmi"
import { BlockieAvatar } from "~~/components/xchange"
import { ProgressBar } from "~~/components/xchange/ProgressBar"
import { wagmiConfig } from "~~/services/web3/wagmiConfig"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export const AppWithProviders = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === "dark"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ProgressBar />
          <RainbowKitProvider
            avatar={BlockieAvatar}
            theme={
              mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()
            }
          >
            <>
              <div className="flex min-h-screen flex-col">
                <main className="relative flex flex-1 flex-col">
                  {children}
                </main>
              </div>
              <Toaster />
            </>
          </RainbowKitProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
