"use client"

import { useEffect, useState } from "react"
import { getMockUser, roleLabels, type MockUser, type UserRole } from "@/lib/mockAuth"

type SampleUser = {
  id: string
  name: string
  email: string
  region: string
  role: UserRole
  joinedAt: string
  trees: number
}

// Sample data standing in for real users — this mock system only tracks one
// wallet per browser (see lib/mockAuth.ts), so a cross-user management UI
// can't be backed by real data until there's a backend.
const sampleUsers: SampleUser[] = [
  { id: "u1", name: "Aisha Bello", email: "aisha@example.com", region: "Kano, Nigeria", role: "nature_hero", joinedAt: "3 months ago", trees: 42 },
  { id: "u2", name: "Chidi Okafor", email: "chidi@example.com", region: "Enugu, Nigeria", role: "nature_hero_pending", joinedAt: "1 week ago", trees: 3 },
  { id: "u3", name: "Fatima Yusuf", email: "fatima@example.com", region: "Kaduna, Nigeria", role: "user", joinedAt: "2 days ago", trees: 1 },
  { id: "u4", name: "Emeka Nwosu", email: "emeka@example.com", region: "Abuja, Nigeria", role: "user", joinedAt: "1 month ago", trees: 0 },
  { id: "u5", name: "Zainab Adeyemi", email: "zainab@example.com", region: "Ibadan, Nigeria", role: "nature_hero", joinedAt: "5 months ago", trees: 87 },
]

export default function UserManagementPage() {
  const [user, setUser] = useState<MockUser | null | undefined>(() => getMockUser())
  const [users, setUsers] = useState<SampleUser[]>(sampleUsers)

  useEffect(() => {
    const handler = () => setUser(getMockUser())
    window.addEventListener("mockuser:change", handler)
    return () => window.removeEventListener("mockuser:change", handler)
  }, [])

  if (user === undefined || user === null) return null

  if (user.role !== "admin") {
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

  function setRole(id: string, role: UserRole) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id))
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
          <span>Region</span>
          <span>Role</span>
          <span>Trees</span>
          <span />
        </div>
        <div className="flex flex-col">
          {users.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-1 gap-3 border-b border-white/5 px-5 py-4 last:border-0 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{u.name}</div>
                <div className="truncate text-xs text-white/40">{u.email}</div>
              </div>
              <div className="text-xs text-white/50">{u.region}</div>
              <div>
                <span
                  className="inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  style={{ color: roleLabels[u.role].color, backgroundColor: `${roleLabels[u.role].color}1f` }}
                >
                  {roleLabels[u.role].label}
                </span>
              </div>
              <div className="text-xs text-white/50">{u.trees}</div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                {u.role === "nature_hero_pending" && (
                  <button
                    onClick={() => setRole(u.id, "nature_hero")}
                    className="rounded-full bg-[#1db954] px-3 py-1.5 text-xs font-medium"
                  >
                    Approve
                  </button>
                )}
                {u.role === "nature_hero" && (
                  <button
                    onClick={() => setRole(u.id, "user")}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
                  >
                    Revoke
                  </button>
                )}
                {u.role === "user" && (
                  <button
                    onClick={() => setRole(u.id, "nature_hero")}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
                  >
                    Promote
                  </button>
                )}
                <button
                  onClick={() => removeUser(u.id)}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-red-400/70 hover:bg-white/5 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-white/30">
        Sample data — real user management needs a backend. See README.md.
      </p>
    </div>
  )
}
