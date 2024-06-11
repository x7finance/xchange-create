import Image from "next/image"
import Link from "next/link"
import { Footer } from "~~/components/public/Footer"
import { Header } from "~~/components/public/Header"
import { getDextoolsHttpUrl, getScannerHttpUrl } from "~~/utils/xchange"

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="relative mb-4 flex items-center justify-center py-[26vh] pt-[18vh] sm:pt-[26vh]">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="relative h-full w-full min-w-[29rem] max-w-[96rem] sm:mb-0">
              <Image
                alt="background-image"
                fetchPriority="high"
                decoding="async"
                data-nimg="fill"
                width={1283}
                height={610}
                className="pointer-events-none absolute inset-0 -z-10 -translate-x-2 select-none opacity-50 sm:translate-x-0 dark:opacity-20"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  color: "transparent",
                }}
                src="/background.svg"
              />
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center gap-6 px-6 text-center">
            <div className="flex w-full flex-col items-center gap-1.5">
              <h2 className="text-4xl font-semibold tracking-tighter sm:text-5xl [@media(max-width:480px)]:text-[2rem]">
                Create Xchange App
              </h2>
              <p>
                The best way to build a decentralized applications on EVM
                compatible blockchains.
              </p>
            </div>
            <div className="absolute top-full mx-auto mt-6 flex max-w-full flex-wrap items-center justify-center gap-2 whitespace-nowrap px-4 text-sm">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`${process.env.NEXT_PUBLIC_TELEGRAM}`}
                className="inline-flex select-none items-center gap-1 whitespace-nowrap rounded-full border border-zinc-200 bg-white px-2 py-0.5 transition-colors hover:border-zinc-800 dark:border-zinc-800 dark:bg-black dark:hover:border-zinc-200"
              >
                Telegram
                <svg
                  width={15}
                  height={15}
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`${process.env.NEXT_PUBLIC_TWITTER}`}
                className="inline-flex select-none items-center gap-1 whitespace-nowrap rounded-full border border-zinc-200 bg-white px-2 py-0.5 transition-colors hover:border-zinc-800 dark:border-zinc-800 dark:bg-black dark:hover:border-zinc-200"
              >
                Twitter
                <svg
                  width={15}
                  height={15}
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`${getDextoolsHttpUrl()}`}
                className="inline-flex select-none items-center gap-1 whitespace-nowrap rounded-full border border-zinc-200 bg-white px-2 py-0.5 transition-colors hover:border-zinc-800 dark:border-zinc-800 dark:bg-black dark:hover:border-zinc-200"
              >
                Chart
                <svg
                  width={15}
                  height={15}
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                target="_blank"
                href={`${getScannerHttpUrl()}`}
                rel="noopener noreferrer"
                className="inline-flex select-none items-center gap-1 whitespace-nowrap rounded-full border border-zinc-200 bg-white px-2 py-0.5 transition-colors hover:border-zinc-800 dark:border-zinc-800 dark:bg-black dark:hover:border-zinc-200"
              >
                Contract
                <svg
                  width={15}
                  height={15}
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
