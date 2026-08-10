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
