"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { IconArrow } from "@/components/Icons"
import { getMockUser } from "@/lib/mockAuth"

export default function CampaignsPage() {
  const [isNatureHero, setIsNatureHero] = useState(false)
  const campaigns = useQuery(api.campaigns.list) ?? []

  useEffect(() => {
    const u = getMockUser()
    setIsNatureHero(u?.role === "nature_hero" || u?.role === "admin")
  }, [])

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
                className="flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-medium transition-transform duration-200 hover:scale-105"
              >
                Create campaign <IconArrow className="h-4 w-4 rotate-45" />
              </Link>
            ) : (
              <p className="max-w-xs text-xs text-white/40">
                Only approved Nature Heroes can create campaigns.{" "}
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
                No campaigns yet. Be the first to create one.
              </div>
            )}
            {campaigns.map((c: any) => {
              const pct = Math.round((c.joined / c.participantLimit) * 100)
              return (
                <div
                  key={c._id}
                  className="rounded-xl border border-white/10 bg-[#08080f] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/40"
                >
                  <h3 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">
                    {c.name}
                  </h3>
                  <p className="mb-4 text-sm text-white/50">{c.region}</p>
                  <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#1db954]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mb-4 flex justify-between text-xs text-white/40">
                    <span>
                      {c.joined} / {c.participantLimit} joined
                    </span>
                    <span>{c.createdBy}</span>
                  </div>
                  <button className="w-full rounded-full bg-white/95 py-2.5 text-sm font-medium text-[#0b0a12] transition-transform duration-200 hover:scale-105">
                    Join campaign
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
