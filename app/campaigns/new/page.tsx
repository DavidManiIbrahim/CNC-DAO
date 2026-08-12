"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { IconArrow } from "@/components/Icons"
import { useSessionUser } from "@/lib/useAuth"

export default function NewCampaignPage() {
  const router = useRouter()
  const createCampaign = useMutation(api.campaigns.create)
  const user = useSessionUser()
  const allowed = user ? (user.role === "nature_hero" || user.role === "admin") : false
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    region: "",
    participantLimit: "",
    description: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!user?.userId) {
        router.push("/connect-wallet")
        return
      }
      await createCampaign({
        creatorId: user.userId as any,
        name: form.name,
        region: form.region,
        participantLimit: parseInt(form.participantLimit, 10) || 1,
        description: form.description,
      })
      router.push("/campaigns")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <main className="bg-[#0b0a12] text-white font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="px-6 pb-24 pt-20 md:px-16 md:pt-28">
        <Reveal>
          <div className="mx-auto max-w-xl">
            {!allowed ? (
              <div className="rounded-2xl border border-white/10 bg-[#08080f] p-10 text-center">
                <h1 className="mb-2 font-[family-name:var(--font-syne)] text-xl font-bold">
                  Nature Heroes only
                </h1>
                <p className="mb-6 text-sm text-white/60">
                  Only approved Nature Heroes can create campaigns, since they're
                  responsible for validating the trees planted under them.
                </p>
                <Link
                  href="/nature-heroes/apply"
                  className="inline-block rounded-full bg-[#1db954] px-6 py-3 text-sm font-medium"
                >
                  Apply to become a Nature Hero
                </Link>
              </div>
            ) : (
              <>
                <h1 className="mb-8 font-[family-name:var(--font-dm-sans)] text-[28px] font-medium tracking-[-0.02em]">
                  Create a planting campaign
                </h1>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#08080f] p-6 md:p-10"
                >
                  <div>
                    <label className="mb-2 block text-sm text-white/70">
                      Campaign name
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => set("name")(e.target.value)}
                      placeholder="e.g. Lagos Mangrove Restoration"
                      className="w-full rounded-lg border border-white/10 bg-[#050508] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#1db954]/60"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm text-white/70">Region</label>
                      <input
                        required
                        value={form.region}
                        onChange={(e) => set("region")(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#050508] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#1db954]/60"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-white/70">
                        Participant limit
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={form.participantLimit}
                        onChange={(e) => set("participantLimit")(e.target.value)}
                        placeholder="100"
                        className="w-full rounded-lg border border-white/10 bg-[#050508] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#1db954]/60"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.description}
                      onChange={(e) => set("description")(e.target.value)}
                      placeholder="What's the goal, and what should participants know before joining?"
                      className="w-full rounded-lg border border-white/10 bg-[#050508] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#1db954]/60"
                    />
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-medium transition-transform duration-200 hover:scale-105 disabled:opacity-50"
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
