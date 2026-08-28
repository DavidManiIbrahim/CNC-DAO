import { SPECIES_PHOTOS, DEFAULT_TREE_PHOTO } from "./treePhotos"

export type RegisteredTree = {
  id: string
  name: string
  species: string
  location: string
  lat: number
  lng: number
  imageUrl?: string
  status: "verified" | "minted" | "pending"
}

// Real coordinates and botanical photos for the seed trees.
const baseTrees: RegisteredTree[] = [
  {
    id: "neem-001",
    name: "Neem tree #001",
    species: "Neem",
    location: "Lagos, Nigeria",
    lat: 6.5244,
    lng: 3.3792,
    imageUrl: SPECIES_PHOTOS.neem,
    status: "minted",
  },
  {
    id: "mango-001",
    name: "Mango tree #001",
    species: "Mango",
    location: "Yola, Nigeria",
    lat: 9.2035,
    lng: 12.4954,
    imageUrl: SPECIES_PHOTOS.mango,
    status: "minted",
  },
]

// Kept for anything importing the old name directly.
export const registeredTrees = baseTrees

export function getSeedTrees(): RegisteredTree[] {
  return [...baseTrees]
}

export function isSeedTree(id: string): boolean {
  return baseTrees.some((t) => t.id === id)
}

const USER_TREES_KEY = "cncdao_user_trees"

/**
 * Trees submitted via the /tree-reg form, stored in localStorage.
 */
export function getUserTrees(): RegisteredTree[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(USER_TREES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getAllTrees(): RegisteredTree[] {
  return [...baseTrees, ...getUserTrees()]
}

export function addUserTree(tree: Omit<RegisteredTree, "id">) {
  if (typeof window === "undefined") return
  const existing = getUserTrees()
  const newTree: RegisteredTree = {
    ...tree,
    imageUrl: tree.imageUrl || SPECIES_PHOTOS[tree.species?.toLowerCase()] || DEFAULT_TREE_PHOTO,
    id: `user-${Date.now()}`,
  }
  localStorage.setItem(USER_TREES_KEY, JSON.stringify([...existing, newTree]))
  window.dispatchEvent(new Event("trees:change"))
  return newTree
}

/**
 * Approve/reject actions for the Nature Hero validation queue.
 */
export function updateTreeStatus(id: string, status: RegisteredTree["status"]) {
  if (typeof window === "undefined") return
  const existing = getUserTrees()
  const updated = existing.map((t) => (t.id === id ? { ...t, status } : t))
  localStorage.setItem(USER_TREES_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event("trees:change"))
}

export function removeUserTree(id: string) {
  if (typeof window === "undefined") return
  const existing = getUserTrees()
  localStorage.setItem(USER_TREES_KEY, JSON.stringify(existing.filter((t) => t.id !== id)))
  window.dispatchEvent(new Event("trees:change"))
}

// Rough equirectangular projection — turns lat/lng into the x/y percentage
// positions TreeMap's flat abstract grid uses for pin placement.
export function latLngToXY(lat: number, lng: number) {
  return {
    x: ((lng + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  }
}
