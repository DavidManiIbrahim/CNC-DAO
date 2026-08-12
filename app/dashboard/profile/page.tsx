"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { setMockUser, resizeImage, roleLabels, type MockUser } from "@/lib/mockAuth"
import { useSessionUser } from "@/lib/useAuth"

export default function ProfilePage() {
  const user = useSessionUser()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState("")
  const [bioDraft, setBioDraft] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const updateProfile = useMutation(api.users.updateProfile)

  if (!user) return null
  const currentUser = user

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
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Profile</h1>
        <p className="mt-1 text-sm text-white/50">
          How you appear across the CNC DAO network.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#12121c] to-[#08080f] p-8">
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
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#08080f] bg-white text-[#0b0a12] transition-transform hover:scale-110"
            >
              {uploading ? (
                <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-[#0b0a12] border-t-transparent" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                  <path
                    d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8" />
                </svg>
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
                className="mb-1 w-full max-w-xs rounded-lg border border-white/10 bg-[#050508] px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-[#1db954]/60"
              />
            ) : (
              <div className="truncate font-[family-name:var(--font-syne)] text-lg font-bold">
                {user.displayName || user.walletAddress}
              </div>
            )}
            <div className="text-xs text-white/40">{user.walletAddress}</div>
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
            className="flex-shrink-0 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            {editing ? (saving ? "Saving…" : "Save") : "Edit profile"}
          </button>
        </div>
        {editing ? (
          <textarea
            value={bioDraft}
            onChange={(e) => setBioDraft(e.target.value)}
            placeholder="Add a short bio — where you plant, what you care about, etc."
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-[#050508] px-3 py-2 text-sm text-white outline-none focus:border-[#1db954]/60"
          />
        ) : user.bio ? (
          <p className="text-sm text-white/60">{user.bio}</p>
        ) : (
          <p className="text-sm text-white/30">No bio yet — click Edit profile to add one.</p>
        )}

        {user.role === "nature_hero_pending" && (
          <div className="mt-5 rounded-lg border border-[#f0a830]/30 bg-[#f0a830]/10 px-4 py-3 text-sm text-[#f0a830]">
            Your Nature Hero application is under admin review.
          </div>
        )}
        {user.role === "user" && (
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
            Want to help verify trees?{" "}
            <Link href="/nature-heroes/apply" className="text-[#1db954] underline">
              Apply to become a Nature Hero
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  )
}
