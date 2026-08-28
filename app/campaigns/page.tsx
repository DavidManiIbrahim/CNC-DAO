"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { IconArrow } from "@/components/Icons"
import { useSessionUser } from "@/lib/useAuth"
import { Trash2, Edit2, Users, Check, Sparkles, MapPin } from "lucide-react"

export default function CampaignsPage() {
  const user = useSessionUser()
  const campaigns = useQuery(api.campaigns.list) ?? []
  const isNatureHero = user?.role === "nature_hero" || user?.role === "admin"
  const isAdmin = user?.role === "admin"

  const joinMutation = useMutation(api.campaigns.join)
  const removeMutation = useMutation(api.campaigns.remove)

  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({})

  async function handleJoin(campaignId: string) {
    setJoiningId(campaignId)
    try {
      await joinMutation({ campaignId: campaignId as any })
      setJoinedMap((prev) => ({ ...prev, [campaignId]: true }))
    } catch (err) {
      console.error("Failed to join campaign", err)
    } finally {
      setJoiningId(null)
    }
  }

  async function handleRemove(campaignId: string) {
    if (!user?.userId || !isAdmin) return
    if (!confirm("Are you sure you want to delete this campaign?")) return
    try {
      await removeMutation({
        adminId: user.userId as any,
        campaignId: campaignId as any,
      })
    } catch (err) {
      console.error("Failed to delete campaign", err)
    }
  }

  return (
    <main className="bg-background text-foreground font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="px-6 pb-10 pt-20 md:px-16 md:pt-28">
        <Reveal>
          <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <p className="mb-3 font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-[0.15em] text-[#f0a830]">
                Campaigns
              </p>
              <h1 className="font-[family-name:var(--font-dm-sans)] text-[32px] font-medium tracking-[-0.02em] md:text-[44px] text-foreground">
                Join a planting campaign
              </h1>
            </div>
            {isNatureHero ? (
              <Link
                href="/campaigns/new"
                className="flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black transition-transform duration-200 hover:scale-105"
              >
                Create campaign <IconArrow className="h-4 w-4 rotate-45" />
              </Link>
            ) : (
              <p className="max-w-xs text-xs text-muted-foreground">
                Approved Nature Heroes & Admins can create campaigns.{" "}
                <Link href="/nature-heroes/apply" className="text-[#1db954] underline hover:text-[#1db954]/80">
                  Apply here
                </Link>
                .
              </p>
            )}
          </div>
        </Reveal>
      </section>

      <section className="px-6 pb-24 md:px-16">
        <Reveal>
          <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-4 sm:grid-cols-2">
            {campaigns.length === 0 && (
              <div className="col-span-full rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                No campaigns yet.{" "}
                {isNatureHero && (
                  <Link href="/campaigns/new" className="text-[#1db954] underline font-semibold ml-1">
                    Be the first to create one.
                  </Link>
                )}
              </div>
            )}
            {campaigns.map((c: any) => {
              const pct = Math.min(100, Math.round((c.joined / c.participantLimit) * 100))
              const isJoined = joinedMap[c._id]
              const isFull = c.joined >= c.participantLimit

              return (
                <div
                  key={c._id}
                  className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/40 hover:shadow-md"
                >
                  {c.imageUrl && (
                    <div className="relative h-44 w-full overflow-hidden border-b border-border bg-muted">
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <span className="absolute bottom-2 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        {c.region}
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                          {c.name}
                        </h3>
                        {!c.imageUrl && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 text-[#1db954]" />
                            <span>{c.region}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {isNatureHero && (
                          <Link
                            href="/dashboard/campaigns"
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title="Edit Campaign in Dashboard"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleRemove(c._id)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="Delete campaign (Admin)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="my-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[#1db954] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="mb-4 flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>
                          {c.joined} / {c.participantLimit} joined
                        </span>
                      </span>
                      <span>By {c.createdBy}</span>
                    </div>

                    <button
                      disabled={isFull || isJoined || joiningId === c._id}
                      onClick={() => handleJoin(c._id)}
                      className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition-all duration-200 ${
                        isJoined
                          ? "bg-[#1db954]/20 text-[#1db954]"
                          : isFull
                            ? "cursor-not-allowed bg-muted text-muted-foreground"
                            : "bg-[#1db954] text-black hover:bg-[#1db954]/90 hover:scale-105"
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Joined!</span>
                        </>
                      ) : isFull ? (
                        "Campaign Full"
                      ) : joiningId === c._id ? (
                        "Joining..."
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Join campaign</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  )
}
