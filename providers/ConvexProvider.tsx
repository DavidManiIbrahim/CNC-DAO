"use client"

import { useEffect, useState, type ComponentType, type ReactNode } from "react"

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [Inner, setInner] = useState<ComponentType<{ children: ReactNode }> | null>(null)

  useEffect(() => {
    import("./ConvexClientInner").then((mod) => setInner(() => mod.default))
  }, [])

  // Don't render children until the provider component is loaded.
  // Rendering children before ConvexProvider is ready causes
  // "Could not find Convex client" errors from any page using
  // useMutation / useQuery.
  if (!Inner) return null
  return <Inner>{children}</Inner>
}
