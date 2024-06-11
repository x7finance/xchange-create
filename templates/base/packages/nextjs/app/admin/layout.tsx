import React from "react"
import { Footer } from "~~/components/Footer"
import { Header } from "~~/components/Header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col font-mono">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}
