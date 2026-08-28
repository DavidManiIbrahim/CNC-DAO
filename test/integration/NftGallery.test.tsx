import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"
import DashboardNFTPage from "@/app/dashboard/nft/page"

const mockUser = {
  userId: "user-1",
  walletAddress: "0x1234567890abcdef",
  role: "user",
  displayName: "NFT Planter",
}

vi.mock("@/lib/useAuth", () => ({
  useSessionUser: () => mockUser,
}))

const sampleTrees = [
  {
    id: "tree-minted-1",
    name: "Badagry Coconut Palm #01",
    species: "Coconut",
    location: "Badagry, Lagos",
    lat: 6.4167,
    lng: 2.8833,
    status: "minted",
    imageUrl: "https://example.com/tree.jpg",
  },
  {
    id: "tree-verified-1",
    name: "Yola Mango #02",
    species: "Mango",
    location: "Yola, Nigeria",
    lat: 9.2035,
    lng: 12.4954,
    status: "verified",
  },
]

vi.mock("@/lib/useTrees", () => ({
  useMyTrees: () => sampleTrees,
  useAllTrees: () => sampleTrees,
}))

describe("NFT Gallery & Proof of Stewardship", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders NFT gallery header and KPI stat counters", () => {
    render(<DashboardNFTPage />)

    expect(screen.getByText("NFT Gallery & Proof of Stewardship")).toBeInTheDocument()
    expect(screen.getByText("My Minted NFTs")).toBeInTheDocument()
    expect(screen.getByText("Ready to Mint")).toBeInTheDocument()
    expect(screen.getByText("Global On-Chain NFTs")).toBeInTheDocument()
    expect(screen.getByText("Solana")).toBeInTheDocument()
  })

  it("renders Impact Certificate cards with on-chain metadata", () => {
    render(<DashboardNFTPage />)

    expect(screen.getAllByText("Badagry Coconut Palm #01").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Yola Mango #02").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Solana SPL").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Badagry, Lagos").length).toBeGreaterThan(0)
    expect(screen.getAllByText(/View on Global Registry Map/i).length).toBeGreaterThan(0)
  })

  it("renders global verified NFT stream", () => {
    render(<DashboardNFTPage />)

    expect(screen.getByText("Global Verified NFT Stream")).toBeInTheDocument()
    expect(screen.getAllByText("NFT Verified").length).toBeGreaterThan(0)
  })
})
