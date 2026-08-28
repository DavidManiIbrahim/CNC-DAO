"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSessionUser } from "@/lib/useAuth"
import {
  setMockUser,
  disconnectMockWallet,
  roleLabels,
  type UserRole,
} from "@/lib/mockAuth"

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  roles?: UserRole[]
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Menu",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
      {
        href: "/dashboard/profile",
        label: "Profile",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
          </svg>
        ),
      },
      {
        href: "/dashboard/badges",
        label: "Badges",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <circle cx="12" cy="9" r="5.5" />
            <path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5" />
          </svg>
        ),
      },
      {
        href: "/dashboard/campaigns",
        label: "Campaigns",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        ),
      },
      {
        href: "/dashboard/nft",
        label: "NFT Gallery",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        ),
      },
      {
        href: "/dashboard/map",
        label: "Global Map & Registry",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Network",
    items: [
      {
        href: "/dashboard/verification",
        label: "Tree Verification",
        roles: ["nature_hero", "admin"],
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M12 3l7 3v6c0 4.5-3 8.5-7 9-4-.5-7-4.5-7-9V6l7-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        ),
      },
      {
        href: "/dashboard/hero-verification",
        label: "Hero Verification",
        roles: ["admin"],
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 11l-3 3-1.5-1.5" />
          </svg>
        ),
      },
      {
        href: "/dashboard/users",
        label: "User Management",
        roles: ["admin"],
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c1.2-3 3.7-4.5 6.5-4.5s5.3 1.5 6.5 4.5" />
            <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 16c1.2 1.2 2.2 2.6 3 4" />
          </svg>
        ),
      },
      {
        href: "/dashboard/messages",
        label: "Contact Inquiries",
        roles: ["admin"],
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        ),
      },
    ],
  },
]

import { ThemeToggle } from "@/components/ThemeToggle"

function formatUserLabel(raw: string | undefined | null): string {
  if (!raw) return "User"
  let clean = raw.replace(/^(email|google):/i, "")
  if (clean.includes("@")) {
    clean = clean.split("@")[0]
  }
  if (clean.length > 18 && !clean.includes(" ")) {
    return `${clean.slice(0, 4)}...${clean.slice(-4)}`
  }
  return clean
}

function initialsOf(name: string) {
  const clean = formatUserLabel(name)
  return clean.slice(0, 2).toUpperCase()
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = useSessionUser()
  const { data: googleSession } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const connectWallet = useMutation(api.users.connectWallet)
  const linkingRef = useRef(false)

  // Auto-logout: if the user lands on the dashboard without any session
  // (no mock user AND no Google session), redirect home.
  useEffect(() => {
    if (user === null) {
      router.replace("/")
    }
  }, [user, router])

  // Google sign-ins: create a Convex user lazily so Convex-backed features
  // work for them too, then mirror it into the localStorage session cache.
  useEffect(() => {
    if (!user || user.userId || !googleSession?.user) return
    if (linkingRef.current) return
    linkingRef.current = true
    const walletAddress = `google:${googleSession.user.email ?? "user"}`
    connectWallet({ walletAddress })
      .then((convexUser) => {
        setMockUser({
          userId: convexUser._id,
          walletAddress,
          role: convexUser.role as UserRole,
          displayName: convexUser.displayName ?? convexUser.name ?? undefined,
          bio: convexUser.bio ?? undefined,
          avatar: convexUser.avatar ?? googleSession.user?.image ?? undefined,
          joinedAt: convexUser.joinedAt,
        })
      })
      .finally(() => {
        linkingRef.current = false
      })
  }, [user, googleSession, connectWallet])

  if (user === undefined || user === null) return null

  const walletConnected = Boolean(
    user && !user.walletAddress.startsWith("google:") && !user.walletAddress.startsWith("email:"),
  )

  function handleLogout() {
    if (googleSession) {
      signOut({ callbackUrl: "/" })
      return
    }
    disconnectMockWallet()
    router.replace("/")
  }

  function handleDisconnectWallet() {
    disconnectMockWallet()
    router.replace("/")
  }

  const visibleGroups = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => !item.roles || item.roles.includes(user.role)),
    }))
    .filter((g) => g.items.length > 0)

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`))

  const sidebar = (
    <nav className="flex flex-col gap-6 overflow-y-auto">
      {visibleGroups.map((group) => (
        <div key={group.label}>
          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </div>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-[#1db954]/15 text-[#1db954]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className={active ? "text-[#1db954]" : "text-muted-foreground"}>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

    </nav>
  )

  return (
    <div className="min-h-screen bg-background text-foreground font-[family-name:var(--font-space-grotesk)]">
      {/* Dashboard header — always visible to authenticated users */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted lg:hidden"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <img
                src="https://framerusercontent.com/images/XkdqyILHzud8shJDghKw5DhZuw.png"
                alt="CNC DAO"
                className="h-6 w-6 object-cover"
              />
              <span className="text-lg font-medium tracking-[-0.02em]">CNCDAO</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-3 transition-colors hover:bg-muted"
            >
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#1db954]/25 text-xs font-bold text-[#1db954]">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  initialsOf(user.displayName || user.walletAddress)
                )}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-[140px] truncate text-left text-xs font-bold">
                  {formatUserLabel(user.displayName || user.walletAddress)}
                </span>
                <span className="block text-left text-[10px]" style={{ color: roleLabels[user.role].color }}>
                  {roleLabels[user.role].label}
                </span>
              </span>
            </Link>
            {walletConnected && (
              <button
                onClick={handleDisconnectWallet}
                className="hidden rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:block"
              >
                Disconnect Wallet
              </button>
            )}
            <button
              onClick={handleLogout}
              className="hidden rounded-full border border-red-500/30 px-4 py-2 text-xs font-medium text-red-300/80 transition-colors hover:bg-red-500/10 hover:text-red-200 md:block"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-shrink-0 border-r border-border px-4 py-6 lg:block">
          {sidebar}
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 border-r border-border bg-background px-4 py-6">
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  )
}
