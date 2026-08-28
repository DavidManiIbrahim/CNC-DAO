import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { LiveStats } from "@/components/LiveStats"

// Mock convex/react
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
}))

import { useQuery } from "convex/react"

describe("LiveStats Component (Integration Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders 0 active campaigns when database contains 0 campaigns", () => {
    // Return empty trees and empty campaigns
    vi.mocked(useQuery).mockImplementation(() => {
      return []
    })

    render(<LiveStats variant="grid" />)

    expect(screen.getByText("Active Campaigns")).toBeInTheDocument()
    // Should display exact 0 for all stats, NOT 12+ or 1,240+
    const zeroes = screen.getAllByText("0")
    expect(zeroes.length).toBe(4)
    expect(screen.getByText("0 active planting regions")).toBeInTheDocument()
  })

  it("renders exact dynamic database tree counts and statuses", () => {
    const mockTrees = [
      { _id: "1", name: "Tree 1", status: "verified", location: "Lagos, Nigeria" },
      { _id: "2", name: "Tree 2", status: "minted", location: "Abuja, Nigeria" },
      { _id: "3", name: "Tree 3", status: "pending", location: "Accra, Ghana" },
    ]
    const mockCampaigns = [
      { _id: "c1", name: "Mangrove Campaign", participantLimit: 50, joined: 10 },
      { _id: "c2", name: "Savannah Campaign", participantLimit: 100, joined: 25 },
    ]

    let callCount = 0
    vi.mocked(useQuery).mockImplementation(() => {
      callCount++
      if (callCount % 2 === 1) return mockTrees as any
      return mockCampaigns as any
    })

    render(<LiveStats variant="grid" />)

    expect(screen.getByText("Trees on Record")).toBeInTheDocument()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("Verified On-Chain")).toBeInTheDocument()
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Proof-of-Stewardship NFTs")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("renders in compact and bar variants", () => {
    vi.mocked(useQuery).mockReturnValue([])

    const { rerender } = render(<LiveStats variant="compact" />)
    expect(screen.getByText("Trees on Record")).toBeInTheDocument()

    rerender(<LiveStats variant="bar" />)
    expect(screen.getByText("Trees on Record")).toBeInTheDocument()
  })
})
