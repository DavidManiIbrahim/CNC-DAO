"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import { api } from "@/convex/_generated/api"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { LiveStats } from "@/components/LiveStats"
import { CheckCircle2, Mail, Send, AlertCircle } from "lucide-react"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submitMessage = useMutation(api.users.submitMessage)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await submitMessage({
        name,
        email,
        message,
      })
      setSent(true)
      setName("")
      setEmail("")
      setMessage("")
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(typeof err.data === "string" ? err.data : JSON.stringify(err.data))
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to send message. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-background text-foreground font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="px-6 pb-8 pt-20 text-center md:px-16 md:pt-28">
        <Reveal>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1db954]/30 bg-[#1db954]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1db954] mb-4">
            <Mail className="h-3.5 w-3.5" />
            <span>Community & Partnerships</span>
          </div>
          <h1 className="mx-auto mb-6 max-w-2xl font-[family-name:var(--font-dm-sans)] text-[36px] font-medium leading-tight tracking-[-0.02em] md:text-[52px] text-foreground">
            Get in touch with CNC DAO
          </h1>
          <p className="mx-auto max-w-xl leading-[1.6] text-muted-foreground">
            Questions about tree verification, institutional partnerships, API access, or becoming a regional Nature Hero — reach out below.
          </p>
        </Reveal>
      </section>

      {/* Network Stats Bar */}
      <section className="px-6 pb-12 md:px-16">
        <div className="mx-auto max-w-xl">
          <LiveStats variant="compact" />
        </div>
      </section>

      <section className="px-6 pb-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 shadow-xl md:p-10">
            {sent ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1db954]/15 text-[#1db954]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mb-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
                  Message Sent to Admins!
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you for reaching out. Your message has been routed to CNC DAO system administrators and we'll reply to <span className="font-semibold text-foreground">{email || "your email"}</span> promptly.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 rounded-full border border-border bg-muted px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/80"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we collaborate? Tell us about your organization or question..."
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black transition-transform duration-200 hover:scale-105 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? "Sending..." : "Send Message"}</span>
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
