"use client"

import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { BadgeIcon } from "@/components/Icons"
import { getBadges } from "@/lib/badges"
import { useSessionUser } from "@/lib/useAuth"
import { useMyTrees, useAllTrees } from "@/lib/useTrees"
import {
  Users,
  Shield,
  Crown,
  Trees,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Flame,
} from "lucide-react"

function formatAddress(addr: string | undefined): string {
  if (!addr) return "Anonymous"
  if (addr.startsWith("google:") || addr.startsWith("email:")) {
    const clean = addr.replace(/^(google|email):/, "")
    return clean.includes("@") ? clean.split("@")[0] : clean
  }
  if (addr.length > 14) return `${addr.slice(0, 5)}...${addr.slice(-4)}`
  return addr
}

export default function DashboardOverviewPage() {
  const user = useSessionUser()
  const isAdmin = user?.role === "admin"
  const isNatureHero = user?.role === "nature_hero" || isAdmin

  // Personal trees for normal users
  const myTrees = useMyTrees(user?.walletAddress)
  // All trees for admins / heroes
  const allTrees = useAllTrees()

  // Admin-specific queries
  const usersList = useQuery(
    api.users.listUsers,
    isAdmin && user?.userId ? { adminId: user.userId as any } : "skip",
  ) ?? []

  const heroApplications = useQuery(
    api.natureHeroes.listApplications,
    isAdmin && user?.userId ? { adminId: user.userId as any } : "skip",
  ) ?? []

  const campaigns = useQuery(api.campaigns.list) ?? []
  const contactMessages = useQuery(
    api.messages.list,
    isAdmin ? {} : "skip"
  ) ?? []

  if (!user) return null

  // ─── ADMIN DASHBOARD VIEW ───────────────────────────────────────
  if (isAdmin) {
    const pendingTrees = allTrees.filter((t) => t.status === "pending")
    const verifiedTrees = allTrees.filter((t) => t.status === "verified" || t.status === "minted")
    const pendingHeroes = heroApplications.filter((a: any) => a.status === "pending")
    const recentSubmissions = allTrees.slice(-6).reverse()

    const adminStats = [
      {
        label: "Total Network Trees",
        value: allTrees.length,
        sub: `${pendingTrees.length} pending review`,
        icon: Trees,
        color: "text-[#1db954]",
      },
      {
        label: "Registered Users",
        value: usersList.length || 1,
        sub: "Active network members",
        icon: Users,
        color: "text-[#38bdf8]",
      },
      {
        label: "Hero Applications",
        value: heroApplications.length,
        sub: `${pendingHeroes.length} awaiting review`,
        icon: Crown,
        color: "text-[#f0a830]",
      },
      {
        label: "Verified & Minted",
        value: verifiedTrees.length,
        sub: "On-chain proof confirmed",
        icon: CheckCircle2,
        color: "text-[#a78bfa]",
      },
    ]

    const adminActions = [
      {
        href: "/dashboard/verification",
        title: "Tree Verification Queue",
        desc: `${pendingTrees.length} submissions in review queue`,
        icon: "shield" as const,
        badge: pendingTrees.length > 0 ? `${pendingTrees.length} Pending` : undefined,
      },
      {
        href: "/dashboard/hero-verification",
        title: "Nature Hero Applications",
        desc: `${pendingHeroes.length} applicants awaiting verification`,
        icon: "crown" as const,
        badge: pendingHeroes.length > 0 ? `${pendingHeroes.length} New` : undefined,
      },
      {
        href: "/dashboard/map",
        title: "Global Map & Registry",
        desc: "Live geographical database and satellite imagery",
        icon: "sparkles" as const,
      },
      {
        href: "/dashboard/users",
        title: "User Management",
        desc: `Manage ${usersList.length || 1} registered network accounts & roles`,
        icon: "users" as const,
      },
      {
        href: "/dashboard/campaigns",
        title: "Planting Campaigns",
        desc: `Coordinate ${campaigns.length} active regional initiatives`,
        icon: "leaf" as const,
      },
      {
        href: "/dashboard/nft",
        title: "NFT Gallery",
        desc: "View minted proof-of-stewardship certificates",
        icon: "sparkles" as const,
      },
      {
        href: "/dashboard/messages",
        title: "Contact Inquiries",
        desc: `${contactMessages.filter((m: any) => m.status === "unread").length} unread public inquiries`,
        icon: "shield" as const,
        badge: contactMessages.filter((m: any) => m.status === "unread").length > 0
          ? `${contactMessages.filter((m: any) => m.status === "unread").length} Unread`
          : undefined,
      },
    ]

    return (
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Control Center</span>
            </div>
            <h1 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
              Network & Users Overview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitoring user stewardship data, submissions, and verification queues across CNC DAO.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/verification"
              className="flex items-center gap-1.5 rounded-full bg-[#1db954] px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Review Queue</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {adminStats.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-[#1db954]/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div className={`mt-3 font-[family-name:var(--font-space-mono)] text-2xl font-bold ${s.color}`}>
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground truncate">{s.sub}</div>
              </div>
            )
          })}
        </div>

        {/* Pending Action Alerts (if any) */}
        {(pendingTrees.length > 0 || pendingHeroes.length > 0) && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pendingTrees.length > 0 && (
              <Link
                href="/dashboard/verification"
                className="flex items-center justify-between rounded-2xl border border-[#f0a830]/30 bg-[#f0a830]/10 p-4 transition-transform hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0a830]/20 text-[#f0a830]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      {pendingTrees.length} Tree Submissions Pending
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ready for validator review and on-chain verification
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#f0a830]" />
              </Link>
            )}

            {pendingHeroes.length > 0 && (
              <Link
                href="/dashboard/hero-verification"
                className="flex items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 transition-transform hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      {pendingHeroes.length} Hero Applications Pending
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Review applicant motivation and grant Hero status
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-purple-400" />
              </Link>
            )}
          </div>
        )}

        {/* Admin Quick Actions */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                Management Modules
              </h2>
              <p className="text-xs text-muted-foreground">
                Administrative tools and system-wide registries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {adminActions.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-[#1db954]/40 hover:bg-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-[#1db954]">
                      <BadgeIcon name={q.icon} className="h-5 w-5" />
                    </span>
                    {q.badge && (
                      <span className="rounded-full bg-[#f0a830]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#f0a830]">
                        {q.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-foreground">{q.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{q.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#1db954]">
                  <span>Access Module</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent User Tree Submissions Across the Network */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                Recent Network Submissions
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest trees registered by community planters across the network.
              </p>
            </div>
            <Link
              href="/dashboard/verification"
              className="text-xs font-semibold text-[#1db954] hover:underline"
            >
              View Full Queue &rarr;
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No user submissions in the database yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentSubmissions.map((t: any) => (
                <div
                  key={t._id || t.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-border/80 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-[#1db954]">
                      <Trees className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-foreground">{t.name}</span>
                        <span className="text-xs text-muted-foreground">&bull;</span>
                        <span className="text-xs text-muted-foreground">{t.species}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[160px]">{t.location}</span>
                        </span>
                        <span>
                          Planter:{" "}
                          <span className="font-mono text-foreground font-medium">
                            {formatAddress(t.walletAddress)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        t.status === "minted"
                          ? "bg-[#a78bfa]/15 text-[#a78bfa]"
                          : t.status === "verified"
                            ? "bg-[#1db954]/15 text-[#1db954]"
                            : "bg-[#f0a830]/15 text-[#f0a830]"
                      }`}
                    >
                      {t.status}
                    </span>
                    <Link
                      href="/dashboard/verification"
                      className="rounded-xl border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── STANDARD USER & NATURE HERO VIEW ──────────────────────────
  const badges = getBadges(user, myTrees)
  const earnedCount = badges.filter((b) => b.earned).length

  const stats = [
    { label: "Trees registered", value: myTrees.length },
    {
      label: "NFTs minted",
      value: myTrees.filter((t) => t.status === "minted").length,
    },
    { label: "Campaigns joined", value: 0 },
    { label: "Badges earned", value: `${earnedCount}/${badges.length}` },
  ]

  const quickLinks = [
    {
      href: "/dashboard/campaigns",
      title: "Planting Campaigns",
      desc: "Join & coordinate planting drives",
      icon: "leaf" as const,
    },
    {
      href: "/dashboard/profile",
      title: "Edit Profile",
      desc: "Photo, display name, bio",
      icon: "leaf" as const,
    },
    {
      href: "/dashboard/badges",
      title: "View Badges",
      desc: "Your earned achievements",
      icon: "star" as const,
    },
    {
      href: "/dashboard/nft",
      title: "NFT Gallery",
      desc: "Proof-of-stewardship NFTs",
      icon: "sparkles" as const,
    },
    ...(isNatureHero
      ? [
          {
            href: "/dashboard/verification",
            title: "Tree Verification",
            desc: "Approve pending tree submissions",
            icon: "shield" as const,
          },
          {
            href: "/dashboard/map",
            title: "Global Map & Registry",
            desc: "Live geographical database registry",
            icon: "sparkles" as const,
          },
        ]
      : []),
  ]

  const recentTrees = myTrees.slice(-5).reverse()

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
          Welcome back{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your stewardship.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className="font-[family-name:var(--font-space-mono)] text-xl font-bold text-foreground">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
          Quick actions
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">Jump into any part of your dashboard.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[#1db954]/40 hover:bg-card-hover"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#1db954]/15 text-[#1db954]">
                <BadgeIcon name={q.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">{q.title}</span>
                <span className="block text-xs text-muted-foreground">{q.desc}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
          Recent trees
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Your most recent registrations from this browser.
        </p>
        {recentTrees.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
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
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
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
