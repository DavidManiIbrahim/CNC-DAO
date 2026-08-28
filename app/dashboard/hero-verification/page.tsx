"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSessionUser } from "@/lib/useAuth"
import { Shield, ShieldAlert, CheckCircle, XCircle } from "lucide-react"

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
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Admin Review</span>
        </div>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
          Nature Hero Verification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Review and approve applications from community members applying to become certified Nature Heroes."
            : "This administrative area is restricted to system administrators."}
        </p>
      </div>

      {!isAdmin ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h2 className="text-lg font-bold text-foreground">Admin Access Required</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only system administrators can review and approve Nature Hero applications.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                Applications List
              </h2>
              <p className="text-xs text-muted-foreground">
                Total received: <span className="font-semibold text-foreground">{applications.length}</span>
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No Nature Hero applications submitted yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((a: any) => (
                <div
                  key={a._id}
                  className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-[#1db954]/30"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{a.fullName}</h3>
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
                      <div className="mt-1 text-xs text-muted-foreground">
                        {a.cityRegion}, {a.country} &bull;{" "}
                        <span className="text-foreground font-medium">{a.email}</span>
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
                          className="flex items-center gap-1.5 rounded-xl bg-[#1db954] px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Approve</span>
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
                          className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Motivation
                    </p>
                    <p className="text-xs leading-relaxed text-foreground">{a.motivation}</p>
                  </div>

                  {a.experience && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Relevant Experience
                      </p>
                      <p className="text-xs leading-relaxed text-foreground">{a.experience}</p>
                    </div>
                  )}

                  <div className="mt-4 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
                    Submitted on: {new Date(a.submittedAt).toLocaleDateString()} &bull; Wallet:{" "}
                    <span className="font-mono text-foreground">{a.walletAddress}</span>
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
