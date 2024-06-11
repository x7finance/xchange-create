"use client"

// @refresh reset
import { Balance } from "../Balance"
import { AddressInfoDropdown } from "./AddressInfoDropdown"
import { AddressQRCodeModal } from "./AddressQRCodeModal"
import { WrongNetworkDropdown } from "./WrongNetworkDropdown"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Address } from "viem"
import { useNetworkColor } from "~~/hooks/xchange-create"
import { useTargetNetwork } from "~~/hooks/xchange-create/useTargetNetwork"
import { getBlockExplorerAddressLink } from "~~/utils/xchange"

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor()
  const { targetNetwork } = useTargetNetwork()

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                )
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />
              }

              return (
                <>
                  <div className="mr-1 flex flex-col items-center">
                    <Balance
                      address={account.address as Address}
                      className="h-auto min-h-0"
                    />
                    <span className="text-xs" style={{ color: networkColor }}>
                      {chain.name}
                    </span>
                  </div>
                  <AddressInfoDropdown
                    address={account.address as Address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                  />
                  <AddressQRCodeModal
                    address={account.address as Address}
                    modalId="qrcode-modal"
                  />
                </>
              )
            })()}
          </>
        )
      }}
    </ConnectButton.Custom>
  )
}
