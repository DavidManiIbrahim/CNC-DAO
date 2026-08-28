import React from "react"
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { PersonaCard } from "@/components/PersonaCard"
import { connectMockWallet } from "@/lib/mockAuth"

describe("PersonaCard Component (Integration Tests)", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders 'Build your Nature Persona' banner when user is not connected", () => {
    render(<PersonaCard />)
    expect(screen.getByText("Build your Nature Persona")).toBeInTheDocument()
    expect(screen.getByText("Connect")).toBeInTheDocument()
  })

  it("renders user profile card when user connects wallet", () => {
    connectMockWallet("SolanaWalletABC", "user_1")

    render(<PersonaCard />)
    expect(screen.getByText("SolanaWalletABC")).toBeInTheDocument()
    expect(screen.getByText("Registered User")).toBeInTheDocument()
    expect(screen.getByText("View full profile")).toBeInTheDocument()
  })
})
