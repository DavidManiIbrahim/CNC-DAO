"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSessionUser } from "@/lib/useAuth"

export default function HeroVerificationPage() {
  const user = useSessionUser()
  const adminId = user?.userId

  const applications =
    useQuery(
      api.natureHeroes.listApplications,
      adminId && user?.role === "admin" ? { adminId: adminId as any } : "skip",
    ) ?? []

  const setApplicationStatus = useMutation(api.natureHeroes.setApplicationStatus)

  if (!user) return null

  const isAdmin = user.role === "admin"

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
          Nature Hero Verification
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {isAdmin
            ? "Review and approve applications from community members applying to become certified Nature Heroes."
            : "This administrative area is restricted to system administrators."}
        </p>
      </div>

      {!isAdmin ? (
        <div className="rounded-xl border border-white/10 bg-[#08080f] p-8 text-center">
          <div className="mb-3 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          </div>
          <p className="text-sm font-medium text-white/80">Admin Access Required</p>
          <p className="mt-1 text-xs text-white/40">
            Only system administrators can review and approve Nature Hero applications.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold">
                Applications List
              </h2>
              <p className="text-xs text-white/50">
                Total received: {applications.length}
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#08080f] p-8 text-center text-sm text-white/40">
              No Nature Hero applications submitted yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((a: any) => (
                <div
                  key={a._id}
                  className="rounded-xl border border-white/10 bg-[#08080f] p-5 transition-colors hover:border-white/20"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{a.fullName}</h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            a.status === "approved"
                              ? "bg-[#1db954]/15 text-[#1db954]"
                              : a.status === "rejected"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-[#f0a830]/15 text-[#f0a830]"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        {a.cityRegion}, {a.country} &bull;{" "}
                        <span className="text-white/70">{a.email}</span>
                      </div>
                    </div>

                    {a.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            adminId &&
                            setApplicationStatus({
                              adminId: adminId as any,
                              applicationId: a._id as any,
                              status: "approved",
                            })
                          }
                          className="rounded-full bg-[#1db954] px-4 py-1.5 text-xs font-semibold text-black transition-transform hover:scale-105"
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
                          className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-white/5 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
                      Motivation
                    </p>
                    <p className="text-xs leading-relaxed text-white/80">{a.motivation}</p>
                  </div>

                  {a.experience && (
                    <div className="mt-3 border-t border-white/5 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
                        Relevant Experience
                      </p>
                      <p className="text-xs leading-relaxed text-white/80">{a.experience}</p>
                    </div>
                  )}

                  <div className="mt-3 text-[10px] text-white/30">
                    Submitted on: {new Date(a.submittedAt).toLocaleDateString()} &bull; Wallet:{" "}
                    <span className="font-mono">{a.walletAddress}</span>
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
