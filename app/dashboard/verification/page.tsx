"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSessionUser } from "@/lib/useAuth"

export default function VerificationPage() {
  const user = useSessionUser()
  const verifierId = user?.userId
  const adminId = user?.userId

  const pendingTrees =
    useQuery(
      api.trees.listPending,
      verifierId && (user?.role === "nature_hero" || user?.role === "admin")
        ? { verifierId: verifierId as any }
        : "skip",
    ) ?? []

  const myTrees =
    useQuery(
      api.trees.listMine,
      user?.walletAddress ? { walletAddress: user.walletAddress } : "skip",
    ) ?? []

  const applications =
    useQuery(
      api.natureHeroes.listApplications,
      adminId && user?.role === "admin" ? { adminId: adminId as any } : "skip",
    ) ?? []

  const updateTreeStatus = useMutation(api.trees.updateStatus)
  const setApplicationStatus = useMutation(api.natureHeroes.setApplicationStatus)

  if (!user) return null

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

      <div className="mb-8">
        <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">
          My submissions
        </h2>
        <p className="mb-5 text-sm text-white/50">
          Trees you've registered and their current status.
        </p>
        {myTrees.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#08080f] p-6 text-center text-sm text-white/40">
            You haven't registered any trees yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {myTrees.map((t: any) => (
              <div
                key={t._id}
                className="flex flex-col items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#08080f] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="text-xs text-white/50">
                    {t.species} — {t.location}
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    t.status === "verified"
                      ? "bg-[#1db954]/15 text-[#1db954]"
                      : t.status === "minted"
                        ? "bg-[#f0a830]/15 text-[#f0a830]"
                        : "bg-white/5 text-white/40"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

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
              {pendingTrees.map((t: any) => (
                <div
                  key={t._id}
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
                      onClick={() =>
                        verifierId &&
                        updateTreeStatus({
                          verifierId: verifierId as any,
                          treeId: t._id as any,
                          status: "verified",
                        })
                      }
                      className="rounded-full bg-[#1db954] px-4 py-1.5 text-xs font-medium"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-white/30">
            Real verification requires two independent Nature Heroes to
            approve — approval currently records a single action.
          </p>
        </div>
      )}

      {isAdmin && (
        <div>
          <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">
            Nature Hero Applications
          </h2>
          <p className="mb-5 text-sm text-white/50">
            Approve or reject applications submitted through the site.
          </p>
          {applications.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#08080f] p-6 text-center text-sm text-white/40">
              No applications yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {applications.map((a: any) => (
                <div
                  key={a._id}
                  className="flex flex-col items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#08080f] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="text-sm font-bold">{a.fullName}</div>
                    <div className="text-xs text-white/50">
                      {a.cityRegion}, {a.country} — {a.email}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-white/30">
                      {a.status}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {a.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            adminId &&
                            setApplicationStatus({
                              adminId: adminId as any,
                              applicationId: a._id as any,
                              status: "approved",
                            })
                          }
                          className="rounded-full bg-[#1db954] px-4 py-1.5 text-xs font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            adminId &&
                            setApplicationStatus({
                              adminId: adminId as any,
                              applicationId: a._id as any,
                              status: "rejected",
                            })
                          }
                          className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
                        >
                          Reject
                        </button>
                      </>
                    )}
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
