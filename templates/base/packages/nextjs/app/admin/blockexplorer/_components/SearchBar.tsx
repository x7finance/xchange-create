"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { isAddress, isHex } from "viem"
import { hardhat } from "viem/chains"
import { usePublicClient } from "wagmi"
import { Button } from "~~/components/ui/button"

export const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("")
  const router = useRouter()

  const client = usePublicClient({ chainId: hardhat.id })

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isHex(searchInput)) {
      try {
        const tx = await client?.getTransaction({ hash: searchInput })
        if (tx) {
          router.push(`/admin/blockexplorer/transaction/${searchInput}`)
          return
        }
      } catch (error) {
        console.error("Failed to fetch transaction:", error)
      }
    }

    if (isAddress(searchInput)) {
      router.push(`/admin/blockexplorer/address/${searchInput}`)
      return
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mx-5 mb-5 flex items-center justify-end space-x-3"
    >
      <input
        className="border-primary text-base-content focus:ring-accent mr-2 w-full rounded-md bg-zinc-100 p-2 shadow-md focus:outline-none focus:ring-2 md:w-1/2 lg:w-1/3"
        type="text"
        value={searchInput}
        placeholder="Search by hash or address"
        onChange={e => setSearchInput(e.target.value)}
      />
      <Button variant="outline" type="submit">
        Search
      </Button>
    </form>
  )
}
