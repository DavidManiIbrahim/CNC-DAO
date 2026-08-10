"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { getMockUser, roleLabels, type MockUser, type UserRole } from "@/lib/mockAuth"

export default function UserManagementPage() {
  const [user, setUser] = useState<MockUser | null | undefined>(() => getMockUser())
  const setRoleMutation = useMutation(api.users.setUserRole)
  const removeMutation = useMutation(api.users.removeUser)

  const adminId = user?.userId

  const users =
    useQuery(api.users.listUsers, adminId ? { adminId: adminId as any } : "skip") ?? []
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    const handler = () => setUser(getMockUser())
    window.addEventListener("mockuser:change", handler)
    return () => window.removeEventListener("mockuser:change", handler)
  }, [])

  if (user === undefined || user === null) return null

  async function setRole(id: string, role: UserRole) {
    if (!adminId) return
    await setRoleMutation({ adminId: adminId as any, userId: id as any, role })
  }

  async function removeUser(id: string) {
    if (!adminId) return
    await removeMutation({ adminId: adminId as any, userId: id as any })
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">User Management</h1>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#08080f] p-8 text-center">
          <p className="text-sm text-white/60">Only admins can manage users.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">User Management</h1>
        <p className="mt-1 text-sm text-white/50">
          Review and manage members across the network.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#08080f]">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/10 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white/30 md:grid">
          <span>User</span>
          <span>Wallet</span>
          <span>Role</span>
          <span>Joined</span>
          <span />
        </div>
        <div className="flex flex-col">
          {users.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-white/40">
              No users yet.
            </div>
          )}
          {users.map((u: any) => {
            const name = u.displayName || u.name || u.walletAddress || "Unnamed"
            const joined = new Date(u.joinedAt).toLocaleDateString()
            return (
              <div
                key={u._id}
                className="grid grid-cols-1 gap-3 border-b border-white/5 px-5 py-4 last:border-0 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold">{name}</div>
                  <div className="truncate text-xs text-white/40">{u.email}</div>
                </div>
                <div className="truncate text-xs text-white/50">{u.walletAddress}</div>
                <div>
                  <span
                    className="inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold"
                    style={{
                      color: roleLabels[u.role as UserRole].color,
                      backgroundColor: `${roleLabels[u.role as UserRole].color}1f`,
                    }}
                  >
                    {roleLabels[u.role as UserRole].label}
                  </span>
                </div>
                <div className="text-xs text-white/50">{joined}</div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {u.role === "nature_hero_pending" && (
                    <button
                      onClick={() => setRole(u._id, "nature_hero")}
                      className="rounded-full bg-[#1db954] px-3 py-1.5 text-xs font-medium"
                    >
                      Approve
                    </button>
                  )}
                  {u.role === "nature_hero" && (
                    <button
                      onClick={() => setRole(u._id, "user")}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
                    >
                      Revoke
                    </button>
                  )}
                  {u.role === "user" && (
                    <button
                      onClick={() => setRole(u._id, "nature_hero")}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
                    >
                      Promote
                    </button>
                  )}
                  <button
                    onClick={() => removeUser(u._id)}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-red-400/70 hover:bg-white/5 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
