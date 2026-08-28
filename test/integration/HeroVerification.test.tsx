import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import HeroVerificationPage from "@/app/dashboard/hero-verification/page"

// Mock auth hook
const mockUser = {
  userId: "admin-1",
  walletAddress: "admin@cncdao.org",
  role: "admin",
  displayName: "Super Admin",
}

vi.mock("@/lib/useAuth", () => ({
  useSessionUser: () => mockUser,
}))

// Mock Convex
const mockSetApplicationStatus = vi.fn()
let mockApplications: any[] = []

vi.mock("convex/react", () => ({
  useQuery: () => mockApplications,
  useMutation: () => mockSetApplicationStatus,
}))

vi.mock("@/convex/_generated/api", () => ({
  api: {
    natureHeroes: {
      listApplications: "natureHeroes:listApplications",
      setApplicationStatus: "natureHeroes:setApplicationStatus",
    },
  },
}))

describe("Nature Hero Verification Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApplications = [
      {
        _id: "app-1",
        userId: "user-123",
        fullName: "Amina Yusuf",
        email: "amina@ecorangers.ng",
        cityRegion: "Kano",
        country: "Nigeria",
        motivation: "I have planted over 500 trees in Kano and want to help verify Sahel belt reforestation.",
        experience: "5 years forestry volunteer",
        status: "pending",
        walletAddress: "0x1234567890abcdef",
        submittedAt: new Date().toISOString(),
      },
    ]
  })

  it("renders pending Nature Hero applications for admin", () => {
    render(<HeroVerificationPage />)

    expect(screen.getByText("Nature Hero Verification")).toBeInTheDocument()
    expect(screen.getByText("Amina Yusuf")).toBeInTheDocument()
    expect(screen.getByText(/Kano, Nigeria/)).toBeInTheDocument()
    expect(screen.getByText(/I have planted over 500 trees/)).toBeInTheDocument()
    expect(screen.getByText("Approve")).toBeInTheDocument()
    expect(screen.getByText("Reject")).toBeInTheDocument()
  })

  it("handles application approval correctly", () => {
    render(<HeroVerificationPage />)

    const approveBtn = screen.getByText("Approve")
    fireEvent.click(approveBtn)

    expect(mockSetApplicationStatus).toHaveBeenCalledWith({
      adminId: "admin-1",
      applicationId: "app-1",
      status: "approved",
    })
  })

  it("handles application rejection correctly", () => {
    render(<HeroVerificationPage />)

    const rejectBtn = screen.getByText("Reject")
    fireEvent.click(rejectBtn)

    expect(mockSetApplicationStatus).toHaveBeenCalledWith({
      adminId: "admin-1",
      applicationId: "app-1",
      status: "rejected",
    })
  })
})
