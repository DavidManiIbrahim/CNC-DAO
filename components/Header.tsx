"use client"

import Link from "next/link"
import { MobileNav } from "@/components/MobileNav"
import { WalletButton } from "@/components/WalletButton"
import { ThemeToggle } from "@/components/ThemeToggle"

const links = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/map", label: "Global Map" },
  { href: "/tree-reg", label: "Verification" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/#nft", label: "NFT" },
  { href: "/nature-heroes", label: "Nature Heroes" },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-nav-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:px-16">
        <Link href="/#hero" className="flex items-center gap-2">
          <img
            src="/favicon.png"
            alt="CNC DAO"
            className="h-6 w-6 object-cover"
          />
          <span className="text-lg font-medium tracking-[-0.02em] text-foreground">CNCDAO</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <WalletButton />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
