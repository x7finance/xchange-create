import { useRef, useState } from "react"
import { NetworkOptions } from "./NetworkOptions"
import {
  ArrowLeftRight,
  ChevronDownIcon,
  LogOutIcon,
  QrCodeIcon,
  SquareArrowOutUpRight,
} from "lucide-react"
import { Address, getAddress } from "viem"
import { useDisconnect } from "wagmi"
import { CopyButton } from "~~/components/ui/copy-button"
import { BlockieAvatar, isENS } from "~~/components/xchange"
import { useOutsideClick } from "~~/hooks/xchange-create"
import { getTargetNetworks } from "~~/utils/xchange"

const allowedNetworks = getTargetNetworks()

type AddressInfoDropdownProps = {
  address: Address
  blockExplorerAddressLink: string | undefined
  displayName: string
  ensAvatar?: string
}

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect()
  const checkSumAddress = getAddress(address)

  const [selectingNetwork, setSelectingNetwork] = useState(false)
  const dropdownRef = useRef<HTMLDetailsElement>(null)
  const closeDropdown = () => {
    setSelectingNetwork(false)
    dropdownRef.current?.removeAttribute("open")
  }
  // @ts-expect-error: todo fix
  useOutsideClick(dropdownRef, closeDropdown)

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary
          tabIndex={0}
          className="btn btn-secondary btn-sm dropdown-toggle !h-auto gap-0 pl-0 pr-2 shadow-md"
        >
          <BlockieAvatar
            address={checkSumAddress}
            size={30}
            ensImage={ensAvatar}
          />
          <span className="ml-2 mr-1">
            {isENS(displayName)
              ? displayName
              : checkSumAddress?.slice(0, 6) +
                "..." +
                checkSumAddress?.slice(-4)}
          </span>
          <ChevronDownIcon className="ml-2 h-6 w-4 sm:ml-0" />
        </summary>
        <ul
          tabIndex={0}
          className="dropdown-content menu shadow-center shadow-accent rounded-box z-[2] mt-2 gap-1 bg-zinc-200 p-2"
        >
          <NetworkOptions hidden={!selectingNetwork} />
          <li className={selectingNetwork ? "hidden" : ""}>
            <CopyButton
              buttonPositionClass={"ring-0 py-1 ml-1"}
              title="Address"
              size={4}
              content={checkSumAddress}
            />
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <label
              htmlFor="qrcode-modal"
              className="btn-sm flex gap-3 !rounded-xl py-3"
            >
              <QrCodeIcon className="ml-2 h-6 w-4 sm:ml-0" />
              <span className="whitespace-nowrap">View QR Code</span>
            </label>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item btn-sm flex gap-3 !rounded-xl py-3"
              type="button"
            >
              <SquareArrowOutUpRight className="ml-2 h-6 w-4 sm:ml-0" />
              <a
                target="_blank"
                href={blockExplorerAddressLink}
                rel="noopener noreferrer"
                className="whitespace-nowrap"
              >
                View on Block Explorer
              </a>
            </button>
          </li>
          {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="btn-sm flex gap-3 !rounded-xl py-3"
                type="button"
                onClick={() => {
                  setSelectingNetwork(true)
                }}
              >
                <ArrowLeftRight className="ml-2 h-6 w-4 sm:ml-0" />{" "}
                <span>Switch Network</span>
              </button>
            </li>
          ) : null}
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item text-error btn-sm flex gap-3 !rounded-xl py-3"
              type="button"
              onClick={() => disconnect()}
            >
              <LogOutIcon className="ml-2 h-6 w-4 sm:ml-0" />{" "}
              <span>Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  )
}
