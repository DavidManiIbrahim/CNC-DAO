import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  getMockUser,
  setMockUser,
  connectMockWallet,
  setDisplayName,
  setBio,
  setRole,
  disconnectMockWallet,
  type MockUser,
} from "@/lib/mockAuth"

describe("Mock Auth & Session State (Unit Tests)", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("returns null when no mock user is stored", () => {
    expect(getMockUser()).toBeNull()
  })

  it("stores and retrieves mock user with event dispatching", () => {
    const changeListener = vi.fn()
    window.addEventListener("mockuser:change", changeListener)

    const user: MockUser = {
      userId: "u-1",
      walletAddress: "8x9A...123",
      role: "user",
      displayName: "Alice",
      joinedAt: new Date().toISOString(),
    }

    setMockUser(user)
    expect(getMockUser()).toEqual(user)
    expect(changeListener).toHaveBeenCalled()

    window.removeEventListener("mockuser:change", changeListener)
  })

  it("creates a mock wallet connection if none exists", () => {
    const user = connectMockWallet("SolanaWallet123", "user_100")
    expect(user.walletAddress).toBe("SolanaWallet123")
    expect(user.userId).toBe("user_100")
    expect(user.role).toBe("user")
  })

  it("updates display name, bio, and role independently", () => {
    connectMockWallet("SolanaWallet123")

    setDisplayName("PlantMaster")
    expect(getMockUser()?.displayName).toBe("PlantMaster")

    setBio("Restoring Nigerian mangroves.")
    expect(getMockUser()?.bio).toBe("Restoring Nigerian mangroves.")

    setRole("nature_hero")
    expect(getMockUser()?.role).toBe("nature_hero")
  })

  it("disconnects wallet by clearing localStorage and emitting change event", () => {
    connectMockWallet("SolanaWallet123")
    expect(getMockUser()).not.toBeNull()

    const changeListener = vi.fn()
    window.addEventListener("mockuser:change", changeListener)

    disconnectMockWallet()
    expect(getMockUser()).toBeNull()
    expect(changeListener).toHaveBeenCalled()

    window.removeEventListener("mockuser:change", changeListener)
  })
})
