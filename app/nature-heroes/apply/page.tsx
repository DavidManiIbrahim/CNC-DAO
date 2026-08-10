"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { IconCheck, IconArrow } from "@/components/Icons"
import { getMockUser, setMockUser } from "@/lib/mockAuth"

export default function ApplyNatureHeroPage() {
  const router = useRouter()
  const applyMutation = useMutation(api.natureHeroes.apply)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    cityRegion: "",
    country: "",
    motivation: "",
    experience: "",
  })

  const user = getMockUser()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!user?.userId) {
        router.push("/connect-wallet")
        return
      }
      const result = await applyMutation({
        userId: user.userId as any,
        fullName: form.fullName,
        email: form.email,
        cityRegion: form.cityRegion,
        country: form.country,
        motivation: form.motivation,
        experience: form.experience || undefined,
      })
      if (result.user) {
        setMockUser({
          userId: result.user._id,
          walletAddress: result.user.walletAddress ?? user.walletAddress,
          role: result.user.role as any,
          displayName: result.user.displayName ?? user.displayName,
          bio: result.user.bio ?? user.bio,
          avatar: result.user.avatar ?? user.avatar,
          joinedAt: result.user.joinedAt,
        })
      }
      setSubmitted(true)
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

      <section className="px-6 pb-16 pt-20 text-center md:px-16 md:pt-28">
        <Reveal>
          <p className="mb-4 font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-[0.15em] text-[#f0a830]">
            Nature Hero Application
          </p>
          <h1 className="mx-auto mb-6 max-w-2xl font-[family-name:var(--font-dm-sans)] text-[36px] font-medium leading-tight tracking-[-0.02em] md:text-[52px]">
            Help verify the network
          </h1>
          <p className="mx-auto max-w-xl leading-[1.6] text-[#cccccc]">
            Nature Heroes review tree submissions and validate campaigns in their
            region. Applications are reviewed by CNC DAO admins.
          </p>
        </Reveal>
      </section>

      <section className="px-6 pb-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#08080f] p-6 md:p-10">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0a830]/15">
                  <IconCheck className="h-7 w-7 text-[#f0a830]" />
                </div>
                <h2 className="mb-2 font-[family-name:var(--font-syne)] text-xl font-bold">
                  Application submitted
                </h2>
                <p className="mx-auto max-w-sm text-sm text-white/60">
                  CNC DAO admins will review your application. Your status will
                  update once it&apos;s approved.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                <Field label="Full name" required value={form.fullName} onChange={set("fullName")} />
                <Field label="Email" type="email" required value={form.email} onChange={set("email")} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City/Region" required value={form.cityRegion} onChange={set("cityRegion")} />
                  <Field label="Country" required value={form.country} onChange={set("country")} />
                </div>
                <TextArea
                  label="Why do you want to be a Nature Hero?"
                  placeholder="Tell us about your connection to the area and why you'd be a good validator."
                  required
                  value={form.motivation}
                  onChange={set("motivation")}
                />
                <TextArea
                  label="Relevant experience"
                  placeholder="Environmental work, community organizing, agriculture, forestry — anything relevant."
                  value={form.experience}
                  onChange={set("experience")}
                />
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Wallet address
                  </label>
                  <input
                    placeholder="Connect your wallet to auto-fill"
                    disabled
                    value={user?.walletAddress ?? ""}
                    className="w-full rounded-lg border border-white/10 bg-[#050508] px-4 py-3 text-sm text-white/40 outline-none"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <label className="flex items-start gap-3 text-sm text-white/60">
                  <input type="checkbox" required className="mt-1" />
                  I understand Nature Heroes are responsible for verifying real
                  submissions and will act in good faith.
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-medium transition-transform duration-200 hover:scale-105 disabled:opacity-50"
                >
                  {loading ? "Submitting…" : "Submit application"}{" "}
                  <IconArrow className="h-4 w-4 rotate-45" />
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  )
}

function Field({
  label,
  type = "text",
  required = false,
  value,
  onChange,
}: {
  label: string
  type?: string
  required?: boolean
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/70">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full rounded-lg border border-white/10 bg-[#050508] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#1db954]/60"
      />
    </div>
  )
}

function TextArea({
  label,
  placeholder,
  required = false,
  value,
  onChange,
}: {
  label: string
  placeholder?: string
  required?: boolean
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/70">{label}</label>
      <textarea
        placeholder={placeholder}
        required={required}
        rows={3}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full rounded-lg border border-white/10 bg-[#050508] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#1db954]/60"
      />
    </div>
  )
}
