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
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1db954]/30 bg-[#1db954]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1db954]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Proof of Stewardship System</span>
          </div>
          <h1 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
            Tree Verification & Validation Queue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isVerifier
              ? "Review, approve pending tree registrations, and authorize on-chain proof-of-stewardship NFTs."
              : "Track the verification and on-chain minting progress of your tree registrations."}
          </p>
        </div>

        {isVerifier && (
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
              Queue Status:{" "}
              <span className="font-mono text-[#f0a830] font-bold">
                {pendingCount} pending
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeTab === "all"
              ? "border-[#1db954] bg-[#1db954]/10"
              : "border-border bg-card hover:border-[#1db954]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-foreground">
              {sourceTrees.length}
            </span>
            <ShieldCheck className="h-4 w-4 text-[#1db954]" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Total Records</div>
        </div>

        <div
          onClick={() => setActiveTab("pending")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeTab === "pending"
              ? "border-[#f0a830] bg-[#f0a830]/10"
              : "border-border bg-card hover:border-[#f0a830]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#f0a830]">
              {pendingCount}
            </span>
            <Clock className="h-4 w-4 text-[#f0a830]" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">In Queue (Pending)</div>
        </div>

        <div
          onClick={() => setActiveTab("verified")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeTab === "verified"
              ? "border-[#1db954] bg-[#1db954]/10"
              : "border-border bg-card hover:border-[#1db954]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1db954]">
              {verifiedCount}
            </span>
            <CheckCircle className="h-4 w-4 text-[#1db954]" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Verified</div>
        </div>

        <div
          onClick={() => setActiveTab("minted")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeTab === "minted"
              ? "border-[#a78bfa] bg-[#a78bfa]/10"
              : "border-border bg-card hover:border-[#a78bfa]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#a78bfa]">
              {mintedCount}
            </span>
            <Sparkles className="h-4 w-4 text-[#a78bfa]" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">NFT Minted</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-[#1db954] text-black"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({sourceTrees.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "pending"
                ? "bg-[#f0a830] text-black"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Queue</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "verified"
                ? "bg-[#1db954] text-black"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setActiveTab("minted")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "minted"
                ? "bg-[#a78bfa] text-black"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Minted ({mintedCount})
          </button>
          {isVerifier && (
            <button
              onClick={() => setActiveTab("mine")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "mine"
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              My Submissions ({mineCount})
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tree, species, city..."
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-[#1db954]/60"
          />
        </div>
      </div>

      {/* Unified Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Adjusted Polished Table Header */}
        <div className="hidden grid-cols-[1.5fr_1.3fr_1fr_1fr_auto] items-center gap-4 border-b border-border bg-muted/70 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
          <span>Tree & Species</span>
          <span>Location & Coordinates</span>
          <span>Submitter</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {filteredTrees.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
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
                  className="grid grid-cols-1 gap-3 p-5 transition-colors hover:bg-card-hover md:grid-cols-[1.5fr_1.3fr_1fr_1fr_auto] md:items-center md:gap-4"
                >
                  {/* Tree & Species */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-foreground">{t.name}</span>
                      {isOwner && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                          Mine
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{t.species}</div>
                  </div>

                  {/* Location */}
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-foreground">{t.location}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {typeof t.lat === "number" ? t.lat.toFixed(4) : "—"},{" "}
                      {typeof t.lng === "number" ? t.lng.toFixed(4) : "—"}
                    </div>
                  </div>

                  {/* Submitter */}
                  <div className="min-w-0">
                    <div className="truncate font-mono text-xs text-muted-foreground" title={t.walletAddress}>
                      {shortWallet}
                    </div>
                    {t.createdAt && (
                      <div className="text-[10px] text-muted-foreground">
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
                            className="flex items-center gap-1.5 rounded-xl bg-[#1db954] px-3.5 py-1.5 text-xs font-bold text-black transition-all hover:bg-[#1db954]/90 hover:scale-105 disabled:opacity-50"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>{isLoading ? "Verifying..." : "Approve"}</span>
                          </button>
                        )}

                        {t.status === "verified" && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusChange(t._id, "minted")}
                            className="flex items-center gap-1.5 rounded-xl bg-[#a78bfa]/20 px-3.5 py-1.5 text-xs font-semibold text-[#a78bfa] transition-colors hover:bg-[#a78bfa]/30 disabled:opacity-50"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{isLoading ? "Minting..." : "Mint NFT"}</span>
                          </button>
                        )}

                        {t.status === "minted" && (
                          <span className="flex items-center gap-1 text-xs font-medium text-[#a78bfa]">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Minted</span>
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
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
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Verification certifies on-chain proof of tree stewardship by authorized Nature Heroes.
      </p>
    </div>
  )
}
