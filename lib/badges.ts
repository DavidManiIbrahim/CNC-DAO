import type { MockUser } from "./mockAuth"
import type { RegisteredTree } from "./registeredTrees"

export type Badge = {
  id: string
  title: string
  description: string
  earned: boolean
  icon: "seed" | "leaf" | "shield" | "globe" | "star" | "crown"
}

/**
 * Badges are computed from the user's registered trees (now read from the
 * Convex `trees` table) and their role.
 */
export function getBadges(user: MockUser, myTrees: RegisteredTree[] = []): Badge[] {
  const treeCount = myTrees.length
  const hasVerifiedTree = myTrees.some((t) => t.status === "verified" || t.status === "minted")
  const isWalletConnected =
    !user.walletAddress.startsWith("google:") && !user.walletAddress.startsWith("email:")

  return [
    {
      id: "wallet-connected",
      title: "Wallet Connected",
      description: "Connected a wallet to CNC DAO",
      earned: isWalletConnected,
      icon: "seed",
    },
    {
      id: "first-tree",
      title: "First Tree",
      description: "Registered your first tree",
      earned: treeCount >= 1,
      icon: "leaf",
    },
    {
      id: "grove-keeper",
      title: "Grove Keeper",
      description: "Registered 5 or more trees",
      earned: treeCount >= 5,
      icon: "globe",
    },
    {
      id: "verified-planter",
      title: "Verified Planter",
      description: "Had a tree pass Nature Hero verification",
      earned: hasVerifiedTree,
      icon: "shield",
    },
    {
      id: "nature-hero",
      title: "Nature Hero",
      description: "Approved as a Nature Hero validator",
      earned: user.role === "nature_hero" || user.role === "admin",
      icon: "star",
    },
    {
      id: "admin",
      title: "CNC DAO Admin",
      description: "Platform administrator",
      earned: user.role === "admin",
      icon: "crown",
    },
  ]
}
