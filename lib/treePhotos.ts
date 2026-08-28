export const SPECIES_PHOTOS: Record<string, string> = {
  neem: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
  mango: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
  baobab: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
  mahogany: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
  iroko: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
  gmelina: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
  cashew: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
  acacia: "https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=800&q=80",
}

export const DEFAULT_TREE_PHOTO =
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80"

export function getTreeImage(imageUrl?: string | null, species?: string | null): string {
  if (imageUrl && imageUrl.trim().length > 0) {
    return imageUrl
  }
  if (species) {
    const key = species.toLowerCase().trim()
    for (const [sKey, url] of Object.entries(SPECIES_PHOTOS)) {
      if (key.includes(sKey)) return url
    }
  }
  return DEFAULT_TREE_PHOTO
}
