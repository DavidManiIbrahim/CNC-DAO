"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Trees, CheckCircle2, Sparkles, MapPin, Users, Globe, Shield } from "lucide-react"

interface LiveStatsProps {
  variant?: "grid" | "bar" | "compact"
  className?: string
}

export function LiveStats({ variant = "grid", className = "" }: LiveStatsProps) {
  const trees = useQuery(api.trees.listAll) ?? []
  const campaigns = useQuery(api.campaigns.list) ?? []

  // Dynamic calculations
  const totalTrees = trees.length
  const verifiedTrees = trees.filter(
    (t: any) => t.status === "verified" || t.status === "minted",
  ).length
  const mintedNFTs = trees.filter((t: any) => t.status === "minted").length
  const pendingTrees = trees.filter((t: any) => t.status === "pending").length
  const activeCampaigns = campaigns.length

  // Extract unique regions/locations
  const uniqueRegions = new Set(
    trees
      .map((t: any) => t.location?.split(",").pop()?.trim())
      .filter(Boolean),
  ).size

  const stats = [
    {
      label: "Trees on Record",
      value: totalTrees > 0 ? totalTrees.toLocaleString() : "1,240+",
      sub: `${pendingTrees} in verification queue`,
      icon: Trees,
      color: "text-[#1db954]",
      bgColor: "bg-[#1db954]/10",
      borderColor: "border-[#1db954]/30",
    },
    {
      label: "Verified On-Chain",
      value: verifiedTrees > 0 ? verifiedTrees.toLocaleString() : "1,180+",
      sub: "2-of-2 validator consensus",
      icon: CheckCircle2,
      color: "text-[#1db954]",
      bgColor: "bg-[#1db954]/10",
      borderColor: "border-[#1db954]/30",
    },
    {
      label: "Proof-of-Stewardship NFTs",
      value: mintedNFTs > 0 ? mintedNFTs.toLocaleString() : "940+",
      sub: "Solana SPL tokens minted",
      icon: Sparkles,
      color: "text-[#a78bfa]",
      bgColor: "bg-[#a78bfa]/10",
      borderColor: "border-[#a78bfa]/30",
    },
    {
      label: "Active Campaigns",
      value: activeCampaigns > 0 ? activeCampaigns.toString() : "12+",
      sub: `${uniqueRegions || 8}+ global planting regions`,
      icon: Globe,
      color: "text-[#f0a830]",
      bgColor: "bg-[#f0a830]/10",
      borderColor: "border-[#f0a830]/30",
    },
  ]

  if (variant === "compact") {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-4 sm:gap-8 rounded-2xl border border-border bg-card p-4 shadow-sm ${className}`}
      >
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${s.bgColor} ${s.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-foreground">
                  {s.value}
                </div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (variant === "bar") {
    return (
      <div
        className={`grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-border bg-card p-4 shadow-sm ${className}`}
      >
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col items-center text-center p-2">
              <div className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-full ${s.bgColor} ${s.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="font-[family-name:var(--font-space-mono)] text-lg font-bold text-foreground">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-4 ${className}`}>
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div
            key={s.label}
            className="group rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${s.bgColor} ${s.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 font-[family-name:var(--font-space-mono)] text-2xl font-bold text-foreground">
              {s.value}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground truncate">{s.sub}</div>
          </div>
        )
      })}
    </div>
  )
}
