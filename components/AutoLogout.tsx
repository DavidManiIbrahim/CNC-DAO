"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { getMockUser, disconnectMockWallet } from "@/lib/mockAuth"

/**
 * Logs the user out whenever the app routes to the landing page (/).
 * Visiting the public home page clears the local session and, if present,
 * the Google (next-auth) session.
 */
export function AutoLogout() {
  const pathname = usePathname()
  const { data: googleSession, status } = useSession()

  useEffect(() => {
    if (pathname !== "/") return
    if (status === "loading") return

    const hasMock = Boolean(getMockUser())
    if (hasMock) disconnectMockWallet()
    if (googleSession) {
      signOut({ callbackUrl: "/" })
    }
  }, [pathname, status, googleSession])

  return null
}
