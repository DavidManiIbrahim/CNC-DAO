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
 * and falls back to the local seed trees + localStorage submissions while
 * the DB is loading, empty, or unreachable so the maps never appear blank.
 */
export function useAllTrees(): RegisteredTree[] {
  const dbTrees = useQuery(api.trees.listAll)
  const [localTrees, setLocalTrees] = useState<RegisteredTree[]>(() => getAllTrees())

  useEffect(() => {
    const refresh = () => setLocalTrees(getAllTrees())
    refresh()
    window.addEventListener("trees:change", refresh)
    return () => window.removeEventListener("trees:change", refresh)
  }, [])

  if (dbTrees === undefined) return localTrees
  if (dbTrees.length > 0) {
    const dbMapped = dbTrees.map(toRegisteredTree)
    // Combine with any local trees that aren't yet in db
    const existingIds = new Set(dbMapped.map((t) => t.id))
    const uniqueLocal = localTrees.filter((t) => !existingIds.has(t.id))
    return [...dbMapped, ...uniqueLocal]
  }
  return localTrees
}

/**
 * The signed-in user's own trees. Reads the Convex `trees` table by wallet
 * address, falling back to localStorage submissions when the DB is empty or
 * unavailable.
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

  // If DB trees are available, find trees matching user address
  if (allDbTrees && allDbTrees.length > 0) {
    const matchedDb = allDbTrees.filter((t) => {
      if (!walletAddress && !normalizedUser) return false
      const tNorm = normalizeAddress(t.walletAddress)
      return (
        t.walletAddress === walletAddress ||
        (normalizedUser.length > 0 && tNorm === normalizedUser) ||
        (normalizedUser.length > 0 && (tNorm.includes(normalizedUser) || normalizedUser.includes(tNorm)))
      )
    }).map(toRegisteredTree)

    if (matchedDb.length > 0) {
      const dbIds = new Set(matchedDb.map((t) => t.id))
      const uniqueLocal = localTrees.filter((t) => !dbIds.has(t.id))
      return [...matchedDb, ...uniqueLocal]
    }
  }

  return localTrees
}
