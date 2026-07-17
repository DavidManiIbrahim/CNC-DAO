import { Syne, Space_Grotesk, Space_Mono, DM_Sans } from "next/font/google"
import "./globals.css"
import ConvexClientProvider from "@/components/ConvexClientProvider"

// DM Sans is the real primary heading font on the source site (hero H1, all
// section H2s, feature card titles). Syne is reserved for a handful of large
// display headlines inside specific dark sections (Process, Global Registry, NFT).
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["600", "700", "800"] })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["400", "500", "700"] })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })
const spaceMono = Space_Mono({ subsets: ["latin"], variable: "--font-space-mono", weight: ["700"] })

export const metadata = {
  title: "CNC DAO",
  description:
    "CNC DAO connects real environmental action with blockchain proof. Submit a tree, earn verification from Nature Heroes, and mint your stewardship on Solana.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
