import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { IconCheck } from "@/components/Icons"

const responsibilities = [
  {
    title: "Review submissions",
    body: "Check photos, GPS coordinates, and species match what was submitted.",
  },
  {
    title: "Confirm in person or via trusted local network",
    body: "Verify the tree is real and actually planted where claimed.",
  },
  {
    title: "Approve or reject",
    body: "Two independent Heroes must both approve before anything goes on-chain.",
  },
]

export default function NatureHeroesPage() {
  return (
    <main className="bg-[#0b0a12] text-white font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="px-6 pb-16 pt-20 text-center md:px-16 md:pt-28">
        <Reveal>
          <p className="mb-4 font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-[0.15em] text-[#f0a830]">
            Nature Heroes
          </p>
          <h1 className="mx-auto mb-6 max-w-2xl font-[family-name:var(--font-dm-sans)] text-[36px] font-medium leading-tight tracking-[-0.02em] md:text-[52px]">
            The people who verify every tree
          </h1>
          <p className="mx-auto max-w-xl leading-[1.6] text-[#cccccc]">
            Nature Heroes are independent, regional validators. No submission goes
            on-chain without two of them confirming it in person.
          </p>
        </Reveal>
      </section>

      <section className="px-6 py-16 md:px-16">
        <Reveal>
          <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-4 md:grid-cols-3">
            {responsibilities.map((r) => (
              <div
                key={r.title}
                className="rounded-xl border border-white/10 bg-[#08080f] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/40"
              >
                <IconCheck className="mb-4 h-8 w-8" />
                <h3 className="mb-2 font-[family-name:var(--font-syne)] text-lg font-bold">
                  {r.title}
                </h3>
                <p className="text-sm text-white/60">{r.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-6 py-24 text-center md:px-16">
        <Reveal>
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-gradient-to-br from-[#08080f] to-[#12121c] p-10">
            <h2 className="mb-3 font-[family-name:var(--font-syne)] text-2xl font-bold">
              Become a Nature Hero
            </h2>
            <p className="mb-8 text-sm text-white/60">
              Applications open on a regional basis as the network grows. Connect
              your wallet to register interest for your area.
            </p>
            <Link
              href="/nature-heroes/apply"
              className="inline-block rounded-full bg-[#1db954] px-6 py-3 text-sm font-medium transition-transform duration-200 hover:scale-105"
            >
              Apply to Become a Nature Hero
            </Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  )
}
