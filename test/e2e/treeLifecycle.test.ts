import { describe, it, expect, beforeEach } from "vitest"
import { connectMockWallet, setRole } from "@/lib/mockAuth"
import { addUserTree, updateTreeStatus, getUserTrees } from "@/lib/registeredTrees"
import { getBadges } from "@/lib/badges"

describe("E2E Simulation: Tree Registration -> Verification -> Minting -> Badges Lifecycle", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("completes full lifecycle from tree submission to verified badge reward", () => {
    // Step 1: User connects wallet
    const user = connectMockWallet("SolanaWalletABC123", "user_99")
    expect(user.role).toBe("user")

    let myTrees = getUserTrees()
    let badges = getBadges(user, myTrees)

    // Initial badges check
    expect(badges.find((b) => b.id === "wallet-connected")?.earned).toBe(true)
    expect(badges.find((b) => b.id === "first-tree")?.earned).toBe(false)
    expect(badges.find((b) => b.id === "verified-planter")?.earned).toBe(false)

    // Step 2: User registers a tree on /tree-reg
    const registeredTree = addUserTree({
      name: "Mangrove Tree #042",
      species: "Red Mangrove",
      location: "Port Harcourt, Rivers, Nigeria",
      lat: 4.8156,
      lng: 7.0498,
      status: "pending",
    })

    expect(registeredTree).toBeDefined()
    myTrees = getUserTrees()
    expect(myTrees.length).toBe(1)
    expect(myTrees[0].status).toBe("pending")

    // Badge updates: First Tree earned, but not yet verified
    badges = getBadges(user, myTrees)
    expect(badges.find((b) => b.id === "first-tree")?.earned).toBe(true)
    expect(badges.find((b) => b.id === "verified-planter")?.earned).toBe(false)

    // Step 3: Nature Hero / Validator reviews submission in verification queue
    updateTreeStatus(registeredTree!.id, "verified")
    myTrees = getUserTrees()
    expect(myTrees[0].status).toBe("verified")

    // Badge updates: Verified Planter earned!
    badges = getBadges(user, myTrees)
    expect(badges.find((b) => b.id === "verified-planter")?.earned).toBe(true)

    // Step 4: Minting Proof-of-Stewardship NFT
    updateTreeStatus(registeredTree!.id, "minted")
    myTrees = getUserTrees()
    expect(myTrees[0].status).toBe("minted")

    badges = getBadges(user, myTrees)
    expect(badges.find((b) => b.id === "verified-planter")?.earned).toBe(true)
  })
})
