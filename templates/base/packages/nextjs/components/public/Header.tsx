import Link from "next/link"

export const Header = () => {
  return (
    <div className="sticky top-0 z-20">
      <header className="flex w-full flex-col gap-3 p-3 md:h-16 md:flex-row md:items-center lg:px-4">
        <div className="flex w-full items-center gap-8">
          <div className="flex items-center gap-2">
            <Link
              className="rounded text-xl focus:outline-0 focus:ring-0 focus-visible:bg-zinc-200"
              href="/"
            >
              <span className="sr-only">Home</span>
              <span>🧪</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.x7finance.org/?chainId=${process.env.NEXT_PUBLIC_CHAIN_ID}&token0=NATIVE&token1=${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
              className="focus-visible:ring-ring flex h-8 shrink-0 items-center justify-center gap-[6px] whitespace-nowrap rounded-full bg-green-500 px-3 text-xs font-medium text-black shadow-none transition-colors hover:bg-green-400 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 dark:text-white"
            >
              Trade
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}
