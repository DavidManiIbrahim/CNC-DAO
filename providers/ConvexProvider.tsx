"use client"

import { useEffect, useState, type ComponentType, type ReactNode } from "react"

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [Inner, setInner] = useState<ComponentType<{ children: ReactNode }> | null>(null)

  useEffect(() => {
    import("./ConvexClientInner").then((mod) => setInner(() => mod.default))
  }, [])

  if (!Inner) return <>{children}</>
  return <Inner>{children}</Inner>
}
