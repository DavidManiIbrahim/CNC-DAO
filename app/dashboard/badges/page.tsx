"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BadgesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/profile")
  }, [router])

  return (
    <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
      Redirecting to Profile & Badges...
    </div>
  )
}
