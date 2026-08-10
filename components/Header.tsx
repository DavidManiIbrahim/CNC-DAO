"use client"

import Link from "next/link"
import { MobileNav } from "@/components/MobileNav"
import { WalletButton } from "@/components/WalletButton"
import { useIsAuthenticated } from "@/lib/useAuth"

const links = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/map", label: "Global Map" },
  { href: "/tree-reg", label: "Verification" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/#nft", label: "NFT" },
  { href: "/nature-heroes", label: "Nature Heroes" },
]

export function Header() {
  const authenticated = useIsAuthenticated()
  if (authenticated) return null

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030303]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:px-16">
        <Link href="/#hero" className="flex items-center gap-2">
          <img
            src="https://framerusercontent.com/images/XkdqyILHzud8shJDghKw5DhZuw.png"
            alt="CNC DAO"
            className="h-6 w-6 object-cover"
          />
          <span className="text-lg font-medium tracking-[-0.02em]">CNCDAO</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <WalletButton />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
