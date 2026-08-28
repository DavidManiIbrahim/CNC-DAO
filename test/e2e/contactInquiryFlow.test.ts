import { describe, it, expect } from "vitest"

type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  status: "unread" | "read" | "resolved"
  createdAt: string
}

describe("E2E Simulation: Public Contact Form -> Admin Inbox Workflow", () => {
  let dbMessages: ContactMessage[] = []

  function submitInquiry(name: string, email: string, message: string) {
    if (!name.trim() || !email.trim() || !message.trim()) {
      throw new Error("Validation error: all fields required")
    }
    const record: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      status: "unread",
      createdAt: new Date().toISOString(),
    }
    dbMessages.push(record)
    return record
  }

  function updateStatus(id: string, status: "unread" | "read" | "resolved") {
    const msg = dbMessages.find((m) => m.id === id)
    if (!msg) throw new Error("Message not found")
    msg.status = status
    return msg
  }

  function removeInquiry(id: string) {
    dbMessages = dbMessages.filter((m) => m.id !== id)
  }

  it("handles end-to-end contact inquiry submission, inspection, resolution, and deletion", () => {
    dbMessages = []

    // 1. Validation rejection on blank input
    expect(() => submitInquiry("", "test@example.com", "Hello")).toThrow()

    // 2. Public user submits inquiry
    const inquiry = submitInquiry(
      "Fatima Al-Hassan",
      "fatima@climateaction.ng",
      "We want to partner on a 10,000 tree planting initiative in Kano State."
    )

    expect(inquiry.id).toBeDefined()
    expect(inquiry.status).toBe("unread")
    expect(dbMessages.length).toBe(1)

    // 3. Admin opens inquiry -> status marks as read
    updateStatus(inquiry.id, "read")
    expect(dbMessages.find((m) => m.id === inquiry.id)?.status).toBe("read")

    // 4. Admin finishes replying and marks as resolved
    updateStatus(inquiry.id, "resolved")
    expect(dbMessages.find((m) => m.id === inquiry.id)?.status).toBe("resolved")

    // 5. Admin purges inquiry
    removeInquiry(inquiry.id)
    expect(dbMessages.length).toBe(0)
  })
})
