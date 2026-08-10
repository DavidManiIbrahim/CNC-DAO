"use client"

import { useEffect, useState } from "react"
import { BadgeIcon } from "@/components/Icons"
import { getMockUser, type MockUser } from "@/lib/mockAuth"
import { getBadges } from "@/lib/badges"

export default function BadgesPage() {
  const [user, setUser] = useState<MockUser | null | undefined>(() => getMockUser())

  useEffect(() => {
    const handler = () => setUser(getMockUser())
    window.addEventListener("mockuser:change", handler)
    return () => window.removeEventListener("mockuser:change", handler)
  }, [])

  if (user === undefined || user === null) return null

  const badges = getBadges(user)
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Badges</h1>
        <p className="mt-1 text-sm text-white/50">
          Earned by planting, verifying, and showing up for the network.
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-white/10 bg-[#08080f] p-4 text-center">
        <div className="font-[family-name:var(--font-space-mono)] text-xl font-bold">
          {earnedCount} / {badges.length}
        </div>
        <div className="mt-1 text-xs text-white/40">badges earned</div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`rounded-xl border p-4 text-center transition-all ${
              b.earned
                ? "border-[#1db954]/30 bg-[#1db954]/[0.06]"
                : "border-white/5 bg-white/[0.02] opacity-40"
            }`}
          >
            <div
              className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full ${
                b.earned ? "bg-[#1db954]/15 text-[#1db954]" : "bg-white/5 text-white/30"
              }`}
            >
              <BadgeIcon name={b.icon} className="h-5 w-5" />
            </div>
            <div className="mb-0.5 text-xs font-bold">{b.title}</div>
            <div className="text-[10px] leading-tight text-white/40">{b.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
