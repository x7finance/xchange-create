"use client"

import { Suspense, useEffect, useState } from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "~~/utils/xchange/cn"

export function SwitchTheme() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Suspense>
      <div className="max-w-max">
        <div
          className={cn(
            "relative flex max-w-max items-center rounded-full border border-zinc-200 p-1 dark:border-zinc-800"
          )}
          role="radiogroup"
        >
          <button
            onClick={() => setTheme("dark")}
            aria-label="Dark"
            className={cn(
              theme === "dark"
                ? "rounded-full bg-zinc-200 dark:bg-zinc-800"
                : "",
              "m-0 flex h-8 w-8 cursor-pointer items-center justify-center px-0"
            )}
            role="radio"
            aria-checked={theme === "dark"}
            type="button"
          >
            <span>
              <MoonIcon className="h-4 w-4" />
            </span>
          </button>
          <button
            onClick={() => setTheme("light")}
            aria-label="Light"
            className={cn(
              theme === "light"
                ? "rounded-full bg-zinc-200 text-black dark:bg-zinc-800"
                : "",
              "m-0 flex h-8 w-8 cursor-pointer items-center justify-center px-0"
            )}
            aria-checked={theme === "light"}
            role="radio"
            type="button"
          >
            <span>
              <SunIcon className="h-4 w-4" />
            </span>
          </button>
          <button
            onClick={() => setTheme("system")}
            aria-label="System"
            className={cn(
              theme === "system"
                ? "rounded-full bg-zinc-200 dark:bg-zinc-800"
                : "",
              "m-0 flex h-8 w-8 cursor-pointer items-center justify-center px-0"
            )}
            aria-checked={theme === "system"}
            role="radio"
            type="button"
          >
            <span>
              <MonitorIcon className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </Suspense>
  )
}
