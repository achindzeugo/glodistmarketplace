import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PageTransition } from "@/components/page-transition"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

export const metadata: Metadata = {
  title: "Glodist Marketplace | Centrale d'achat Cameroun",
  description: "Mise en relation vendeurs et acheteurs fiable, rapide et intelligente au Cameroun.",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.variable}>
      <body className="font-sans antialiased">
        <PageTransition>{children}</PageTransition>
        <Analytics />
      </body>
    </html>
  )
}
