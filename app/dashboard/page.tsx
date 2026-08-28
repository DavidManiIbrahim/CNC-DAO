"use client"

import Link from "next/link"
import { BadgeIcon } from "@/components/Icons"
import { getBadges } from "@/lib/badges"
import { useSessionUser } from "@/lib/useAuth"
import { useMyTrees } from "@/lib/useTrees"

export default function DashboardOverviewPage() {
  const user = useSessionUser()
  const trees = useMyTrees(user?.walletAddress)

  if (!user) return null

  const badges = getBadges(user, trees)
  const earnedCount = badges.filter((b) => b.earned).length

  const stats = [
    { label: "Trees registered", value: trees.length },
    { label: "NFTs minted", value: trees.filter((t) => t.status === "minted").length },
    { label: "Campaigns joined", value: 0 },
    { label: "Badges earned", value: `${earnedCount}/${badges.length}` },
  ]

  const quickLinks = [
    { href: "/dashboard/campaigns", title: "Planting Campaigns", desc: "Join & coordinate planting drives", icon: "leaf" as const },
    { href: "/dashboard/profile", title: "Edit Profile", desc: "Photo, display name, bio", icon: "leaf" as const },
    { href: "/dashboard/badges", title: "View Badges", desc: "Your earned achievements", icon: "star" as const },
    { href: "/dashboard/nft", title: "NFT Gallery", desc: "Proof-of-stewardship NFTs", icon: "sparkles" as const },
    ...((user.role === "nature_hero" || user.role === "admin")
      ? [
          { href: "/dashboard/verification", title: "Tree Verification", desc: "Approve pending tree submissions", icon: "shield" as const },
          { href: "/dashboard/map", title: "Admin Map & Registry", desc: "Live geographical database registry", icon: "sparkles" as const },
        ]
      : []),
    ...(user.role === "admin"
      ? [{ href: "/dashboard/hero-verification", title: "Hero Verification", desc: "Review Nature Hero applications", icon: "crown" as const }]
      : []),
    ...(user.role === "admin"
      ? [{ href: "/dashboard/users", title: "User Management", desc: "Review & manage network users", icon: "users" as const }]
      : []),
  ]

  const recentTrees = trees.slice(-5).reverse()

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
          Welcome back{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Here&apos;s what&apos;s happening with your stewardship.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-[#08080f] p-4 text-center">
            <div className="font-[family-name:var(--font-space-mono)] text-xl font-bold">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">Quick actions</h2>
        <p className="mb-5 text-sm text-white/50">Jump into any part of your dashboard.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-[#08080f] p-4 transition-colors hover:border-[#1db954]/40 hover:bg-[#0c0c15]"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#1db954]/15 text-[#1db954]">
                <BadgeIcon name={q.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{q.title}</span>
                <span className="block text-xs text-white/40">{q.desc}</span>
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-white/30 transition-transform group-hover:translate-x-0.5"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">Recent trees</h2>
        <p className="mb-5 text-sm text-white/50">
          Your most recent registrations from this browser.
        </p>
        {recentTrees.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#08080f] p-6 text-center text-sm text-white/40">
            No trees registered yet.{" "}
            <Link href="/tree-reg" className="text-[#1db954] underline">
              Plant your first tree
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentTrees.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#08080f] p-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold">{t.name}</div>
                  <div className="text-xs text-white/50">
                    {t.species} — {t.location}
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    t.status === "minted"
                      ? "bg-[#a78bfa]/15 text-[#a78bfa]"
                      : t.status === "verified"
                        ? "bg-[#1db954]/15 text-[#1db954]"
                        : "bg-[#f0a830]/15 text-[#f0a830]"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
