"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { getMockUser, type MockUser } from "@/lib/mockAuth"

/**
 * True when the user is authenticated via either a Google session
 * (next-auth) or a mock wallet user in localStorage. Mirrors the check
 * used by WalletButton.
 */
export function useIsAuthenticated() {
  const { data: googleSession } = useSession()
  const [user, setUser] = useState<MockUser | null>(() => getMockUser())

  useEffect(() => {
    setUser(getMockUser())
    const handler = () => setUser(getMockUser())
    window.addEventListener("mockuser:change", handler)
    return () => window.removeEventListener("mockuser:change", handler)
  }, [])

  return Boolean(googleSession || user)
}

/**
 * The current user for role-gated UI. Prefers the localStorage mock user;
 * falls back to a session synthesized from the Google (next-auth) session
 * so Google sign-ins work everywhere the mock user is read (e.g. the
 * dashboard shell) without bouncing the user to the home page.
 */
export function useSessionUser(): MockUser | null {
  const { data: googleSession } = useSession()
  const [user, setUser] = useState<MockUser | null>(() => getMockUser())

  useEffect(() => {
    const refresh = () => setUser(getMockUser())
    refresh()
    window.addEventListener("mockuser:change", refresh)
    return () => window.removeEventListener("mockuser:change", refresh)
  }, [])

  if (user) return user

  if (googleSession?.user) {
    return {
      walletAddress: `google:${googleSession.user.email ?? "user"}`,
      role: "user",
      displayName: googleSession.user.name ?? undefined,
      avatar: googleSession.user.image ?? undefined,
      joinedAt: new Date().toISOString(),
    }
  }

  return null
}
