"use client"

export type ContactMessageItem = {
  _id: string
  name: string
  email: string
  message: string
  status: "unread" | "read" | "resolved"
  createdAt: string
}

const STORAGE_KEY = "cncdao_contact_messages"

const sampleMessages: ContactMessageItem[] = [
  {
    _id: "msg-seed-1",
    name: "Dr. Amina Bello",
    email: "amina.bello@greencorridor.ng",
    message: "Hello CNC DAO Team, we represent the Green Sahel Initiative in Northern Nigeria. We would like to coordinate our upcoming 5,000 Acacia tree planting campaign with your verification protocol.",
    status: "unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    _id: "msg-seed-2",
    name: "Oluwaseun Adeyemi",
    email: "seun@ecorestore.org",
    message: "Inquiring about becoming a verified Nature Hero in Lagos. I have led mangrove restoration for 4 years in the Badagry axis and would like to help validate tree submissions.",
    status: "read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    _id: "msg-seed-3",
    name: "Chinedu Okafor",
    email: "chinedu@solanaclimate.xyz",
    message: "We are building an ESG dashboard and would love to integrate CNC DAO's on-chain Proof-of-Stewardship API to verify carbon sequestration credits.",
    status: "resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

export function getStoredMessages(): ContactMessageItem[] {
  if (typeof window === "undefined") return sampleMessages
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleMessages))
      return sampleMessages
    }
    return JSON.parse(raw)
  } catch {
    return sampleMessages
  }
}

export function saveStoredMessage(name: string, email: string, message: string): ContactMessageItem {
  const current = getStoredMessages()
  const newMsg: ContactMessageItem = {
    _id: `msg-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    status: "unread",
    createdAt: new Date().toISOString(),
  }
  const updated = [newMsg, ...current]
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event("messages:change"))
  }
  return newMsg
}

export function updateStoredMessageStatus(id: string, status: "unread" | "read" | "resolved") {
  const current = getStoredMessages()
  const updated = current.map((m) => (m._id === id ? { ...m, status } : m))
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event("messages:change"))
  }
}

export function removeStoredMessage(id: string) {
  const current = getStoredMessages()
  const updated = current.filter((m) => m._id !== id)
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event("messages:change"))
  }
}
