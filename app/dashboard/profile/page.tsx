"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { setMockUser, resizeImage, roleLabels, type MockUser } from "@/lib/mockAuth"
import { useSessionUser } from "@/lib/useAuth"
import { useMyTrees } from "@/lib/useTrees"
import { getBadges } from "@/lib/badges"
import { BadgeIcon } from "@/components/Icons"
import { Camera, Check, User, Sparkles, Award, Shield } from "lucide-react"

export default function ProfilePage() {
  const user = useSessionUser()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState("")
  const [bioDraft, setBioDraft] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const updateProfile = useMutation(api.users.updateProfile)

  const myTrees = useMyTrees(user?.walletAddress)

  if (!user) return null
  const currentUser = user

  const badges = getBadges(user, myTrees)
  const earnedCount = badges.filter((b) => b.earned).length

  function applyUser(u: any) {
    const updated: MockUser = {
      userId: u._id,
      walletAddress: u.walletAddress ?? currentUser.walletAddress,
      role: u.role as MockUser["role"],
      displayName: u.displayName ?? undefined,
      bio: u.bio ?? undefined,
      avatar: u.avatar ?? undefined,
      joinedAt: u.joinedAt,
    }
    setMockUser(updated)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentUser.userId) return
    setUploading(true)
    try {
      const dataUrl = await resizeImage(file)
      const updated = await updateProfile({ userId: currentUser.userId as any, avatar: dataUrl })
      applyUser(updated)
    } finally {
      setUploading(false)
    }
  }

  async function saveEdits() {
    if (!currentUser.userId) return
    setSaving(true)
    try {
      const updated = await updateProfile({
        userId: currentUser.userId as any,
        displayName: nameDraft,
        bio: bioDraft,
      })
      applyUser(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
          Member Profile & Achievements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your network identity, credentials, and earned proof-of-stewardship badges.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-md">
        <div className="mb-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="group relative flex-shrink-0">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#1db954]/15 font-[family-name:var(--font-syne)] text-2xl font-bold text-[#1db954]">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                (user.displayName || user.walletAddress).slice(0, 2).toUpperCase()
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Upload profile photo"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-foreground text-background shadow transition-transform hover:scale-110"
            >
              {uploading ? (
                <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-background border-t-transparent" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>

          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Display name"
                className="mb-1 w-full max-w-xs rounded-xl border border-border bg-input px-3 py-1.5 text-sm font-bold text-foreground outline-none focus:border-[#1db954]/60"
              />
            ) : (
              <div className="truncate font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                {user.displayName || user.walletAddress}
              </div>
            )}
            <div className="text-xs font-mono text-muted-foreground">{user.walletAddress}</div>
            <div className="mt-1 text-xs font-semibold" style={{ color: roleLabels[user.role].color }}>
              {roleLabels[user.role].label}
            </div>
          </div>

          <button
            onClick={() => {
              if (editing) {
                saveEdits()
              } else {
                setNameDraft(user.displayName ?? "")
                setBioDraft(user.bio ?? "")
                setEditing(true)
              }
            }}
            disabled={saving}
            className="flex-shrink-0 rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
          >
            {editing ? (saving ? "Saving…" : "Save") : "Edit profile"}
          </button>
        </div>

        {editing ? (
          <textarea
            value={bioDraft}
            onChange={(e) => setBioDraft(e.target.value)}
            placeholder="Add a short bio — where you plant, what you care about, etc."
            rows={3}
            className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-[#1db954]/60"
          />
        ) : user.bio ? (
          <p className="text-sm leading-relaxed text-foreground">{user.bio}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No bio added yet — click Edit profile to add one.</p>
        )}

        {user.role === "nature_hero_pending" && (
          <div className="mt-6 rounded-2xl border border-[#f0a830]/30 bg-[#f0a830]/10 px-4 py-3 text-sm text-[#f0a830]">
            Your Nature Hero application is currently under admin review.
          </div>
        )}
        {user.role === "user" && (
          <div className="mt-6 rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            Want to help verify community trees?{" "}
            <Link href="/nature-heroes/apply" className="font-semibold text-[#1db954] underline hover:text-[#1db954]/80">
              Apply to become a Nature Hero
            </Link>
            .
          </div>
        )}
      </div>

      {/* Integrated Badges & Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#1db954]" />
            <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
              Earned Badges & Network Achievements
            </h2>
          </div>
          <span className="rounded-full bg-[#1db954]/15 px-3 py-1 font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1db954]">
            {earnedCount} / {badges.length} Earned
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 transition-all ${
                b.earned
                  ? "border-[#1db954]/30 bg-[#1db954]/[0.06] shadow-sm"
                  : "border-border bg-card/60 opacity-60"
              }`}
            >
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
                  b.earned ? "bg-[#1db954]/15 text-[#1db954]" : "bg-muted text-muted-foreground"
                }`}
              >
                <BadgeIcon name={b.icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-bold text-foreground">{b.title}</span>
                  {b.earned && (
                    <span className="rounded-full bg-[#1db954]/20 px-1.5 py-0.2 text-[9px] font-bold text-[#1db954]">
                      Earned
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
