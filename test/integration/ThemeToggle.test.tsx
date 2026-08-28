import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ThemeToggle } from "@/components/ThemeToggle"

const mockSetTheme = vi.fn()
let currentTheme = "dark"

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: currentTheme,
    setTheme: mockSetTheme,
  }),
}))

describe("ThemeToggle Component (Integration Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentTheme = "dark"
  })

  it("renders theme toggle button with accessible title/aria label", () => {
    render(<ThemeToggle />)
    const button = screen.getByRole("button", { name: /switch to light mode/i })
    expect(button).toBeInTheDocument()
  })

  it("toggles theme from dark to light on click", () => {
    render(<ThemeToggle />)
    const button = screen.getByRole("button", { name: /switch to light mode/i })
    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })
})
