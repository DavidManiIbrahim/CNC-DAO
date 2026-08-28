import { describe, it, expect, beforeEach } from "vitest"
import {
  connectMockWallet,
  setRole,
  submitNatureHeroApplication,
  getMockUser,
} from "@/lib/mockAuth"
import { getBadges } from "@/lib/badges"

describe("E2E Simulation: User Onboarding -> Hero Application -> Admin Role Promotion", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("progresses user roles from standard user -> applicant -> Nature Hero -> Admin with correct permission bounds", () => {
    // 1. Initial user connection
    const user = connectMockWallet("SolanaPlanter777")
    expect(user.role).toBe("user")
    let badges = getBadges(user, [])
    expect(badges.find((b) => b.id === "nature-hero")?.earned).toBe(false)
    expect(badges.find((b) => b.id === "admin")?.earned).toBe(false)

    // 2. User submits Nature Hero application
    submitNatureHeroApplication()
    let current = getMockUser()
    expect(current?.role).toBe("nature_hero_pending")

    // 3. Admin verifies and approves Nature Hero
    setRole("nature_hero")
    current = getMockUser()
    expect(current?.role).toBe("nature_hero")
    badges = getBadges(current!, [])
    expect(badges.find((b) => b.id === "nature-hero")?.earned).toBe(true)
    expect(badges.find((b) => b.id === "admin")?.earned).toBe(false)

    // 4. Admin promotes user to Platform Administrator
    setRole("admin")
    current = getMockUser()
    expect(current?.role).toBe("admin")
    badges = getBadges(current!, [])
    expect(badges.find((b) => b.id === "nature-hero")?.earned).toBe(true)
    expect(badges.find((b) => b.id === "admin")?.earned).toBe(true)
  })
})
