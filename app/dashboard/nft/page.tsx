"use client"

import { useState } from "react"
import Link from "next/link"
import { useSessionUser } from "@/lib/useAuth"
import { useMyTrees, useAllTrees } from "@/lib/useTrees"
import { getTreeImage } from "@/lib/treePhotos"
import { Sparkles, CheckCircle2, ShieldCheck, MapPin, Layers, Globe, ExternalLink } from "lucide-react"

export default function DashboardNFTPage() {
  const user = useSessionUser()
  const myTrees = useMyTrees(user?.walletAddress)
  const allTrees = useAllTrees()
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all")

  if (!user) return null

  const myNFTs = myTrees.filter((t) => t.status === "minted" || t.status === "verified")
  const globalNFTs = allTrees.filter((t) => t.status === "minted" || t.status === "verified")
  const myMintedCount = myTrees.filter((t) => t.status === "minted").length
  const myVerifiedCount = myTrees.filter((t) => t.status === "verified").length
  const globalMintedCount = allTrees.filter((t) => t.status === "minted").length

  const displayNFTs = activeTab === "mine" ? myNFTs : globalNFTs

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
            Every verified tree on CNC DAO is minted as an immutable Solana NFT certificate.
          </p>
        </div>
        <Link
          href="/tree-reg"
          className="inline-flex items-center gap-2 rounded-full bg-[#1db954] px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105"
        >
          Plant & Mint New NFT
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          onClick={() => setActiveTab("mine")}
          className={`cursor-pointer rounded-2xl border p-5 text-center transition-all ${
            activeTab === "mine"
              ? "border-[#1db954] bg-[#1db954]/10"
              : "border-border bg-card hover:border-[#1db954]/40"
          }`}
        >
          <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-[#1db954]">
            {myMintedCount}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">My Minted NFTs</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-[#f0a830]">
            {myVerifiedCount}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Ready to Mint</div>
        </div>

        <div
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer rounded-2xl border p-5 text-center transition-all ${
            activeTab === "all"
              ? "border-[#a78bfa] bg-[#a78bfa]/10"
              : "border-border bg-card hover:border-[#a78bfa]/40"
          }`}
        >
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

      {/* Certificates Section */}
      <div className="mb-10">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
              {activeTab === "mine" ? "Your Impact Certificates" : "All On-Chain Impact Certificates"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Proof-of-stewardship badges minted for verified trees on Solana.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "all"
                  ? "bg-[#a78bfa] text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>All NFTs ({globalNFTs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("mine")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "mine"
                  ? "bg-[#1db954] text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>My NFTs ({myNFTs.length})</span>
            </button>
          </div>
        </div>

        {displayNFTs.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <div className="mb-3 flex justify-center text-[#1db954]">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <p className="text-sm font-bold text-foreground">No NFTs found in this view</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {activeTab === "mine"
                ? "Once your registered trees pass Nature Hero verification, your proof-of-stewardship NFT will be minted directly to your wallet."
                : "No on-chain trees have been registered yet."}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {activeTab === "mine" && globalNFTs.length > 0 && (
                <button
                  onClick={() => setActiveTab("all")}
                  className="rounded-full border border-border bg-muted px-5 py-2 text-xs font-semibold text-foreground hover:bg-muted/80"
                >
                  View All Network NFTs ({globalNFTs.length})
                </button>
              )}
              <Link
                href="/tree-reg"
                className="rounded-full bg-[#1db954] px-5 py-2 text-xs font-bold text-black hover:bg-[#1db954]/90"
              >
                Register a tree now
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayNFTs.map((tree) => {
              const solanaMintHash = `CNC${tree.id.slice(-8).toUpperCase()}sol`
              const treeImg = getTreeImage(tree.imageUrl, tree.species)
              return (
                <div
                  key={tree.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/50 hover:shadow-lg"
                >
                  <div className="relative h-48 w-full overflow-hidden border-b border-border bg-muted">
                    <img
                      src={treeImg}
                      alt={tree.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-black/70 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1db954] backdrop-blur-md">
                        Solana SPL
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${
                          tree.status === "minted"
                            ? "bg-[#a78bfa]/80 text-white"
                            : "bg-[#1db954]/80 text-black font-bold"
                        }`}
                      >
                        {tree.status === "minted" ? "Minted" : "Verified"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3">
                      <div className="font-[family-name:var(--font-syne)] text-base font-bold text-foreground">
                        {tree.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{tree.species}</div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Location</span>
                        <span className="font-semibold text-foreground">{tree.location}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>GPS Coordinates</span>
                        <span className="font-mono text-foreground">
                          {typeof tree.lat === "number" ? tree.lat.toFixed(3) : "—"},{" "}
                          {typeof tree.lng === "number" ? tree.lng.toFixed(3) : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Solana Token</span>
                        <span className="font-mono text-[11px] text-[#1db954] font-bold">
                          {solanaMintHash}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border p-4 bg-muted/20 flex items-center justify-between">
                    <Link
                      href={`/dashboard/map?tree=${tree.id}`}
                      className="text-xs font-bold text-[#1db954] hover:underline"
                    >
                      View on Global Registry Map &rarr;
                    </Link>
                    {typeof tree.lat === "number" && typeof tree.lng === "number" && (
                      <a
                        href={`https://www.google.com/maps?q=${tree.lat},${tree.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-[#1db954]"
                        title="Open Satellite View"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Global Stream */}
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
                <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-border bg-muted">
                  <img
                    src={getTreeImage(t.imageUrl, t.species)}
                    alt={t.name}
                    className="h-full w-full object-cover"
                  />
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
