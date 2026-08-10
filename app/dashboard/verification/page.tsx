"use client"

import { useEffect, useState } from "react"
import { getMockUser, type MockUser } from "@/lib/mockAuth"
import { getUserTrees, updateTreeStatus, type RegisteredTree } from "@/lib/registeredTrees"

// Sample data standing in for what an admin would see across ALL users —
// this mock system only tracks one wallet per browser (see lib/mockAuth.ts),
// so cross-user data like this can't be real until there's a backend.
const sampleApplications = [
  { id: "app-1", name: "Aisha Bello", region: "Kano, Nigeria", submittedAt: "3 days ago" },
  { id: "app-2", name: "Chidi Okafor", region: "Enugu, Nigeria", submittedAt: "1 day ago" },
]

export default function VerificationPage() {
  const [user, setUser] = useState<MockUser | null | undefined>(() => getMockUser())
  const [pendingTrees, setPendingTrees] = useState<RegisteredTree[]>([])
  const [applications, setApplications] = useState(sampleApplications)

  useEffect(() => {
    const handler = () => setUser(getMockUser())
    window.addEventListener("mockuser:change", handler)
    return () => window.removeEventListener("mockuser:change", handler)
  }, [])

  useEffect(() => {
    const refreshQueue = () => setPendingTrees(getUserTrees().filter((t) => t.status === "pending"))
    refreshQueue()
    window.addEventListener("trees:change", refreshQueue)
    return () => window.removeEventListener("trees:change", refreshQueue)
  }, [])

  if (user === undefined || user === null) return null

  const isVerifier = user.role === "nature_hero" || user.role === "admin"
  const isAdmin = user.role === "admin"

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Verification</h1>
        <p className="mt-1 text-sm text-white/50">
          {isVerifier
            ? "Trees waiting on verification before they go on-chain."
            : "This area is available to Nature Heroes and Admins."}
        </p>
      </div>

      {!isVerifier && (
        <div className="rounded-xl border border-white/10 bg-[#08080f] p-8 text-center">
          <div className="mb-3 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M12 3l7 3v6c0 4.5-3 8.5-7 9-4-.5-7-4.5-7-9V6l7-3Z" />
              </svg>
            </span>
          </div>
          <p className="text-sm text-white/60">
            Only approved Nature Heroes can verify trees.
          </p>
        </div>
      )}

      {isVerifier && (
        <div className="mb-8">
          <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">
            Validation Queue
          </h2>
          <p className="mb-5 text-sm text-white/50">
            Trees waiting on verification before they go on-chain.
          </p>
          {pendingTrees.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#08080f] p-6 text-center text-sm text-white/40">
              Nothing in the queue right now.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingTrees.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#08080f] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-white/50">
                      {t.species} — {t.location}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTreeStatus(t.id, "verified")}
                      className="rounded-full bg-[#1db954] px-4 py-1.5 text-xs font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateTreeStatus(t.id, "pending")}
                      className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-white/30">
            Real verification requires two independent Nature Heroes to
            approve — this demo only tracks one action.
          </p>
        </div>
      )}

      {isAdmin && (
        <div>
          <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">
            Nature Hero Applications
          </h2>
          <p className="mb-5 text-sm text-white/50">
            Sample data — real applications need a backend to track other users.
          </p>
          {applications.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#08080f] p-6 text-center text-sm text-white/40">
              No pending applications.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {applications.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#08080f] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="text-sm font-bold">{a.name}</div>
                    <div className="text-xs text-white/50">
                      {a.region} — applied {a.submittedAt}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setApplications((prev) => prev.filter((x) => x.id !== a.id))}
                      className="rounded-full bg-[#1db954] px-4 py-1.5 text-xs font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setApplications((prev) => prev.filter((x) => x.id !== a.id))}
                      className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
