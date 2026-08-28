"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { roleLabels, type UserRole } from "@/lib/mockAuth"
import { useSessionUser } from "@/lib/useAuth"
import {
  Shield,
  Crown,
  Search,
  Trash2,
  CheckCircle,
  UserCheck,
  ShieldAlert,
  UserX,
} from "lucide-react"

function formatUserDisplay(u: any): string {
  if (u.displayName) return u.displayName
  if (u.name) return u.name
  if (u.walletAddress) {
    if (u.walletAddress.startsWith("google:") || u.walletAddress.startsWith("email:")) {
      const clean = u.walletAddress.replace(/^(google|email):/, "")
      return clean.includes("@") ? clean.split("@")[0] : clean
    }
    return `${u.walletAddress.slice(0, 5)}...${u.walletAddress.slice(-4)}`
  }
  if (u.email) return u.email.split("@")[0]
  return "Unnamed Member"
}

export default function UserManagementPage() {
  const user = useSessionUser()
  const setRoleMutation = useMutation(api.users.setUserRole)
  const removeMutation = useMutation(api.users.removeUser)

  const adminId = user?.userId
  const users =
    useQuery(api.users.listUsers, adminId ? { adminId: adminId as any } : "skip") ?? []
  const isAdmin = user?.role === "admin"

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = u.displayName?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q)
        const matchEmail = u.email?.toLowerCase().includes(q)
        const matchWallet = u.walletAddress?.toLowerCase().includes(q)
        return matchName || matchEmail || matchWallet
      }
      return true
    })
  }, [users, roleFilter, searchQuery])

  if (!user) return null

  async function setRole(targetId: string, role: UserRole, targetName: string) {
    if (!adminId) return
    const isPromotingToAdmin = role === "admin"
    if (
      isPromotingToAdmin &&
      !confirm(`Grant Administrator privileges to "${targetName}"? They will have full network and user moderation access.`)
    ) {
      return
    }

    setActionLoadingId(targetId)
    try {
      await setRoleMutation({
        adminId: adminId as any,
        userId: targetId as any,
        role,
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  async function removeUser(targetId: string, targetName: string) {
    if (!adminId) return
    if (!confirm(`Are you sure you want to remove user "${targetName}"? This action cannot be undone.`)) {
      return
    }

    setActionLoadingId(targetId)
    try {
      await removeMutation({
        adminId: adminId as any,
        userId: targetId as any,
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
            User Management
          </h1>
        </div>
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only administrators can view and manage network users.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Tool</span>
          </div>
          <h1 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
            User & Role Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review accounts, assign Nature Hero roles, and appoint system administrators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground">
            Total Members: <span className="font-mono text-[#1db954]">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Members" },
            { id: "admin", label: "Admins" },
            { id: "nature_hero", label: "Nature Heroes" },
            { id: "nature_hero_pending", label: "Pending" },
            { id: "user", label: "Planters" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                roleFilter === tab.id
                  ? "bg-[#1db954] text-black"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, wallet..."
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground outline-none transition-colors focus:border-[#1db954]/60"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[1.5fr_1.2fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
          <span>Member Profile</span>
          <span>Wallet / Auth ID</span>
          <span>Current Role</span>
          <span>Joined Date</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {filteredUsers.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              No matching members found.
            </div>
          ) : (
            filteredUsers.map((u: any) => {
              const displayName = formatUserDisplay(u)
              const joined = u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "—"
              const isSelf = u._id === user.userId
              const isLoading = actionLoadingId === u._id

              return (
                <div
                  key={u._id}
                  className="grid grid-cols-1 gap-3 p-5 transition-colors hover:bg-card-hover md:grid-cols-[1.5fr_1.2fr_1fr_1fr_auto] md:items-center md:gap-4"
                >
                  {/* User Profile */}
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1db954]/20 text-xs font-bold text-[#1db954]">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        displayName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-foreground">
                          {displayName}
                        </span>
                        {isSelf && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-foreground">
                            You
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {u.email || "No email linked"}
                      </div>
                    </div>
                  </div>

                  {/* Wallet / Auth */}
                  <div className="truncate text-xs font-mono text-muted-foreground">
                    {u.walletAddress || "—"}
                  </div>

                  {/* Role Badge */}
                  <div>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                      style={{
                        color: roleLabels[u.role as UserRole]?.color || "#ffffff",
                        backgroundColor: `${roleLabels[u.role as UserRole]?.color || "#ffffff"}20`,
                      }}
                    >
                      {u.role === "admin" && <Crown className="h-3 w-3" />}
                      {u.role === "nature_hero" && <CheckCircle className="h-3 w-3" />}
                      <span>{roleLabels[u.role as UserRole]?.label || u.role}</span>
                    </span>
                  </div>

                  {/* Joined Date */}
                  <div className="text-xs text-muted-foreground">{joined}</div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {/* Make Admin / Revoke Admin Button */}
                    {u.role !== "admin" ? (
                      <button
                        disabled={isLoading}
                        onClick={() => setRole(u._id, "admin", displayName)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20 hover:scale-105 disabled:opacity-50"
                        title="Promote to Administrator"
                      >
                        <Crown className="h-3.5 w-3.5 text-red-400" />
                        <span>Make Admin</span>
                      </button>
                    ) : !isSelf ? (
                      <button
                        disabled={isLoading}
                        onClick={() => setRole(u._id, "user", displayName)}
                        className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-50"
                        title="Demote from Admin to regular User"
                      >
                        <UserX className="h-3.5 w-3.5" />
                        <span>Demote to User</span>
                      </button>
                    ) : null}

                    {/* Promote to Nature Hero / Revoke Hero */}
                    {u.role === "nature_hero_pending" && (
                      <button
                        disabled={isLoading}
                        onClick={() => setRole(u._id, "nature_hero", displayName)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#1db954] px-3 py-1.5 text-xs font-bold text-black transition-transform hover:scale-105 disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Approve Hero</span>
                      </button>
                    )}

                    {u.role === "user" && (
                      <button
                        disabled={isLoading}
                        onClick={() => setRole(u._id, "nature_hero", displayName)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#1db954]/30 px-3 py-1.5 text-xs font-medium text-[#1db954] transition-colors hover:bg-[#1db954]/10 disabled:opacity-50"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Make Hero</span>
                      </button>
                    )}

                    {u.role === "nature_hero" && (
                      <button
                        disabled={isLoading}
                        onClick={() => setRole(u._id, "user", displayName)}
                        className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        <span>Revoke Hero</span>
                      </button>
                    )}

                    {/* Delete User Button (not for oneself) */}
                    {!isSelf && (
                      <button
                        disabled={isLoading}
                        onClick={() => removeUser(u._id, displayName)}
                        className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
