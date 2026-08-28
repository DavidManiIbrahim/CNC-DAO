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
    status: t.status,
  }
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
  if (dbTrees.length > 0) return dbTrees.map(toRegisteredTree)
  return localTrees
}

/**
 * The signed-in user's own trees. Reads the Convex `trees` table by wallet
 * address, falling back to localStorage submissions when the DB is empty or
 * unavailable.
 */
export function useMyTrees(walletAddress?: string | null): RegisteredTree[] {
  const dbTrees = useQuery(
    api.trees.listMine,
    walletAddress ? { walletAddress } : "skip",
  )
  const [localTrees, setLocalTrees] = useState<RegisteredTree[]>(() => getUserTrees())

  useEffect(() => {
    const refresh = () => setLocalTrees(getUserTrees())
    refresh()
    window.addEventListener("trees:change", refresh)
    return () => window.removeEventListener("trees:change", refresh)
  }, [])

  if (dbTrees === undefined || dbTrees.length === 0) return localTrees
  return dbTrees.map(toRegisteredTree)
}
