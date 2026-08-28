"use client"

import Link from "next/link"
import { useSessionUser } from "@/lib/useAuth"
import { useMyTrees, useAllTrees } from "@/lib/useTrees"

export default function DashboardNFTPage() {
  const user = useSessionUser()
  const myTrees = useMyTrees(user?.walletAddress)
  const allTrees = useAllTrees()

  if (!user) return null

  const myNFTs = myTrees.filter((t) => t.status === "minted" || t.status === "verified")
  const globalNFTs = allTrees.filter((t) => t.status === "minted" || t.status === "verified")

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
            NFT Gallery & Proof of Stewardship
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Every verified tree on CNC DAO is minted as an immutable Solana NFT.
          </p>
        </div>
        <Link
          href="/tree-reg"
          className="inline-flex items-center gap-2 rounded-full bg-[#1db954] px-5 py-2.5 text-xs font-semibold text-black transition-transform hover:scale-105"
        >
          Plant & Mint New NFT
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#08080f] p-4 text-center">
          <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-[#1db954]">
            {myTrees.filter((t) => t.status === "minted").length}
          </div>
          <div className="mt-1 text-xs text-white/40">My Minted NFTs</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#08080f] p-4 text-center">
          <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-[#f0a830]">
            {myTrees.filter((t) => t.status === "verified").length}
          </div>
          <div className="mt-1 text-xs text-white/40">Ready to Mint</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#08080f] p-4 text-center">
          <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-[#a78bfa]">
            {globalNFTs.length}
          </div>
          <div className="mt-1 text-xs text-white/40">Global On-Chain NFTs</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#08080f] p-4 text-center">
          <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-white">
            Solana
          </div>
          <div className="mt-1 text-xs text-white/40">Network</div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">
          Your Impact Certificates
        </h2>
        <p className="mb-5 text-sm text-white/50">
          Proof-of-stewardship badges minted for your registered trees.
        </p>

        {myNFTs.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#08080f] p-8 text-center">
            <div className="mb-3 flex justify-center text-[#1db954]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white/70">No NFTs minted yet</p>
            <p className="mt-1 text-xs text-white/40 max-w-sm mx-auto">
              Once your registered trees pass 2-of-2 Nature Hero verification, your proof-of-stewardship NFT can be minted directly to your wallet.
            </p>
            <Link
              href="/tree-reg"
              className="mt-4 inline-block rounded-full border border-white/15 px-4 py-2 text-xs text-white/80 hover:bg-white/5"
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
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#08080f] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/50 hover:shadow-lg hover:shadow-[#1db954]/10"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-wider text-[#1db954]">
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

                    <div className="my-4 flex h-32 w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#1db954]/20 via-[#0b0a12] to-[#a78bfa]/20 border border-white/5">
                      <div className="text-center">
                        <div className="font-[family-name:var(--font-syne)] text-lg font-bold text-white">
                          {tree.species}
                        </div>
                        <div className="text-xs text-white/60">{tree.name}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-white/60">
                        <span>Location</span>
                        <span className="font-medium text-white">{tree.location}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>GPS Coordinates</span>
                        <span className="font-mono text-white/80">
                          {tree.lat.toFixed(3)}, {tree.lng.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Mint Hash</span>
                        <span className="font-mono text-[11px] text-[#1db954]">
                          {solanaMintHash}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-white/5 pt-3">
                    <Link
                      href={`/map?tree=${tree.id}`}
                      className="block text-center text-xs font-semibold text-[#1db954] hover:underline"
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
        <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">
          Global Verified NFT Stream
        </h2>
        <p className="mb-5 text-sm text-white/50">
          Recent proof-of-stewardship NFTs minted by planters across the network.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {globalNFTs.slice(0, 6).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#08080f] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1db954]/15 text-[#1db954]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs text-white/50">{t.species} &bull; {t.location}</div>
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
