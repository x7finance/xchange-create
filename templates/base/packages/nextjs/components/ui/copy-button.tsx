"use client"

import { useEffect, useState } from "react"
import { CheckCircleIcon, ClipboardIcon } from "lucide-react"
import { useClipboard } from "use-clipboard-copy"
import { cn } from "~~/utils/xchange/cn"

export function CopyButton({
  content,
  title,
  buttonPositionClass = "",
  size = 5,
  justIcon = false,
}: {
  content: string
  title: string
  buttonPositionClass?: string
  size?: number
  justIcon?: boolean
}) {
  const [copyCount, setCopyCount] = useState(0)
  const copied = copyCount > 0

  const clipboard = useClipboard({
    onSuccess() {
      setCopyCount(count => count + 1)
    },
  })

  useEffect(() => {
    if (copyCount > 0) {
      const timeout = setTimeout(() => setCopyCount(0), 1000)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [copyCount])

  return (
    <button
      type="button"
      className={cn(
        "group/button flex items-center justify-center overflow-hidden rounded-full pl-2 pr-3 text-[11px] font-medium opacity-80 backdrop-blur transition focus:opacity-100 group-hover:opacity-100",
        copied
          ? "bg-emerald-400/10 font-bold ring-1 ring-inset ring-emerald-400/20 dark:font-medium"
          : "hover:bg-white/7.5 bg-white/5 ring-1 ring-black/40 dark:bg-white/5 dark:ring-white/20 dark:hover:bg-white/5",
        buttonPositionClass
      )}
      onClick={() => {
        clipboard.copy(content)
      }}
    >
      <span
        aria-hidden={copied}
        className={cn(
          "pointer-events-none flex items-center gap-0.5 whitespace-nowrap text-zinc-600 transition duration-300 dark:text-zinc-400",
          copied && "-translate-y-1.5 opacity-0"
        )}
      >
        <ClipboardIcon
          className={`h-${size} w-${size} fill-zinc-500/20 stroke-zinc-500 transition-colors group-hover/button:stroke-zinc-400`}
        />
        {!justIcon && <>Copy {title}</>}
      </span>
      <span
        aria-hidden={!copied}
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center text-emerald-600 transition duration-300 dark:text-emerald-400",
          !copied && "translate-y-1.5 opacity-0"
        )}
      >
        {!justIcon ? (
          <>Copied!</>
        ) : (
          <>
            <CheckCircleIcon className="h-4 w-4" />
          </>
        )}
      </span>
    </button>
  )
}
