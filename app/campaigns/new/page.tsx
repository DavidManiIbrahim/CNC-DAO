"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import { api } from "@/convex/_generated/api"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { IconArrow } from "@/components/Icons"
import { useSessionUser } from "@/lib/useAuth"
import { resizeImage } from "@/lib/mockAuth"
import { saveCampaignStoredImage } from "@/lib/campaignImages"
import { Image as ImageIcon, Upload, X } from "lucide-react"

export default function NewCampaignPage() {
  const router = useRouter()
  const createCampaign = useMutation(api.campaigns.create)
  const user = useSessionUser()
  const allowed = user ? (user.role === "nature_hero" || user.role === "admin") : false
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageLoading, setImageLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: "",
    region: "",
    participantLimit: "",
    description: "",
  })

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP)")
      return
    }
    setImageLoading(true)
    try {
      const resized = await resizeImage(file, 800)
      setImagePreview(resized)
    } catch {
      setError("Failed to process image. Please try another file.")
    } finally {
      setImageLoading(false)
    }
  }

  function handleRemoveImage() {
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!user?.userId) {
        router.push("/connect-wallet")
        return
      }

      if (imagePreview) {
        saveCampaignStoredImage(form.name, imagePreview)
      }

      try {
        await createCampaign({
          creatorId: user.userId as any,
          name: form.name,
          region: form.region,
          participantLimit: parseInt(form.participantLimit, 10) || 1,
          description: form.description,
          imageUrl: imagePreview || undefined,
        })
      } catch (createErr: any) {
        const errMsg = createErr?.message || String(createErr)
        if (
          errMsg.includes("ArgumentValidationError") ||
          errMsg.includes("extra field `imageUrl`") ||
          errMsg.includes("extra field")
        ) {
          // Fallback: Retry without imageUrl for remote validator compatibility
          await createCampaign({
            creatorId: user.userId as any,
            name: form.name,
            region: form.region,
            participantLimit: parseInt(form.participantLimit, 10) || 1,
            description: form.description,
          } as any)
        } else {
          throw createErr
        }
      }

      router.push("/campaigns")
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(typeof err.data === "string" ? err.data : JSON.stringify(err.data))
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to create campaign. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <main className="bg-background text-foreground font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="px-6 pb-24 pt-20 md:px-16 md:pt-28">
        <Reveal>
          <div className="mx-auto max-w-xl">
            {!allowed ? (
              <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-xl">
                <h1 className="mb-2 font-[family-name:var(--font-syne)] text-xl font-bold text-foreground">
                  Nature Heroes & Admins Only
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                  Only approved Nature Heroes and System Admins can create planting campaigns.
                </p>
                <Link
                  href="/nature-heroes/apply"
                  className="inline-block rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black"
                >
                  Apply to become a Nature Hero
                </Link>
              </div>
            ) : (
              <>
                <h1 className="mb-8 font-[family-name:var(--font-dm-sans)] text-[28px] font-medium tracking-[-0.02em] text-foreground">
                  Create a planting campaign
                </h1>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-xl md:p-10"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Campaign name
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => set("name")(e.target.value)}
                      placeholder="e.g. Lagos Mangrove Restoration"
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                    />
                  </div>

                  {/* Campaign Image Upload */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Campaign Banner Image
                    </label>
                    {imagePreview ? (
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/30">
                        <img
                          src={imagePreview}
                          alt="Campaign Banner Preview"
                          className="h-48 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-transform hover:scale-110 hover:bg-black"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 text-center transition-colors hover:border-[#1db954]/60 hover:bg-muted/40"
                      >
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1db954]/10 text-[#1db954]">
                          {imageLoading ? (
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1db954] border-t-transparent" />
                          ) : (
                            <Upload className="h-6 w-6" />
                          )}
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          {imageLoading ? "Processing photo…" : "Upload campaign photo"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          PNG, JPG, or WebP (max 800px auto-optimized)
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Region</label>
                      <input
                        required
                        value={form.region}
                        onChange={(e) => set("region")(e.target.value)}
                        placeholder="e.g. Lagos, Nigeria"
                        className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">
                        Participant limit
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={form.participantLimit}
                        onChange={(e) => set("participantLimit")(e.target.value)}
                        placeholder="100"
                        className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.description}
                      onChange={(e) => set("description")(e.target.value)}
                      placeholder="What's the goal, and what should participants know before joining?"
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading || imageLoading}
                    className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black transition-transform duration-200 hover:scale-105 disabled:opacity-50"
                  >
                    {loading ? "Creating…" : "Create campaign"}{" "}
                    <IconArrow className="h-4 w-4 rotate-45" />
                  </button>
                </form>
              </>
            )}
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  )
}
