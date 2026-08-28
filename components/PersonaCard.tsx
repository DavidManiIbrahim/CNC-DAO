"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  getMockUser,
  setAvatar,
  resizeImage,
  type MockUser,
  type UserRole,
} from "@/lib/mockAuth"

const roleLabel: Record<UserRole, { label: string; color: string }> = {
  user: { label: "Registered User", color: "var(--muted-foreground)" },
  nature_hero_pending: { label: "Nature Hero — Pending Review", color: "#f0a830" },
  nature_hero: { label: "Nature Hero", color: "#1db954" },
  admin: { label: "Admin", color: "#a78bfa" },
}

export function PersonaCard() {
  const [user, setUser] = useState<MockUser | null | undefined>(undefined)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setUser(getMockUser())
    const handler = () => setUser(getMockUser())
    window.addEventListener("mockuser:change", handler)
    return () => window.removeEventListener("mockuser:change", handler)
  }, [])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await resizeImage(file)
      setAvatar(dataUrl)
    } finally {
      setUploading(false)
    }
  }

  if (user === undefined) return null

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-md transition-all hover:border-[#1db954]/40">
        <div>
          <div className="mb-1 text-sm font-bold text-foreground">
            Build your Nature Persona
          </div>
          <p className="text-xs text-muted-foreground">
            Connect a wallet to track your trees and set a profile photo.
          </p>
        </div>
        <Link
          href="/connect-wallet"
          className="flex-shrink-0 rounded-full bg-[#1db954] px-5 py-2.5 text-xs font-bold text-black transition-transform duration-200 hover:scale-105"
        >
          Connect
        </Link>
      </div>
    )
  }

  const role = roleLabel[user.role]

  return (
    <div className="mx-auto flex max-w-md items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-md transition-all hover:border-[#1db954]/40">
      <div className="group relative flex-shrink-0">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#1db954]/15 font-[family-name:var(--font-syne)] text-lg font-bold text-[#1db954]">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            (user.displayName || user.walletAddress).slice(0, 2).toUpperCase()
          )}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          aria-label="Upload profile photo"
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-foreground text-background shadow transition-transform hover:scale-110"
        >
          {uploading ? (
            <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-background border-t-transparent" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
              <path
                d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate font-[family-name:var(--font-syne)] text-sm font-bold text-foreground">
          {user.displayName || user.walletAddress}
        </div>
        <div className="mb-1 truncate text-xs font-semibold" style={{ color: role.color }}>
          {role.label}
        </div>
        <Link href="/dashboard" className="text-xs font-medium text-muted-foreground underline hover:text-foreground">
          View full profile
        </Link>
      </div>
    </div>
  )
}
