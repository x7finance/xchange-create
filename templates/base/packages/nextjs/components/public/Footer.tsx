import Link from "next/link"
import { getDextoolsHttpUrl } from "~~/utils/xchange"

export function Footer() {
  return (
    <footer className="fixed bottom-0 right-0 z-50 inline-flex items-center justify-between px-4 pb-2 pt-1 text-white mix-blend-difference dark:text-zinc-300">
      <nav className="flex items-center gap-2.5 rounded-full text-xs font-medium text-zinc-800 dark:text-zinc-200">
        <Link
          className="hover:text-zinc-400 dark:hover:text-zinc-200"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.dextools.io/app/en/${getDextoolsHttpUrl()}/pair-explorer/${
            process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
          }`}
        >
          Chart
        </Link>
        <Link
          className="hover:text-zinc-400 dark:hover:text-zinc-200"
          target="_blank"
          rel="noopener noreferrer"
          href={`${process.env.NEXT_PUBLIC_TWITTER_URL}`}
        >
          Twitter
        </Link>
        <Link
          className="hover:text-zinc-400 dark:hover:text-zinc-200"
          href={`${process.env.NEXT_PUBLIC_TELEGRAM_URL}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Telegram
        </Link>
        <a
          className="flex h-6 w-6 items-center justify-center"
          href="https://github.com/x7finance"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="sr-only">Create Xchange App</span>
          <span>🧪</span>
        </a>
      </nav>
    </footer>
  )
}
