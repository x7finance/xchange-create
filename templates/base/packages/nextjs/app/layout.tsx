import "@rainbow-me/rainbowkit/styles.css"
import { Metadata } from "next"
import { AppWithProviders } from "~~/components/AppWithProviders"
import { ThemeProvider } from "~~/components/ThemeProvider"
import React from "react"
import "~~/styles/globals.css"

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT || 3000}`
const imageUrl = `${baseUrl}/thumbnail.png`

const title = "Create Xchange App"
const titleTemplate = "%s | Create Xchange App"
const description = "Built with Create Xchange"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: title,
    template: titleTemplate,
  },
  description,
  openGraph: {
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
    images: [
      {
        url: imageUrl,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [imageUrl],
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
  },
}

const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <AppWithProviders>{children}</AppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default App
