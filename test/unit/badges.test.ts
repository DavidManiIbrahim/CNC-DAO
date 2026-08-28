import { describe, it, expect } from "vitest"
import { getBadges } from "@/lib/badges"
import type { MockUser } from "@/lib/mockAuth"
import type { RegisteredTree } from "@/lib/registeredTrees"

describe("Badges System (Unit Tests)", () => {
  const baseUser: MockUser = {
    userId: "user_1",
    walletAddress: "8x9AbC...def1",
    role: "user",
    joinedAt: "2026-01-01T00:00:00.000Z",
  }

  it("grants 'Wallet Connected' badge when a crypto wallet address is used", () => {
    const badges = getBadges(baseUser, [])
    const walletBadge = badges.find((b) => b.id === "wallet-connected")
    expect(walletBadge?.earned).toBe(true)
  })

  it("does not grant 'Wallet Connected' badge for email/google logins", () => {
    const emailUser: MockUser = { ...baseUser, walletAddress: "email:john@example.com" }
    const googleUser: MockUser = { ...baseUser, walletAddress: "google:john@example.com" }

    expect(getBadges(emailUser, []).find((b) => b.id === "wallet-connected")?.earned).toBe(false)
    expect(getBadges(googleUser, []).find((b) => b.id === "wallet-connected")?.earned).toBe(false)
  })

  it("grants 'First Tree' badge when at least 1 tree is registered", () => {
    const tree: RegisteredTree = {
      id: "t-1",
      name: "Neem 1",
      species: "Neem",
      location: "Lagos",
      lat: 6.5,
      lng: 3.3,
      status: "pending",
    }
    const badges = getBadges(baseUser, [tree])
    expect(badges.find((b) => b.id === "first-tree")?.earned).toBe(true)
    expect(badges.find((b) => b.id === "grove-keeper")?.earned).toBe(false)
  })

  it("grants 'Grove Keeper' badge when 5 or more trees are registered", () => {
    const trees: RegisteredTree[] = Array.from({ length: 5 }, (_, i) => ({
      id: `t-${i}`,
      name: `Tree ${i}`,
      species: "Mahogany",
      location: "Abuja",
      lat: 9.0,
      lng: 7.4,
      status: "pending",
    }))
    const badges = getBadges(baseUser, trees)
    expect(badges.find((b) => b.id === "grove-keeper")?.earned).toBe(true)
  })

  it("grants 'Verified Planter' badge when a tree status is 'verified' or 'minted'", () => {
    const verifiedTree: RegisteredTree = {
      id: "t-v",
      name: "Baobab",
      species: "Baobab",
      location: "Kano",
      lat: 12.0,
      lng: 8.5,
      status: "verified",
    }
    expect(getBadges(baseUser, [verifiedTree]).find((b) => b.id === "verified-planter")?.earned).toBe(true)

    const mintedTree: RegisteredTree = { ...verifiedTree, status: "minted" }
    expect(getBadges(baseUser, [mintedTree]).find((b) => b.id === "verified-planter")?.earned).toBe(true)
  })

  it("grants 'Nature Hero' badge for heroes and admins", () => {
    const heroUser: MockUser = { ...baseUser, role: "nature_hero" }
    const adminUser: MockUser = { ...baseUser, role: "admin" }

    expect(getBadges(heroUser, []).find((b) => b.id === "nature-hero")?.earned).toBe(true)
    expect(getBadges(adminUser, []).find((b) => b.id === "nature-hero")?.earned).toBe(true)
    expect(getBadges(baseUser, []).find((b) => b.id === "nature-hero")?.earned).toBe(false)
  })

  it("grants 'CNC DAO Admin' badge strictly to admins", () => {
    const adminUser: MockUser = { ...baseUser, role: "admin" }
    expect(getBadges(adminUser, []).find((b) => b.id === "admin")?.earned).toBe(true)
    expect(getBadges(baseUser, []).find((b) => b.id === "admin")?.earned).toBe(false)
  })
})
