"use client"

const CAMPAIGN_IMAGES_KEY = "cncdao_campaign_images"

export function getCampaignStoredImage(nameOrId?: string): string | undefined {
  if (typeof window === "undefined" || !nameOrId) return undefined
  try {
    const raw = localStorage.getItem(CAMPAIGN_IMAGES_KEY)
    if (!raw) return undefined
    const map = JSON.parse(raw)
    return map[nameOrId] || map[nameOrId.toLowerCase().trim()]
  } catch {
    return undefined
  }
}

export function saveCampaignStoredImage(nameOrId: string, imageUrl: string) {
  if (typeof window === "undefined" || !nameOrId || !imageUrl) return
  try {
    const raw = localStorage.getItem(CAMPAIGN_IMAGES_KEY)
    const map = raw ? JSON.parse(raw) : {}
    map[nameOrId] = imageUrl
    map[nameOrId.toLowerCase().trim()] = imageUrl
    localStorage.setItem(CAMPAIGN_IMAGES_KEY, JSON.stringify(map))
    window.dispatchEvent(new Event("campaigns:change"))
  } catch {
    // Ignore storage errors
  }
}

export function getCampaignImage(imageUrl?: string | null, name?: string | null): string | undefined {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl
  if (name) {
    const stored = getCampaignStoredImage(name)
    if (stored) return stored
  }
  return undefined
}
