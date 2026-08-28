"use client"

import dynamic from "next/dynamic"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import TreeMap from "@/components/TreeMap"
import DotGlobe from "@/components/DotGlobe"
import { Reveal } from "@/components/Reveal"
import { LiveStats } from "@/components/LiveStats"

// Leaflet touches `window` on load, so it can't be server-rendered
const OSMTreeMap = dynamic(() => import("@/components/OSMTreeMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
})

export default function MapPage() {
  return (
    <main className="bg-background text-foreground font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="px-6 pb-12 pt-20 text-center md:px-16 md:pt-28">
        <Reveal>
          <p className="mb-4 font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-[0.15em] text-[#f0a830]">
            Global Registry
          </p>
          <h1 className="mx-auto mb-6 max-w-2xl font-[family-name:var(--font-syne)] text-[36px] font-bold leading-tight tracking-[-0.02em] md:text-[52px] text-foreground">
            Every tree has a permanent address.
          </h1>
          <p className="mx-auto max-w-xl leading-[1.6] text-muted-foreground">
            Click any pin to see its full verification history, on-chain proof, and
            the Nature Heroes who confirmed it.
          </p>
        </Reveal>
      </section>

      {/* Live Stats Row */}
      <section className="px-6 pb-12 md:px-16">
        <div className="mx-auto max-w-[1400px]">
          <LiveStats variant="grid" />
        </div>
      </section>

      <section className="px-6 pb-8 md:px-16">
        <Reveal>
          <div className="mx-auto mb-4 max-w-[1400px]">
            <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
              Live registry — OpenStreetMap & Satellite
            </h2>
            <p className="text-sm text-muted-foreground">
              Real coordinates for every tree currently confirmed in the database.
            </p>
          </div>
          <div className="mx-auto h-[500px] max-w-[1400px] overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
            <OSMTreeMap className="h-full w-full" />
          </div>
        </Reveal>
      </section>

      <section className="px-6 pb-20 md:px-16">
        <Reveal>
          <div className="mx-auto mb-4 max-w-[1400px]">
            <h2 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
              Registry browser
            </h2>
            <p className="text-sm text-muted-foreground">
              Filter, search, and browse the full tree list.
            </p>
          </div>
          <div className="mx-auto h-[650px] max-w-[1400px] overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
            <TreeMap />
          </div>
        </Reveal>
      </section>

      <section className="border-t border-border px-6 py-24 text-center md:px-16">
        <Reveal>
          <h2 className="mb-4 font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px] text-foreground">
            A planet-wide registry
          </h2>
          <p className="mx-auto mb-14 max-w-xl leading-[1.6] text-muted-foreground">
            Every highlighted point is a region with verified trees on-chain. The
            network grows with every submission.
          </p>
          <div className="relative mx-auto h-[420px] w-full max-w-[560px] md:h-[560px]">
            <DotGlobe className="h-full w-full" />
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  )
}
