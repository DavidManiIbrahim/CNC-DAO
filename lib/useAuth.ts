"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { getMockUser, type MockUser } from "@/lib/mockAuth"

/**
 * True when the user is authenticated via either a Google session
 * (next-auth) or a session pointer in localStorage.
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
 * The current user for role-gated UI.
 *
 * The Convex `users` table is the source of truth for role/profile. The
 * localStorage cache is only a session pointer (userId + wallet) and an
 * offline/loading fallback — the returned role, display name, bio, and
 * avatar come from the DB whenever the user exists there. Falls back to a
 * session synthesized from the Google (next-auth) session otherwise, so
 * Google sign-ins work everywhere the mock user is read.
 */
export function useSessionUser(): MockUser | null {
  const { data: googleSession } = useSession()
  const [user, setUser] = useState<MockUser | null>(() => getMockUser())
  const sessionUserId = user?.userId
  const dbUser = useQuery(
    api.users.get,
    sessionUserId ? { userId: sessionUserId as any } : "skip",
  )

  useEffect(() => {
    const refresh = () => setUser(getMockUser())
    refresh()
    window.addEventListener("mockuser:change", refresh)
    return () => window.removeEventListener("mockuser:change", refresh)
  }, [])

  if (user?.userId && dbUser) {
    return {
      userId: dbUser._id,
      walletAddress: dbUser.walletAddress ?? user.walletAddress,
      role: dbUser.role as MockUser["role"],
      displayName: dbUser.displayName ?? dbUser.name ?? undefined,
      bio: dbUser.bio ?? undefined,
      avatar: dbUser.avatar ?? undefined,
      joinedAt: dbUser.joinedAt,
    }
  }

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
