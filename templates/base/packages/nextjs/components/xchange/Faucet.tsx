"use client"

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import {
  Address as AddressType,
  createWalletClient,
  http,
  parseEther,
} from "viem"
import { hardhat } from "viem/chains"
import { useAccount } from "wagmi"
import {
  Address,
  AddressInput,
  Balance,
  EtherInput,
} from "~~/components/xchange"
import { useTransactor } from "~~/hooks/xchange-create"
import { notification } from "~~/utils/xchange"

// Account index to use from generated hardhat accounts.
const FAUCET_ACCOUNT_INDEX = 0

const localWalletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
})

/**
 * Faucet modal which lets you send ETH to any address.
 */
export const Faucet = () => {
  const [loading, setLoading] = useState(false)
  const [inputAddress, setInputAddress] = useState<AddressType>()
  const [faucetAddress, setFaucetAddress] = useState<AddressType>()
  const [sendValue, setSendValue] = useState("")

  const { chain: ConnectedChain } = useAccount()

  const faucetTxn = useTransactor(localWalletClient)

  useEffect(() => {
    const getFaucetAddress = async () => {
      try {
        const accounts = await localWalletClient.getAddresses()
        setFaucetAddress(accounts[FAUCET_ACCOUNT_INDEX])
      } catch (error) {
        notification.error(
          <>
            <p className="mb-1 mt-0 font-bold">
              Cannot connect to local provider
            </p>
            <p className="m-0">
              - Did you forget to run{" "}
              <code className="bg-zinc-300 text-base font-bold italic dark:bg-zinc-700">
                pnpm run chain
              </code>{" "}
              ?
            </p>
            <p className="mt-1 break-normal">
              - Or you can change{" "}
              <code className="bg-zinc-300 text-base font-bold italic dark:bg-zinc-700">
                targetNetwork
              </code>{" "}
              in{" "}
              <code className="bg-zinc-300 text-base font-bold italic dark:bg-zinc-700">
                xchange.config.ts
              </code>
            </p>
          </>
        )
        console.error("⚡️ ~ file: Faucet.tsx:getFaucetAddress ~ error", error)
      }
    }
    getFaucetAddress()
  }, [])

  const sendETH = async () => {
    if (!faucetAddress) {
      return
    }
    try {
      setLoading(true)
      await faucetTxn({
        to: inputAddress,
        value: parseEther(sendValue as `${number}`),
        account: faucetAddress,
        chain: hardhat,
      })
      setLoading(false)
      setInputAddress(undefined)
      setSendValue("")
    } catch (error) {
      console.error("⚡️ ~ file: Faucet.tsx:sendETH ~ error", error)
      setLoading(false)
    }
  }

  // Render only on local chain
  if (ConnectedChain?.id !== hardhat.id) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>Faucet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Local Faucet</DialogTitle>
          <DialogDescription>
            Add funds to your local hardhat wallet for testing!
          </DialogDescription>
        </DialogHeader>
        <div className="px-6">
          <div className="divide-accent flex max-h-[300px] flex-col divide-y">
            <div className="space-y-3">
              <div className="flex space-x-4">
                <div>
                  <span className="text-sm font-bold">From:</span>
                  <Address address={faucetAddress} />
                </div>
                <div>
                  <span className="pl-3 text-sm font-bold">Available:</span>
                  <Balance address={faucetAddress} />
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <AddressInput
                  placeholder="Destination Address"
                  value={inputAddress ?? ""}
                  onChange={value => setInputAddress(value as AddressType)}
                />
                <EtherInput
                  placeholder="Amount to send"
                  value={sendValue}
                  onChange={value => setSendValue(value)}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex w-full items-center justify-center">
          <DialogClose asChild={true}>
            <Button variant={"outline"} className="mr-auto">
              Close
            </Button>
          </DialogClose>
          <Button variant="primary" onClick={sendETH} disabled={loading}>
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // return (
  //   <div>
  //     <label
  //       htmlFor="faucet-modal"
  //       className="btn btn-primary btn-sm font-normal gap-1"
  //     >
  //       <BanknoteIcon className="h-4 w-4" />
  //       <span>Faucet</span>
  //     </label>
  //     <input type="checkbox" id="faucet-modal" className="modal-toggle" />
  //     <label htmlFor="faucet-modal" className="modal cursor-pointer">
  //       <label className="modal-box relative">
  //         {/* dummy input to capture event onclick on modal box */}
  //         <input className="h-0 w-0 absolute top-0 left-0" />
  //         <h3 className="text-xl font-bold mb-3">Local Faucet</h3>
  //         <label
  //           htmlFor="faucet-modal"
  //           className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
  //         >
  //           ✕
  //         </label>

  //         </div>
  //       </label>
  //     </label>
  //   </div>
  // )
}
