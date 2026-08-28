"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSessionUser } from "@/lib/useAuth"
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  Shield,
  Crown,
  Trash2,
} from "lucide-react"

export default function UsersPage() {
  const user = useSessionUser()
  const isAdmin = user?.role === "admin"
  const adminId = user?.userId

  const dbUsers = useQuery(
    api.users.listUsers,
    adminId ? { adminId: adminId as any } : "skip"
  ) ?? []

  const setUserRole = useMutation(api.users.setUserRole)
  const removeUser = useMutation(api.users.removeUser)

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Filter users
  const filteredUsers = useMemo(() => {
    return dbUsers.filter((u: any) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = u.name?.toLowerCase().includes(q)
        const matchEmail = u.email?.toLowerCase().includes(q)
        const matchWallet = u.walletAddress?.toLowerCase().includes(q)
        const matchDisplay = u.displayName?.toLowerCase().includes(q)
        return matchName || matchEmail || matchWallet || matchDisplay
      }
      return true
    })
  }, [dbUsers, roleFilter, searchQuery])

  // Quick stats
  const stats = {
    total: dbUsers.length,
    admins: dbUsers.filter((u: any) => u.role === "admin").length,
    natureHeroes: dbUsers.filter((u: any) => u.role === "nature_hero").length,
    regularUsers: dbUsers.filter((u: any) => u.role === "user" || !u.role).length,
  }

  async function handleRoleChange(targetUserId: string, newRole: "admin" | "nature_hero" | "user", userName: string) {
    if (!user?.userId || !isAdmin) return
    const isSelf = targetUserId === user.userId

    if (isSelf && newRole !== "admin") {
      if (!confirm("Warning: You are about to remove your own Admin privileges. Are you sure?")) {
        return
      }
    } else {
      if (!confirm(`Are you sure you want to change ${userName}'s role to ${newRole.toUpperCase()}?`)) {
        return
      }
    }

    setActionLoadingId(targetUserId)
    try {
      await setUserRole({
        adminId: user.userId as any,
        userId: targetUserId as any,
        role: newRole,
      })
    } catch (err) {
      console.error("Failed to update user role", err)
      alert("Failed to update user role. Please ensure you have admin permissions.")
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDeleteUser(targetUserId: string, userName: string) {
    if (!user?.userId || !isAdmin) return
    if (targetUserId === user.userId) {
      alert("You cannot delete your own active administrator account.")
      return
    }

    if (!confirm(`Are you sure you want to permanently delete the account for ${userName}? This action is irreversible.`)) {
      return
    }

    setActionLoadingId(targetUserId)
    try {
      await removeUser({
        adminId: user.userId as any,
        userId: targetUserId as any,
      })
    } catch (err) {
      console.error("Failed to delete user account", err)
      alert("Failed to delete user account. Please ensure you have admin permissions.")
    } finally {
      setActionLoadingId(null)
    }
  }

  function formatUserDisplay(u: any) {
    if (u.name) return u.name
    if (u.displayName) return u.displayName
    if (u.email) return u.email.split("@")[0]
    if (u.walletAddress) {
      const clean = u.walletAddress.replace("email:", "")
      if (clean.includes("@")) return clean.split("@")[0]
      return `${clean.slice(0, 6)}...${clean.slice(-4)}`
    }
    return "Anonymous"
  }

  function formatIdentifier(u: any) {
    if (u.email) return u.email
    if (u.walletAddress) {
      const clean = u.walletAddress.replace("email:", "")
      if (clean.length > 20) return `${clean.slice(0, 8)}...${clean.slice(-6)}`
      return clean
    }
    return "—"
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-500 mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="font-[family-name:var(--font-syne)] text-xl font-bold text-foreground">
          Administrator Access Required
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This section is strictly restricted to CNC DAO System Administrators.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
            User Management & Roles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage DAO member permissions, assign Administrator privileges, and manage member accounts.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          onClick={() => setRoleFilter("all")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            roleFilter === "all"
              ? "border-[#1db954] bg-[#1db954]/10"
              : "border-border bg-card hover:border-[#1db954]/40"
          }`}
        >
          <div className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-foreground">
            {stats.total}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Total Members</div>
        </div>

        <div
          onClick={() => setRoleFilter("admin")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            roleFilter === "admin"
              ? "border-red-500 bg-red-500/10"
              : "border-border bg-card hover:border-red-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-red-500">
              {stats.admins}
            </span>
            <Crown className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Administrators</div>
        </div>

        <div
          onClick={() => setRoleFilter("nature_hero")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            roleFilter === "nature_hero"
              ? "border-[#f0a830] bg-[#f0a830]/10"
              : "border-border bg-card hover:border-[#f0a830]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#f0a830]">
              {stats.natureHeroes}
            </span>
            <ShieldCheck className="h-4 w-4 text-[#f0a830]" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Nature Heroes</div>
        </div>

        <div
          onClick={() => setRoleFilter("user")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            roleFilter === "user"
              ? "border-[#1db954] bg-[#1db954]/10"
              : "border-border bg-card hover:border-[#1db954]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1db954]">
              {stats.regularUsers}
            </span>
            <UserCheck className="h-4 w-4 text-[#1db954]" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Community Planters</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: `All (${stats.total})` },
            { id: "admin", label: `Admins (${stats.admins})` },
            { id: "nature_hero", label: `Heroes (${stats.natureHeroes})` },
            { id: "user", label: `Planters (${stats.regularUsers})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                roleFilter === tab.id
                  ? "bg-[#1db954] text-black font-bold"
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
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <div className="min-w-[760px]">
          {/* Table Header */}
          <div className="hidden grid-cols-[2fr_1.8fr_1.2fr_1fr_150px] items-center gap-4 border-b border-border bg-muted/70 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
            <span className="flex items-center gap-1.5">
              <span>Member Profile</span>
            </span>
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
                const isSelf = u._id === user?.userId
                const isLoading = actionLoadingId === u._id

                return (
                  <div
                    key={u._id}
                    className="grid grid-cols-1 gap-3 p-5 transition-colors hover:bg-card-hover md:grid-cols-[2fr_1.8fr_1.2fr_1fr_150px] md:items-center md:gap-4"
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
                            <span className="rounded bg-[#1db954]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#1db954]">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {u.email || u.walletAddress || "No email"}
                        </div>
                      </div>
                    </div>

                    {/* Wallet / Auth */}
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-muted-foreground md:hidden">Identifier:</div>
                      <div className="font-mono text-xs text-muted-foreground truncate">
                        {formatIdentifier(u)}
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground md:hidden mb-1">Role:</div>
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
                          <Crown className="h-3 w-3" />
                          <span>Admin</span>
                        </span>
                      ) : u.role === "nature_hero" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f0a830]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#f0a830]">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Nature Hero</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span>Planter</span>
                        </span>
                      )}
                    </div>

                    {/* Joined Date */}
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground md:hidden mb-0.5">Joined:</div>
                      <span className="text-xs text-muted-foreground">{joined}</span>
                    </div>

                    {/* Action Icon Buttons with Hover Tooltips */}
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Make Admin Icon Button */}
                      {u.role !== "admin" && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleRoleChange(u._id, "admin", displayName)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition-all hover:scale-110 hover:bg-red-500/20 disabled:opacity-50"
                          title="Promote to Full Administrator"
                          aria-label="Promote to Full Administrator"
                        >
                          <Crown className="h-4 w-4" />
                        </button>
                      )}

                      {/* Make Hero Icon Button */}
                      {u.role !== "nature_hero" && u.role !== "admin" && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleRoleChange(u._id, "nature_hero", displayName)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0a830]/10 text-[#f0a830] transition-all hover:scale-110 hover:bg-[#f0a830]/20 disabled:opacity-50"
                          title="Promote to Nature Hero Validator"
                          aria-label="Promote to Nature Hero Validator"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </button>
                      )}

                      {/* Demote Icon Button */}
                      {u.role && u.role !== "user" && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleRoleChange(u._id, "user", displayName)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:scale-110 hover:bg-muted hover:text-foreground disabled:opacity-50"
                          title="Demote to Community Planter"
                          aria-label="Demote to Community Planter"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete Account Button */}
                      {!isSelf && (
                        <button
                          disabled={isLoading}
                          onClick={() => handleDeleteUser(u._id, displayName)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition-all hover:scale-110 hover:bg-red-500/20 disabled:opacity-50"
                          title="Permanently Delete Account"
                          aria-label="Permanently Delete Account"
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
    </div>
  )
}
