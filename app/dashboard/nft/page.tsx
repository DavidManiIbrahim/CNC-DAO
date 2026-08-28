"use client"

import Link from "next/link"
import { useSessionUser } from "@/lib/useAuth"
import { useMyTrees, useAllTrees } from "@/lib/useTrees"
import { Sparkles, CheckCircle2, ShieldCheck, MapPin } from "lucide-react"

export default function DashboardNFTPage() {
  const user = useSessionUser()
  const myTrees = useMyTrees(user?.walletAddress)
  const allTrees = useAllTrees()

  if (!user) return null

  const myNFTs = myTrees.filter((t) => t.status === "minted" || t.status === "verified")
  const globalNFTs = allTrees.filter((t) => t.status === "minted" || t.status === "verified")

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>On-Chain Impact Registry</span>
          </div>
          <h1 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
            NFT Gallery & Proof of Stewardship
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every verified tree on CNC DAO is minted as an immutable Solana NFT.
          </p>
        </div>
        <Link
          href="/tree-reg"
          className="inline-flex items-center gap-2 rounded-full bg-[#1db954] px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105"
        >
          Plant & Mint New NFT
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-[#1db954]">
            {myTrees.filter((t) => t.status === "minted").length}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">My Minted NFTs</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-[#f0a830]">
            {myTrees.filter((t) => t.status === "verified").length}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Ready to Mint</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-[#a78bfa]">
            {globalNFTs.length}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Global On-Chain NFTs</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-foreground">
            Solana
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Network</div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
          Your Impact Certificates
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Proof-of-stewardship badges minted for your registered trees.
        </p>

        {myNFTs.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <div className="mb-3 flex justify-center text-[#1db954]">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <p className="text-sm font-bold text-foreground">No NFTs minted yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Once your registered trees pass 2-of-2 Nature Hero verification, your proof-of-stewardship NFT can be minted directly to your wallet.
            </p>
            <Link
              href="/tree-reg"
              className="mt-5 inline-block rounded-full bg-[#1db954] px-5 py-2 text-xs font-bold text-black hover:bg-[#1db954]/90"
            >
              Register a tree now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myNFTs.map((tree) => {
              const solanaMintHash = `CNC${tree.id.slice(-8).toUpperCase()}sol`
              return (
                <div
                  key={tree.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/50 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-wider text-[#1db954] font-bold">
                        Solana SPL Token
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          tree.status === "minted"
                            ? "bg-[#a78bfa]/15 text-[#a78bfa]"
                            : "bg-[#1db954]/15 text-[#1db954]"
                        }`}
                      >
                        {tree.status === "minted" ? "Minted" : "Verified"}
                      </span>
                    </div>

                    <div className="my-5 flex h-32 w-full items-center justify-center rounded-2xl bg-muted/60 border border-border">
                      <div className="text-center p-4">
                        <div className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                          {tree.species}
                        </div>
                        <div className="text-xs text-muted-foreground">{tree.name}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Location</span>
                        <span className="font-semibold text-foreground">{tree.location}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>GPS Coordinates</span>
                        <span className="font-mono text-foreground">
                          {tree.lat.toFixed(3)}, {tree.lng.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Mint Hash</span>
                        <span className="font-mono text-[11px] text-[#1db954] font-bold">
                          {solanaMintHash}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-border pt-4">
                    <Link
                      href={`/dashboard/map?tree=${tree.id}`}
                      className="block text-center text-xs font-bold text-[#1db954] hover:underline"
                    >
                      View on Global Registry Map &rarr;
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
          Global Verified NFT Stream
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Recent proof-of-stewardship NFTs minted by planters across the network.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {globalNFTs.slice(0, 6).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[#1db954]/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1db954]/15 text-[#1db954]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.species} &bull; {t.location}</div>
                </div>
              </div>
              <span className="rounded-full bg-[#1db954]/15 px-3 py-1 text-[10px] font-bold uppercase text-[#1db954]">
                NFT Verified
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
