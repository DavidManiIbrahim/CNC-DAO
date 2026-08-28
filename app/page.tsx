import Link from "next/link"
import TreeMap from "@/components/TreeMap"
import { IconGPS, IconRealtime, IconOnChain, IconCheck, IconArrow, StepIcon } from "@/components/Icons"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { LogoMarquee } from "@/components/Visuals"
import ParticleSphere from "@/components/ParticleSphere"
import DotGlobe from "@/components/DotGlobe"
import { Reveal } from "@/components/Reveal"
import { FlipCard } from "@/components/FlipCard"
import { PersonaCard } from "@/components/PersonaCard"
import { LiveStats } from "@/components/LiveStats"

const steps = [
  {
    n: "01",
    title: "Upload tree data",
    body: "Photo, GPS coordinates, species, and planting date. Quick form, works from your phone.",
  },
  {
    n: "02",
    title: "Enters validation queue",
    body: "Your submission is queued for review by two independent Nature Heroes in your region.",
  },
  {
    n: "03",
    title: "Two Heroes verify",
    body: "Nature Heroes review photos, coordinates, and species match. Both must approve before it counts.",
  },
  {
    n: "04",
    title: "Data goes on-chain",
    body: "Verified tree data is written to Solana with IPFS metadata storage. Permanent, tamper-proof.",
  },
  {
    n: "05",
    title: "Appears on global map",
    body: "Your tree is now publicly visible. Anyone can click it to see the verification trail and on-chain proof.",
  },
  {
    n: "06",
    title: "Mint your NFT",
    body: "If the tree survives, mint a proof-of-stewardship certificate on Solana. Your permanent environmental record.",
  },
]

const whyWeExist = [
  {
    tags: ["Community-led", "GPS-verified"],
    heading: "Communities are planting. Nobody is counting.",
    image: "https://framerusercontent.com/images/dE3XXZ4AQ0vtNb4Bzls1LgTPI.png",
    body: "Grassroots tree planting happens every day across Africa and the world, by youth groups, local heroes, and everyday people who care. But without a system to record and track what they plant, their effort disappears the moment they walk away. CNC DAO gives every community planter a permanent, GPS-verified, on-chain record of every tree they grow, so their work is never invisible again.",
    reverse: false,
  },
  {
    tags: ["Two-Hero consensus", "No self-approval"],
    heading: "Anyone can claim to save the planet.",
    image: "https://framerusercontent.com/images/sfGyIIGWV32EGzEwnNzuhvscm7M.png",
    body: "A photo opportunity is not proof. A social media post is not verification. Without an independent system to confirm environmental action, anyone can make claims and no one can challenge them. CNC DAO requires every tree to pass through two independent Nature Hero validators before anything is written on-chain. No single person can approve their own submission. Consensus is enforced by code, not trust.",
    reverse: true,
  },
  {
    tags: ["Proof of stewardship", "Solana NFT"],
    heading: "Real people. Real trees. Zero recognition.",
    image: "https://framerusercontent.com/images/FSwWS7SqchWjr4g6ysSfsfMQQc.png",
    body: "Across Africa and the developing world, thousands of everyday people plant trees, restore land, and protect ecosystems with their own hands. Their effort is never recorded, never rewarded, and completely invisible to the rest of the world. CNC DAO mints every verified, surviving tree as a permanent Solana NFT, a digital badge of real-world impact that belongs to the planter forever.",
    reverse: false,
  },
  {
    tags: ["Tamper-proof", "Permanent record"],
    heading: "If it's not on-chain, it didn't happen.",
    image: "https://framerusercontent.com/images/O0O7mDIk2fpbKy1FVzW4uXDqRF4.png",
    body: "Paper records get lost. Spreadsheets get deleted. Organisations shut down. The only environmental record that cannot be altered, censored, or erased is one written permanently on a decentralised blockchain. CNC DAO anchors every verified tree to the Solana blockchain, tied to GPS coordinates, a photo hash, validator signatures, and a timestamp that no one can ever change or delete.",
    reverse: true,
  },
]

const features = [
  {
    title: "GPS-locked submissions",
    body: "Every tree is pinned to the exact coordinates submitted at registration, no guessing, no vague pins.",
  },
  {
    title: "Two-Hero verification",
    body: "Nothing goes on-chain until two independent Nature Heroes confirm species, photo, and location match.",
  },
  {
    title: "Real-time map updates",
    body: "New trees appear the moment 2-of-2 validation completes, visible to anyone, anywhere.",
  },
  {
    title: "Tamper-proof records",
    body: "Verified data is written to Solana with IPFS metadata. Nothing can be quietly edited or removed.",
  },
  {
    title: "Solana-speed minting",
    body: "Proof-of-stewardship NFTs mint in seconds once a tree is confirmed alive and verified.",
  },
  {
    title: "Public verification trail",
    body: "Every tree's history, photos, validators, and transaction, is open for anyone to check.",
  },
]

const howItWorks = [
  { n: "1", body: "Create your account in seconds" },
  { n: "2", body: "Complete tree identity verification process" },
  { n: "3", body: "2 Nature Hero Live Verification" },
  { n: "4", body: "NFT mint" },
]

const testimonials = [
  {
    name: "Planting",
    role: "CNC DAO Planting Operator",
    quote: "Every seed placed with precision is a future engineered, not guessed.",
    image: "https://framerusercontent.com/images/4jmBgsQLtpdR43r0TTCfDUlPfqQ.png",
  },
  {
    name: "Register Growing Plant",
    role: "CNC DAO Growth Monitoring Specialist",
    quote: "What you don't measure in growth, you lose in yield.",
    image: "https://framerusercontent.com/images/F6LGyJNRpfvDLJ79kRvUR1gD7E.jpg",
  },
  {
    name: "Nature Hero",
    role: "Real Live Tree Validator",
    quote: "Nature rewards only what is checked, corrected, and cared for.",
    image: "https://framerusercontent.com/images/Na4ol9oHoDxENWivoo6SNnhPo.png",
  },
]

export default function Home() {
  return (
    <main className="bg-background text-foreground font-[family-name:var(--font-space-grotesk)]">
      {/* ---------- Nav ---------- */}
      <Header />

      {/* ---------- Hero ---------- */}
      <section id="hero" className="relative overflow-hidden px-6 pb-24 pt-20 md:px-16 md:pt-32">
        <Reveal>
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(45,106,49,0.35),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-80" aria-hidden="true">
            <div className="absolute left-[46%] top-[-30%] h-[130%] w-[20px] rotate-[-14deg] bg-[radial-gradient(50%_50%,#2d6a31_0%,transparent_100%)] opacity-30" />
            <div className="absolute left-[50%] top-[-30%] h-[130%] w-[20px] bg-[radial-gradient(50%_50%,#2d6a31_0%,transparent_100%)] opacity-30" />
            <div className="absolute left-[53%] top-[-30%] h-[110%] w-[11px] bg-[radial-gradient(50%_50%,#2d6a31_0%,transparent_100%)] opacity-20" />
            <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-[radial-gradient(50%_50%,#2d6a31_0%,transparent_100%)] opacity-25" />
          </div>
          <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-8 text-center">
            <h1 className="font-[family-name:var(--font-dm-sans)] text-[36px] font-medium leading-[1.1] tracking-[-0.02em] md:text-[64px] text-foreground">
              Every Tree Verified <br className="hidden md:block" />
              On-Chain.
            </h1>
            <p className="max-w-xl text-lg leading-[1.6] text-muted-foreground">
              CNC DAO connects real environmental action with blockchain proof. Submit a
              tree, earn verification from Nature Heroes, and mint your stewardship on
              Solana.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tree-reg"
                className="flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black transition-transform duration-200 hover:scale-105"
              >
                Plant a Tree <IconArrow className="h-4 w-4 rotate-45" />
              </Link>
              <Link
                href="/map"
                className="flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-transform duration-200 hover:scale-105 hover:bg-muted"
              >
                View Map <IconArrow className="h-4 w-4 rotate-45" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Persona card ---------- */}
      <section className="px-6 pb-4 md:px-16">
        <Reveal>
          <PersonaCard />
        </Reveal>
      </section>

      {/* ---------- Supported by Solana: tree + particle sphere + ticker ---------- */}
      <section className="px-6 pb-20 md:px-16">
        <Reveal>
          <p className="mb-8 text-center text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Supported by Solana
          </p>
          <div className="relative mx-auto mb-14 h-[380px] w-full max-w-[560px] md:h-[560px]">
            <img
              src="https://framerusercontent.com/images/mRLVTvuN46hVjqnB9DPdYH8RXUY.png"
              alt="Tree"
              className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 object-contain"
            />
            <ParticleSphere
              particleCount={1800}
              particleSize={1.4}
              colors={["#a9f5ae", "#22c55e", "#ffffff"]}
              speed={0.18}
              cursorRadius={110}
              clickForce={30}
              clickEffect="scatter"
              trails={false}
              transparent
              background="transparent"
              radius={190}
            />
          </div>
          <LogoMarquee />
        </Reveal>
      </section>

      {/* ---------- The Process ---------- */}
      <section className="border-t border-border bg-card/40 px-6 py-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-[1120px]">
            <p className="mb-4 text-center font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-[0.15em] text-[#f0a830]">
              The Process
            </p>
            <h2 className="mb-4 text-center font-[family-name:var(--font-syne)] text-[36px] font-bold leading-tight tracking-[-0.02em] md:text-[52px] text-foreground">
              Simple to plant.
              <br />
              Impossible to fake.
            </h2>
            <p className="mx-auto mb-16 max-w-lg text-center leading-[1.6] text-muted-foreground">
              Six steps from tree in the ground to proof on-chain. No crypto knowledge
              required to get started.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/40 hover:shadow-md"
                >
                  <StepIcon step={(i + 1) as 1 | 2 | 3 | 4 | 5 | 6} className="mb-4 h-12 w-12" />
                  <span className="mb-4 block font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#f0a830]">
                    {s.n}
                  </span>
                  <h3 className="mb-2 font-[family-name:var(--font-syne)] text-xl font-bold tracking-[-0.02em] text-foreground">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Why We Exist ---------- */}
      <section id="overview" className="px-6 py-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-[1120px]">
            <h2 className="mb-4 text-center font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px] text-foreground">
              Why We Exist
            </h2>
            <p className="mx-auto mb-20 max-w-2xl text-center leading-[1.6] text-muted-foreground font-medium">
              &ldquo;The planet is being promised to death.&rdquo;
            </p>

            <div className="flex flex-col gap-24">
              {whyWeExist.map((block, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-10 md:flex-row ${
                    block.reverse ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="mb-6 flex gap-3">
                      {block.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-semibold text-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="mb-4 font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px] text-foreground">
                      {block.heading}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{block.body}</p>
                  </div>
                  <div className="group relative aspect-[4/3] flex-1 overflow-hidden rounded-3xl border border-border bg-muted">
                    <img src={block.image} alt={block.heading} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Features ---------- */}
      <section id="benefits" className="border-t border-border bg-card/40 px-6 py-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-[1120px]">
            <h2 className="mb-4 text-center font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px] text-foreground">
              Built for verification, not speculation
            </h2>
            <p className="mx-auto mb-16 max-w-2xl text-center leading-[1.6] text-muted-foreground">
              Every part of the system exists to make one thing hard to fake: proof
              that a tree was actually planted, actually verified, and actually
              survives.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/40 hover:shadow-md"
                >
                  <h5 className="mb-2 font-[family-name:var(--font-dm-sans)] text-lg font-bold tracking-[-0.02em] text-foreground">
                    {f.title}
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Live Dynamic Registry Stats Section ---------- */}
      <section className="px-6 py-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-[1120px]">
            <h2 className="mb-4 text-center font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px] text-foreground">
              Keep Your Environment Secured On-Chain
            </h2>
            <p className="mx-auto mb-16 max-w-xl text-center leading-[1.6] text-muted-foreground">
              Track live tree, verification, and Nature Hero activity as it happens.
            </p>

            <LiveStats variant="grid" />
          </div>
        </Reveal>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="border-t border-border bg-card/40 px-6 py-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-[1008px]">
            <h2 className="mb-4 text-center font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px] text-foreground">
              From seed to certificate
            </h2>
            <p className="mx-auto mb-16 max-w-xl text-center leading-[1.6] text-muted-foreground">
              Four steps from signup to your first verified tree on-chain.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step) => (
                <div
                  key={step.n}
                  className="relative rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/50 hover:shadow-md"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1db954]/15 text-[#1db954] font-bold">
                    <span className="text-lg font-medium">{step.n}</span>
                  </div>
                  <p className="text-foreground text-sm font-medium leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                href="/tree-reg"
                className="flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black transition-transform duration-200 hover:scale-105"
              >
                Plant Tree <IconArrow className="h-4 w-4 rotate-45" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="px-6 py-24 md:px-16">
        <Reveal>
          <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-3xl p-9 shadow-lg transition-transform duration-500 hover:-translate-y-2"
              >
                <img src={t.image} alt={t.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                <p className="relative z-10 mb-6 font-[family-name:var(--font-syne)] text-xl font-bold leading-snug text-white">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="relative z-10 text-sm">
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-white/70">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- Global Registry / Map ---------- */}
      <section className="border-t border-border bg-card/40 px-6 py-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-[1008px] text-center">
            <p className="mb-4 font-[family-name:var(--font-space-mono)] text-sm font-bold uppercase tracking-[0.12em] text-[#f0a830]">
              Global Registry
            </p>
            <h2 className="mb-6 font-[family-name:var(--font-syne)] text-[36px] font-bold tracking-[-0.02em] md:text-[52px] text-foreground">
              Every tree has a permanent address.
            </h2>
            <p className="mx-auto mb-14 max-w-xl text-muted-foreground">
              Our interactive map shows every verified tree on Earth. Click any pin to
              see its full verification history, on-chain proof, and the Nature
              Heroes who confirmed it.
            </p>

            <div className="mb-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                <IconGPS className="mb-3 h-9 w-9 text-[#1db954]" />
                <div className="mb-1 font-bold text-foreground">GPS-verified coordinates</div>
                <div className="text-sm text-muted-foreground">
                  Every tree is pinned to exact GPS location submitted at registration
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                <IconRealtime className="mb-3 h-9 w-9 text-[#1db954]" />
                <div className="mb-1 font-bold text-foreground">Real-time updates</div>
                <div className="text-sm text-muted-foreground">
                  New trees appear as soon as 2-of-2 validation is complete
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                <IconOnChain className="mb-3 h-9 w-9 text-[#1db954]" />
                <div className="mb-1 font-bold text-foreground">On-chain proof for every pin</div>
                <div className="text-sm text-muted-foreground">
                  Click any tree to view its Solana transaction and IPFS metadata
                </div>
              </div>
            </div>

            <Link
              href="/map"
              className="inline-block rounded-full bg-[#1db954] px-9 py-3.5 text-sm font-bold text-black transition-transform duration-200 hover:scale-105 mb-10"
            >
              Explore the Map
            </Link>

            {/* Live registry map */}
            <div className="h-[600px] overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
              <TreeMap />
            </div>

            {/* Rotating dot-matrix globe */}
            <div className="relative mx-auto mt-16 h-[420px] w-full max-w-[700px] md:h-[600px]">
              <DotGlobe className="h-full w-full" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- NFT Identity / Mint gallery ---------- */}
      <section id="nft" className="relative overflow-hidden border-t border-border px-6 py-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="mx-auto mb-6 max-w-lg font-[family-name:var(--font-dm-sans)] text-[32px] font-medium leading-tight tracking-[-0.02em] md:text-[44px] text-foreground">
              Mint Your Digital Tree Identity
            </h2>
            <p className="mx-auto mb-8 leading-[1.6] text-muted-foreground">
              CNC DAO connects real environmental action with blockchain proof.
              Submit a tree, earn verification from Nature Heroes, and mint your
              stewardship on Solana.
            </p>
            <Link
              href="/dashboard/nft"
              className="inline-flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black transition-transform duration-200 hover:scale-105"
            >
              <span className="h-2 w-2 rounded-full bg-black" />
              <span>NFT Gallery & Minting</span>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------- Footer ---------- */}
      <Footer />
    </main>
  )
}
