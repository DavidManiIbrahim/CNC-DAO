import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { IconCheck } from "@/components/Icons"
import { LiveStats } from "@/components/LiveStats"

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
    <main className="bg-background text-foreground font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="px-6 pb-12 pt-20 text-center md:px-16 md:pt-28">
        <Reveal>
          <p className="mb-4 font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-[0.15em] text-[#f0a830]">
            Nature Heroes
          </p>
          <h1 className="mx-auto mb-6 max-w-2xl font-[family-name:var(--font-dm-sans)] text-[36px] font-medium leading-tight tracking-[-0.02em] md:text-[52px]">
            The people who verify every tree
          </h1>
          <p className="mx-auto max-w-xl leading-[1.6] text-muted-foreground">
            Nature Heroes are independent, regional validators. No submission goes
            on-chain without two of them confirming it in person.
          </p>
        </Reveal>
      </section>

      {/* Network Stats */}
      <section className="px-6 pb-12 md:px-16">
        <div className="mx-auto max-w-[1000px]">
          <LiveStats variant="grid" />
        </div>
      </section>

      <section className="px-6 py-12 md:px-16">
        <Reveal>
          <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-4 md:grid-cols-3">
            {responsibilities.map((r) => (
              <div
                key={r.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/40"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1db954]/10 text-[#1db954]">
                  <IconCheck className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                  {r.title}
                </h3>
                <p className="text-sm text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-6 py-24 text-center md:px-16">
        <Reveal>
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-10 shadow-lg">
            <h2 className="mb-3 font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
              Become a Nature Hero
            </h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Applications open on a regional basis as the network grows. Connect
              your wallet to register interest for your area.
            </p>
            <Link
              href="/nature-heroes/apply"
              className="inline-block rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black transition-transform duration-200 hover:scale-105"
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
