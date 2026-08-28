"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { LiveStats } from "@/components/LiveStats"
import { CheckCircle2, Mail, Send } from "lucide-react"

export default function ContactPage() {
  const [sent, setSent] = useState(false)

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
                  Message sent successfully
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you for reaching out. A CNC DAO coordinator will get back to you shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSent(true)
                }}
                className="flex flex-col gap-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Name</label>
                  <input
                    required
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="How can we collaborate? Tell us about your organization or question..."
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black transition-transform duration-200 hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
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
