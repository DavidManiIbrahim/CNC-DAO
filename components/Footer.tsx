"use client"

import Link from "next/link"
import { SocialIcon } from "@/components/Icons"

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16 md:px-16">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 md:grid-cols-3">
        <div className="max-w-xs">
          <div className="mb-4 flex items-center gap-2">
            <img
              src="/favicon.png"
              alt="CNC DAO"
              className="h-5 w-5 object-cover"
            />
            <span className="text-lg font-medium tracking-[-0.02em]">CNCDAO</span>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">Every tree, verified and on record.</p>
          <div className="flex gap-2">
            {(["linkedin", "x", "instagram", "facebook", "youtube"] as const).map((s) => (
              <a
                key={s}
                aria-label={s}
                href={`https://${s === "x" ? "x" : s}.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <SocialIcon name={s} className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            © Copyright {new Date().getFullYear()} CNCDAO. All rights reserved.
          </p>
        </div>

        <p className="justify-self-center bg-gradient-to-b from-[#a1e3b8] via-white to-[#1db954] bg-clip-text text-center font-[family-name:var(--font-syne)] text-5xl font-extrabold tracking-tight text-transparent md:text-6xl">
          CNCDAO
        </p>

        <div className="flex justify-between gap-16 md:justify-self-end">
          <div>
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Navigation</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/#how-it-works">How It Works</Link></li>
              <li><Link href="/map">Global Map</Link></li>
              <li><Link href="/tree-reg">Verification</Link></li>
              <li><Link href="/campaigns">Campaigns</Link></li>
              <li><Link href="/#nft">NFT</Link></li>
              <li><Link href="/nature-heroes">Nature Heroes</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Information</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/#faq">FAQ</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/tree-reg">Plant a Tree</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
