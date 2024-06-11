"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CopyButton } from "../ui/copy-button"
import { Address as AddressType, getAddress, isAddress } from "viem"
import { hardhat } from "viem/chains"
import { normalize } from "viem/ens"
import { useEnsAvatar, useEnsName } from "wagmi"
import { BlockieAvatar } from "~~/components/xchange"
import { useTargetNetwork } from "~~/hooks/xchange-create/useTargetNetwork"
import { getBlockExplorerAddressLink } from "~~/utils/xchange"

type AddressProps = {
  address?: AddressType
  disableAddressLink?: boolean
  format?: "short" | "long"
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
}

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
}

/**
 * Displays an address (or ENS) with a Blockie image and option to copy address.
 */
export const Address = ({
  address,
  disableAddressLink,
  format,
  size = "base",
}: AddressProps) => {
  const [ens, setEns] = useState<string | null>()
  const [ensAvatar, setEnsAvatar] = useState<string | null>()

  const checkSumAddress = address ? getAddress(address) : undefined

  const { targetNetwork } = useTargetNetwork()

  const { data: fetchedEns } = useEnsName({
    address: checkSumAddress,
    chainId: 1,
    query: {
      enabled: isAddress(checkSumAddress ?? ""),
    },
  })
  const { data: fetchedEnsAvatar } = useEnsAvatar({
    name: fetchedEns ? normalize(fetchedEns) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(fetchedEns),
      gcTime: 30_000,
    },
  })

  // We need to apply this pattern to avoid Hydration errors.
  useEffect(() => {
    setEns(fetchedEns)
  }, [fetchedEns])

  useEffect(() => {
    setEnsAvatar(fetchedEnsAvatar)
  }, [fetchedEnsAvatar])

  // Skeleton UI
  if (!checkSumAddress) {
    return (
      <div className="flex animate-pulse space-x-4">
        <div className="h-6 w-6 rounded-md bg-slate-300"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 rounded bg-slate-300"></div>
        </div>
      </div>
    )
  }

  if (!isAddress(checkSumAddress)) {
    return <span className="text-error">Wrong address</span>
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(
    targetNetwork,
    checkSumAddress
  )
  let displayAddress =
    checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)

  if (ens) {
    displayAddress = ens
  } else if (format === "long") {
    displayAddress = checkSumAddress
  }

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <BlockieAvatar
          address={checkSumAddress}
          ensImage={ensAvatar}
          size={(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}
        />
      </div>
      {disableAddressLink ? (
        <span className={`ml-1.5 text-${size} font-normal`}>
          {displayAddress}
        </span>
      ) : targetNetwork.id === hardhat.id ? (
        <span className={`ml-1.5 text-${size} font-normal`}>
          <Link href={blockExplorerAddressLink}>{displayAddress}</Link>
        </span>
      ) : (
        <a
          className={`ml-1.5 text-${size} font-normal`}
          target="_blank"
          href={blockExplorerAddressLink}
          rel="noopener noreferrer"
        >
          {displayAddress}
        </a>
      )}
      <CopyButton
        buttonPositionClass={"ring-0 py-1 ml-1 px-2"}
        title=""
        justIcon={true}
        size={4}
        content={checkSumAddress}
      />
    </div>
  )
}
