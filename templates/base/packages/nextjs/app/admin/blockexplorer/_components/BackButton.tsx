"use client"

import { useRouter } from "next/navigation"
import { Button } from "~~/components/ui/button"

export const BackButton = () => {
  const router = useRouter()
  return (
    <Button variant="outline" onClick={() => router.back()}>
      Back
    </Button>
  )
}
