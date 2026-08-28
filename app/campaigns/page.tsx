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
import { Trash2, Users, Check, Sparkles } from "lucide-react"

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
    <main className="bg-[#0b0a12] text-white font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="px-6 pb-10 pt-20 md:px-16 md:pt-28">
        <Reveal>
          <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <p className="mb-3 font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-[0.15em] text-[#f0a830]">
                Campaigns
              </p>
              <h1 className="font-[family-name:var(--font-dm-sans)] text-[32px] font-medium tracking-[-0.02em] md:text-[44px]">
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
              <p className="max-w-xs text-xs text-white/40">
                Approved Nature Heroes & Admins can create campaigns.{" "}
                <Link href="/nature-heroes/apply" className="text-[#1db954] underline">
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
              <div className="col-span-full rounded-xl border border-white/10 bg-[#08080f] p-10 text-center text-sm text-white/40">
                No campaigns yet.{" "}
                {isNatureHero && (
                  <Link href="/campaigns/new" className="text-[#1db954] underline">
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
                  className="relative rounded-xl border border-white/10 bg-[#08080f] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold text-white">
                        {c.name}
                      </h3>
                      <p className="text-sm text-white/50">{c.region}</p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleRemove(c._id)}
                        className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete campaign (Admin)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="my-3 text-xs leading-relaxed text-white/70 line-clamp-2">
                    {c.description}
                  </p>

                  <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#1db954]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mb-4 flex justify-between text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {c.joined} / {c.participantLimit} joined
                    </span>
                    <span>By {c.createdBy}</span>
                  </div>

                  <button
                    disabled={isFull || isJoined || joiningId === c._id}
                    onClick={() => handleJoin(c._id)}
                    className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isJoined
                        ? "bg-[#1db954]/20 text-[#1db954]"
                        : isFull
                          ? "cursor-not-allowed bg-white/10 text-white/30"
                          : "bg-white/95 text-[#0b0a12] hover:bg-white hover:scale-105"
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <Check className="h-4 w-4" />
                        Joined!
                      </>
                    ) : isFull ? (
                      "Campaign Full"
                    ) : joiningId === c._id ? (
                      "Joining..."
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Join campaign
                      </>
                    )}
                  </button>
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
