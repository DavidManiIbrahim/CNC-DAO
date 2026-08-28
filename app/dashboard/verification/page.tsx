"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSessionUser } from "@/lib/useAuth"
import { CheckCircle, Clock, Sparkles, Search, ShieldCheck } from "lucide-react"

type FilterTab = "all" | "pending" | "verified" | "minted" | "mine"

export default function TreeVerificationPage() {
  const user = useSessionUser()
  const verifierId = user?.userId
  const isVerifier = user?.role === "nature_hero" || user?.role === "admin"

  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Load all trees if verifier/admin, else load user's trees
  const allTrees = useQuery(api.trees.listAll) ?? []
  const myTrees =
    useQuery(
      api.trees.listMine,
      user?.walletAddress ? { walletAddress: user.walletAddress } : "skip",
    ) ?? []

  const updateTreeStatus = useMutation(api.trees.updateStatus)

  // Use allTrees for verifiers or myTrees for regular users
  const sourceTrees = isVerifier ? allTrees : myTrees

  // Filtered list based on active tab and search query
  const filteredTrees = useMemo(() => {
    return sourceTrees.filter((t: any) => {
      // Tab filter
      if (activeTab === "pending" && t.status !== "pending") return false
      if (activeTab === "verified" && t.status !== "verified" && t.status !== "minted") return false
      if (activeTab === "minted" && t.status !== "minted") return false
      if (activeTab === "mine" && t.walletAddress !== user?.walletAddress) return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = t.name?.toLowerCase().includes(q)
        const matchSpecies = t.species?.toLowerCase().includes(q)
        const matchLocation = t.location?.toLowerCase().includes(q)
        const matchWallet = t.walletAddress?.toLowerCase().includes(q)
        return matchName || matchSpecies || matchLocation || matchWallet
      }

      return true
    })
  }, [sourceTrees, activeTab, searchQuery, user?.walletAddress])

  // Count stats
  const pendingCount = sourceTrees.filter((t: any) => t.status === "pending").length
  const verifiedCount = sourceTrees.filter((t: any) => t.status === "verified" || t.status === "minted").length
  const mintedCount = sourceTrees.filter((t: any) => t.status === "minted").length
  const mineCount = sourceTrees.filter((t: any) => t.walletAddress === user?.walletAddress).length

  async function handleStatusChange(treeId: string, status: "pending" | "verified" | "minted") {
    if (!verifierId) return
    setActionLoadingId(treeId)
    try {
      await updateTreeStatus({
        verifierId: verifierId as any,
        treeId: treeId as any,
        status,
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
            Tree Verification & Queue
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {isVerifier
              ? "Review, verify, and manage tree registration submissions in one unified queue."
              : "Track the verification and minting progress of your registered trees."}
          </p>
        </div>

        {isVerifier && (
          <div className="flex items-center gap-2 self-start rounded-full border border-[#1db954]/30 bg-[#1db954]/10 px-3 py-1.5 text-xs font-semibold text-[#1db954]">
            <ShieldCheck className="h-4 w-4" />
            <span>Verifier Access Active</span>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeTab === "all"
              ? "border-[#1db954]/50 bg-[#1db954]/10"
              : "border-white/10 bg-[#08080f] hover:border-white/20"
          }`}
        >
          <div className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-white">
            {sourceTrees.length}
          </div>
          <div className="mt-1 text-xs text-white/50">Total Submissions</div>
        </div>

        <div
          onClick={() => setActiveTab("pending")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeTab === "pending"
              ? "border-[#f0a830]/50 bg-[#f0a830]/10"
              : "border-white/10 bg-[#08080f] hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#f0a830]">
              {pendingCount}
            </span>
            <Clock className="h-4 w-4 text-[#f0a830]/70" />
          </div>
          <div className="mt-1 text-xs text-white/50">In Queue (Pending)</div>
        </div>

        <div
          onClick={() => setActiveTab("verified")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeTab === "verified"
              ? "border-[#1db954]/50 bg-[#1db954]/10"
              : "border-white/10 bg-[#08080f] hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1db954]">
              {verifiedCount}
            </span>
            <CheckCircle className="h-4 w-4 text-[#1db954]/70" />
          </div>
          <div className="mt-1 text-xs text-white/50">Verified</div>
        </div>

        <div
          onClick={() => setActiveTab("minted")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeTab === "minted"
              ? "border-[#a78bfa]/50 bg-[#a78bfa]/10"
              : "border-white/10 bg-[#08080f] hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#a78bfa]">
              {mintedCount}
            </span>
            <Sparkles className="h-4 w-4 text-[#a78bfa]/70" />
          </div>
          <div className="mt-1 text-xs text-white/50">NFT Minted</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#08080f] p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-white/15 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            All ({sourceTrees.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "pending"
                ? "bg-[#f0a830]/20 text-[#f0a830]"
                : "text-white/50 hover:text-white"
            }`}
          >
            <span>Queue</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-[#f0a830] px-1.5 py-0.2 text-[10px] font-bold text-black">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "verified"
                ? "bg-[#1db954]/20 text-[#1db954]"
                : "text-white/50 hover:text-white"
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setActiveTab("minted")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "minted"
                ? "bg-[#a78bfa]/20 text-[#a78bfa]"
                : "text-white/50 hover:text-white"
            }`}
          >
            Minted ({mintedCount})
          </button>
          {isVerifier && (
            <button
              onClick={() => setActiveTab("mine")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "mine"
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              My Submissions ({mineCount})
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tree, species, city..."
            className="w-full rounded-xl border border-white/10 bg-[#08080f] py-2 pl-9 pr-3 text-xs text-white placeholder-white/30 outline-none transition-colors focus:border-[#1db954]/40"
          />
        </div>
      </div>

      {/* Unified Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#08080f]">
        <div className="hidden grid-cols-[1.5fr_1.3fr_1fr_1fr_auto] gap-4 border-b border-white/10 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white/30 md:grid">
          <span>Tree & Species</span>
          <span>Location</span>
          <span>Submitter</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="flex flex-col divide-y divide-white/5">
          {filteredTrees.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-white/40">
              {searchQuery
                ? "No tree records matched your search query."
                : activeTab === "pending"
                  ? "No trees currently waiting in the validation queue."
                  : "No tree records found."}
            </div>
          ) : (
            filteredTrees.map((t: any) => {
              const isLoading = actionLoadingId === t._id
              const isOwner = t.walletAddress === user?.walletAddress
              const shortWallet = t.walletAddress
                ? t.walletAddress.startsWith("email:")
                  ? t.walletAddress.replace("email:", "")
                  : `${t.walletAddress.slice(0, 6)}...${t.walletAddress.slice(-4)}`
                : "Unknown"

              return (
                <div
                  key={t._id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-white/[0.02] md:grid-cols-[1.5fr_1.3fr_1fr_1fr_auto] md:items-center md:gap-4"
                >
                  {/* Tree & Species */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-white">{t.name}</span>
                      {isOwner && (
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/70">
                          Mine
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-white/50">{t.species}</div>
                  </div>

                  {/* Location */}
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-white/80">{t.location}</div>
                    <div className="text-[10px] text-white/40">
                      {typeof t.lat === "number" ? t.lat.toFixed(4) : "—"},{" "}
                      {typeof t.lng === "number" ? t.lng.toFixed(4) : "—"}
                    </div>
                  </div>

                  {/* Submitter */}
                  <div className="min-w-0">
                    <div className="truncate font-mono text-xs text-white/60" title={t.walletAddress}>
                      {shortWallet}
                    </div>
                    {t.createdAt && (
                      <div className="text-[10px] text-white/30">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        t.status === "verified"
                          ? "bg-[#1db954]/15 text-[#1db954]"
                          : t.status === "minted"
                            ? "bg-[#a78bfa]/15 text-[#a78bfa]"
                            : "bg-[#f0a830]/15 text-[#f0a830]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          t.status === "verified"
                            ? "bg-[#1db954]"
                            : t.status === "minted"
                              ? "bg-[#a78bfa]"
                              : "bg-[#f0a830]"
                        }`}
                      />
                      {t.status === "pending" ? "In Queue" : t.status}
                    </span>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {isVerifier ? (
                      <>
                        {t.status === "pending" && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusChange(t._id, "verified")}
                            className="flex items-center gap-1.5 rounded-full bg-[#1db954] px-3.5 py-1.5 text-xs font-bold text-black transition-all hover:bg-[#1db954]/90 hover:scale-105 disabled:opacity-50"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {isLoading ? "Verifying..." : "Approve"}
                          </button>
                        )}

                        {t.status === "verified" && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusChange(t._id, "minted")}
                            className="flex items-center gap-1.5 rounded-full bg-[#a78bfa]/20 px-3 py-1.5 text-xs font-semibold text-[#a78bfa] transition-colors hover:bg-[#a78bfa]/30 disabled:opacity-50"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            {isLoading ? "Minting..." : "Mint NFT"}
                          </button>
                        )}

                        {t.status === "minted" && (
                          <span className="flex items-center gap-1 text-xs font-medium text-[#a78bfa]">
                            <Sparkles className="h-3.5 w-3.5" />
                            Minted
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-white/40">
                        {t.status === "pending"
                          ? "Awaiting Nature Hero review"
                          : t.status === "verified"
                            ? "Ready for minting"
                            : "NFT Issued"}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      <p className="mt-4 text-center text-xs text-white/30">
        Verification certifies on-chain proof of tree stewardship by authorized Nature Heroes.
      </p>
    </div>
  )
}
