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

export function WalletButton({ className = "" }: { className?: string }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { data: googleSession } = useSession()

  useEffect(() => {
    setUser(getMockUser())
    const handler = () => setUser(getMockUser())
    window.addEventListener("mockuser:change", handler)
    return () => window.removeEventListener("mockuser:change", handler)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Determine display name & avatar: prefer Google session, fall back to mock user
  const displayName = googleSession?.user?.name || user?.displayName || user?.walletAddress || null
  const avatarUrl = googleSession?.user?.image || user?.avatar || null
  const initials = displayName?.slice(0, 2).toUpperCase() || "?"

  if (!googleSession && !user) {
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
        className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/20"
      >
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#1db954]/25 text-[10px] font-bold text-[#1db954]">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <span className="hidden text-xs font-medium text-white sm:block">
          {displayName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d14] shadow-xl">
          <button
            onClick={() => {
              setOpen(false)
              router.push("/dashboard")
            }}
            className="block w-full px-4 py-3 text-left text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setOpen(false)
              router.push("/dashboard")
            }}
            className="block w-full px-4 py-3 text-left text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
          >
            Edit profile
          </button>
          <hr className="border-white/10" />
          {googleSession && (
            <button
              onClick={() => {
                setOpen(false)
                signOut({ callbackUrl: "/" })
              }}
              className="block w-full px-4 py-3 text-left text-sm text-red-400/80 transition-colors hover:bg-white/5 hover:text-red-400"
            >
              Sign out (Google)
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                disconnectMockWallet()
                setOpen(false)
                router.push("/")
              }}
              className="block w-full border-t border-white/10 px-4 py-3 text-left text-sm text-red-400/80 transition-colors hover:bg-white/5 hover:text-red-400"
            >
              Disconnect Wallet
            </button>
          )}
        </div>
      )}
    </div>
  )
}
