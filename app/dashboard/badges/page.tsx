"use client"

import { BadgeIcon } from "@/components/Icons"
import { getBadges } from "@/lib/badges"
import { useSessionUser } from "@/lib/useAuth"
import { useMyTrees } from "@/lib/useTrees"

export default function BadgesPage() {
  const user = useSessionUser()
  const myTrees = useMyTrees(user?.walletAddress)

  if (!user) return null

  const badges = getBadges(user, myTrees)
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">Badges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Earned by planting, verifying, and showing up for the network.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-card p-5 text-center">
        <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-foreground">
          {earnedCount} / {badges.length}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">badges earned</div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`rounded-2xl border p-5 text-center transition-all ${
              b.earned
                ? "border-[#1db954]/30 bg-[#1db954]/[0.08]"
                : "border-border bg-card opacity-50"
            }`}
          >
            <div
              className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${
                b.earned ? "bg-[#1db954]/15 text-[#1db954]" : "bg-muted text-muted-foreground"
              }`}
            >
              <BadgeIcon name={b.icon} className="h-6 w-6" />
            </div>
            <div className="mb-1 text-sm font-bold text-foreground">{b.title}</div>
            <div className="text-xs leading-relaxed text-muted-foreground">{b.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
