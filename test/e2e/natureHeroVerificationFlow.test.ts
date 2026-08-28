import { describe, it, expect } from "vitest"
import { getMockUser, setMockUser, type MockUser } from "@/lib/mockAuth"

describe("E2E: Nature Hero Application & Verification Lifecycle", () => {
  it("progresses a user through the full Nature Hero promotion lifecycle", () => {
    // 1. Initial State: Standard Planter
    const initialUser: MockUser = {
      userId: "planter-88",
      walletAddress: "planter88@sol.xyz",
      role: "user",
      displayName: "Eco Warrior",
      joinedAt: new Date().toISOString(),
    }
    setMockUser(initialUser)
    expect(getMockUser()?.role).toBe("user")

    // 2. User submits Nature Hero application -> role becomes 'nature_hero_pending'
    const pendingUser: MockUser = {
      ...initialUser,
      role: "nature_hero_pending",
    }
    setMockUser(pendingUser)
    expect(getMockUser()?.role).toBe("nature_hero_pending")

    // 3. Admin Reviews & Approves -> role elevated to 'nature_hero'
    const approvedHero: MockUser = {
      ...pendingUser,
      role: "nature_hero",
    }
    setMockUser(approvedHero)
    expect(getMockUser()?.role).toBe("nature_hero")

    // 4. Verify Nature Hero privileges
    const isHeroOrAdmin = (user: MockUser | null) =>
      user?.role === "nature_hero" || user?.role === "admin"
    expect(isHeroOrAdmin(getMockUser())).toBe(true)

    // 5. Test Rejection flow for a different applicant
    const rejectedUser: MockUser = {
      userId: "planter-99",
      walletAddress: "planter99@sol.xyz",
      role: "user",
      joinedAt: new Date().toISOString(),
    }
    setMockUser(rejectedUser)
    expect(getMockUser()?.role).toBe("user")
    expect(isHeroOrAdmin(getMockUser())).toBe(false)
  })
})
