import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ConvexErrorBoundary } from "@/components/ConvexErrorBoundary"

function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Could not find public function for 'messages:list'")
  }
  return <div>Component Loaded Successfully</div>
}

describe("ConvexErrorBoundary (Integration Tests)", () => {
  it("renders children when no error occurs", () => {
    render(
      <ConvexErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ConvexErrorBoundary>
    )
    expect(screen.getByText("Component Loaded Successfully")).toBeInTheDocument()
  })

  it("catches Convex function error and displays informative recovery UI", () => {
    // Suppress console.error in test output for intentional error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ConvexErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ConvexErrorBoundary>
    )

    expect(screen.getByText("Convex Functions Syncing")).toBeInTheDocument()
    expect(
      screen.getByText(/Convex backend functions are deploying or syncing/i)
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()

    spy.mockRestore()
  })
})
