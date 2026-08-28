import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import TreeVerificationPage from "@/app/dashboard/verification/page"

// Mock auth hook
const mockUser = {
  userId: "verifier-1",
  walletAddress: "hero@cncdao.org",
  role: "nature_hero",
  displayName: "Nature Hero John",
}

vi.mock("@/lib/useAuth", () => ({
  useSessionUser: () => mockUser,
}))

// Mock Convex mutations and queries
const mockUpdateTreeStatus = vi.fn()
let mockTrees: any[] = []

vi.mock("convex/react", () => ({
  useQuery: () => mockTrees,
  useMutation: () => mockUpdateTreeStatus,
}))

vi.mock("@/convex/_generated/api", () => ({
  api: {
    trees: {
      listAll: "trees:listAll",
      listMine: "trees:listMine",
      updateStatus: "trees:updateStatus",
    },
  },
}))

describe("Tree Verification & Inspector Queue", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTrees = [
      {
        _id: "tree-1",
        name: "Lekki Coast Neem",
        species: "Neem",
        location: "Lekki, Lagos",
        lat: 6.4698,
        lng: 3.5852,
        status: "pending",
        walletAddress: "0x1111111111111111",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "tree-2",
        name: "Abuja Mahogany",
        species: "Mahogany",
        location: "Garki, Abuja",
        lat: 9.0765,
        lng: 7.3986,
        status: "verified",
        walletAddress: "0x2222222222222222",
        createdAt: new Date().toISOString(),
      },
    ]
  })

  it("renders verification queue with KPI cards and table list", () => {
    render(<TreeVerificationPage />)

    expect(screen.getByText("Tree Verification & Validation Queue")).toBeInTheDocument()
    expect(screen.getByText("Lekki Coast Neem")).toBeInTheDocument()
    expect(screen.getByText("Abuja Mahogany")).toBeInTheDocument()
    expect(screen.getByText("Approve")).toBeInTheDocument()
    expect(screen.getByText("Mint NFT")).toBeInTheDocument()
  })

  it("opens Tree Details & Inspection Modal when clicking a tree record", () => {
    render(<TreeVerificationPage />)

    // Click on the tree row
    const treeRow = screen.getByText("Lekki Coast Neem")
    fireEvent.click(treeRow)

    // Modal should now be open
    expect(screen.getByText("Geographical Location")).toBeInTheDocument()
    expect(screen.getByText("Open Satellite Map")).toBeInTheDocument()
    expect(screen.getByText("Ecological Impact & Stewardship Consensus")).toBeInTheDocument()
    expect(screen.getByText("Approve & Verify")).toBeInTheDocument()
  })

  it("handles tree approval via updateStatus mutation", () => {
    render(<TreeVerificationPage />)

    const approveBtn = screen.getByText("Approve")
    fireEvent.click(approveBtn)

    expect(mockUpdateTreeStatus).toHaveBeenCalledWith({
      verifierId: "verifier-1",
      treeId: "tree-1",
      status: "verified",
    })
  })

  it("handles NFT minting for verified trees", () => {
    render(<TreeVerificationPage />)

    const mintBtn = screen.getByText("Mint NFT")
    fireEvent.click(mintBtn)

    expect(mockUpdateTreeStatus).toHaveBeenCalledWith({
      verifierId: "verifier-1",
      treeId: "tree-2",
      status: "minted",
    })
  })
})
