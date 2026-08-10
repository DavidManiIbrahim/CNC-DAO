"use client"

/**
 * Mock user/role state, stored in localStorage.
 *
 * IMPORTANT: this is frontend-only placeholder state so the UI has
 * something real to react to (role-gated pages, application status, etc).
 * It is NOT auth and NOT secure — anyone can edit localStorage and grant
 * themselves any role. Real implementation needs:
 *   - Wallet-based auth (sign a message to prove wallet ownership)
 *   - A real database storing role + application status per wallet address
 *   - An admin-only backend endpoint to approve/reject Nature Hero applications
 * See README.md "Where backend/contract work plugs in".
 */

export type UserRole = "user" | "nature_hero_pending" | "nature_hero" | "admin"

export const roleLabels: Record<UserRole, { label: string; color: string }> = {
  user: { label: "Registered User", color: "#cccccc" },
  nature_hero_pending: { label: "Nature Hero — Pending Review", color: "#f0a830" },
  nature_hero: { label: "Nature Hero", color: "#1db954" },
  admin: { label: "Admin", color: "#a78bfa" },
}

export type MockUser = {
  walletAddress: string
  role: UserRole
  displayName?: string
  bio?: string
  avatar?: string // base64 data URL — see setAvatar() for size caveats
  joinedAt: string
}

const STORAGE_KEY = "cncdao_mock_user"

export function getMockUser(): MockUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setMockUser(user: MockUser) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event("mockuser:change"))
}

export function connectMockWallet(address: string = "Demo" + Math.floor(Math.random() * 9999)) {
  const existing = getMockUser()
  const user: MockUser = existing ?? {
    walletAddress: address,
    role: "user",
    joinedAt: new Date().toISOString(),
  }
  setMockUser(user)
  return user
}

export function submitNatureHeroApplication() {
  const user = getMockUser() ?? connectMockWallet()
  setMockUser({ ...user, role: "nature_hero_pending" })
}

export function setDisplayName(displayName: string) {
  const user = getMockUser() ?? connectMockWallet()
  setMockUser({ ...user, displayName })
}

export function setBio(bio: string) {
  const user = getMockUser() ?? connectMockWallet()
  setMockUser({ ...user, bio })
}

/**
 * Demo-only — lets you preview the user/nature_hero/admin dashboard
 * variants without a real approval backend. Remove once real role
 * assignment (backend-verified) exists.
 */
export function setRole(role: UserRole) {
  const user = getMockUser() ?? connectMockWallet()
  setMockUser({ ...user, role })
}

/**
 * Stores a profile photo as a base64 data URL in localStorage.
 *
 * This is a placeholder — localStorage has a ~5-10MB total quota, so this
 * doesn't scale and isn't how real profile photos should be stored. Real
 * implementation should upload to actual file storage (IPFS fits this
 * project well, since NFT metadata is already planned to live there) and
 * store just the resulting URL. The `resizeImage()` helper below at least
 * keeps the demo data small by downscaling before storing.
 */
export function setAvatar(dataUrl: string) {
  const user = getMockUser() ?? connectMockWallet()
  setMockUser({ ...user, avatar: dataUrl })
}

export function resizeImage(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas not supported"))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function disconnectMockWallet() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event("mockuser:change"))
}
