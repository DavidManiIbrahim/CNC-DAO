"use client"

import { useEffect, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import {
  getAllTrees,
  getUserTrees,
  isSeedTree,
  type RegisteredTree,
} from "@/lib/registeredTrees"

function toRegisteredTree(t: Doc<"trees">): RegisteredTree {
  return {
    id: t._id,
    name: t.name,
    species: t.species,
    location: t.location,
    lat: t.lat,
    lng: t.lng,
    imageUrl: t.imageUrl,
    status: t.status,
  }
}

function normalizeAddress(addr?: string | null): string {
  if (!addr) return ""
  return addr.toLowerCase().replace(/^(google:|email:)/, "").trim()
}

/**
 * All trees for the public registry/maps. Sources the Convex `trees` table
 * and returns the exact live database count.
 */
export function useAllTrees(): RegisteredTree[] {
  const dbTrees = useQuery(api.trees.listAll)
  const [localTrees, setLocalTrees] = useState<RegisteredTree[]>(() => getUserTrees())

  useEffect(() => {
    const refresh = () => setLocalTrees(getUserTrees())
    refresh()
    window.addEventListener("trees:change", refresh)
    return () => window.removeEventListener("trees:change", refresh)
  }, [])

  if (dbTrees !== undefined) {
    return dbTrees.map(toRegisteredTree)
  }
  return localTrees
}

/**
 * The signed-in user's own trees. Reads the Convex `trees` table by wallet
 * address, with normalized identity matching.
 */
export function useMyTrees(walletAddress?: string | null): RegisteredTree[] {
  const allDbTrees = useQuery(api.trees.listAll)
  const [localTrees, setLocalTrees] = useState<RegisteredTree[]>(() => getUserTrees())

  useEffect(() => {
    const refresh = () => setLocalTrees(getUserTrees())
    refresh()
    window.addEventListener("trees:change", refresh)
    return () => window.removeEventListener("trees:change", refresh)
  }, [])

  const normalizedUser = normalizeAddress(walletAddress)

  if (allDbTrees !== undefined) {
    if (!walletAddress && !normalizedUser) return []
    return allDbTrees.filter((t) => {
      const tNorm = normalizeAddress(t.walletAddress)
      return (
        t.walletAddress === walletAddress ||
        (normalizedUser.length > 0 && tNorm === normalizedUser) ||
        (normalizedUser.length > 0 && (tNorm.includes(normalizedUser) || normalizedUser.includes(tNorm)))
      )
    }).map(toRegisteredTree)
  }

  return localTrees
}
