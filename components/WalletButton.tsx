"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  getMockUser,
  disconnectMockWallet,
  type MockUser,
} from "@/lib/mockAuth"
import { useSessionUser } from "@/lib/useAuth"

function formatUserLabel(raw: string | undefined | null): string {
  if (!raw) return "User"
  let clean = raw.replace(/^(email|google):/i, "")
  if (clean.includes("@")) {
    clean = clean.split("@")[0]
  }
  if (clean.length > 18 && !clean.includes(" ")) {
    return `${clean.slice(0, 4)}...${clean.slice(-4)}`
  }
  return clean
}

export function WalletButton({ className = "" }: { className?: string }) {
  const sessionUser = useSessionUser()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { data: googleSession } = useSession()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Determine display name & avatar: prefer database displayName, then google name, then formatted username
  const rawName =
    sessionUser?.displayName ||
    googleSession?.user?.name ||
    sessionUser?.walletAddress ||
    googleSession?.user?.email ||
    null

  const displayName = rawName ? formatUserLabel(rawName) : null
  const avatarUrl = googleSession?.user?.image || sessionUser?.avatar || null
  const initials = displayName?.slice(0, 2).toUpperCase() || "U"

  if (!googleSession && !sessionUser) {
    return (
      <Link
        href="/connect-wallet"
        className={`rounded-full bg-[#1db954] px-4 py-2 text-xs font-medium text-white transition-transform duration-200 hover:scale-105 sm:px-5 sm:py-2.5 sm:text-sm ${className}`}
      >
        Connect Wallet
      </Link>
    )
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-muted py-1.5 pl-1.5 pr-3 transition-colors hover:bg-muted"
      >
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#1db954]/25 text-[10px] font-bold text-[#1db954]">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <span className="hidden text-xs font-medium text-foreground sm:block">
          {displayName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-border bg-overlay shadow-xl">
          <button
            onClick={() => {
              setOpen(false)
              router.push("/dashboard")
            }}
            className="block w-full px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setOpen(false)
              router.push("/dashboard/profile")
            }}
            className="block w-full px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Edit profile
          </button>
          <hr className="border-border" />
          {googleSession && (
            <button
              onClick={() => {
                setOpen(false)
                signOut({ callbackUrl: "/" })
              }}
              className="block w-full px-4 py-3 text-left text-sm text-red-400/80 transition-colors hover:bg-muted hover:text-red-400"
            >
              {sessionUser ? "Sign out (Google)" : "Logout"}
            </button>
          )}
          {sessionUser && (
            <button
              onClick={() => {
                disconnectMockWallet()
                setOpen(false)
                router.push("/")
              }}
              className="block w-full border-t border-border px-4 py-3 text-left text-sm text-red-400/80 transition-colors hover:bg-muted hover:text-red-400"
            >
              Disconnect / Logout
            </button>
          )}
        </div>
      )}
    </div>
  )
}
