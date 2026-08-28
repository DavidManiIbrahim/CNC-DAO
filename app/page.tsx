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

/**
 * CNC DAO — Homepage
 * Rebuilt from the live Framer site (cncdao.framer.website).
 *
 * Corrections made from the original Framer copy:
 * - "Every Tree Varified On-Chain" -> "Every Tree Verified On-Chain" (typo)
 * - "Keep Your Enviroment Secured On Chain" -> "Keep Your Environment Secured On-Chain" (typo)
 * - "Regitare Growing Plant" -> "Register Growing Plant" (typo)
 *
 * Sections replaced per your request (leftover crypto-trading template content
 * swapped for tree/verification-relevant equivalents):
 * - "Powerful features built for crypto confidence" (Instant transfers, Risk
 *   analysis, Tax Optimization, Autopilot mode...) -> tree-verification features
 * - Live crypto price ticker (ETH/NEM/XRP/BNB...) -> live tree registry stats
 * - Footer tagline "Take control of your crypto investments." -> tree-relevant line
 * - Multi-chain logo carousel (Ethereum/Cosmos/Polygon/etc.) -> single Solana badge,
 *   since the product is Solana-only
 *
 * Still needs wiring before ship:
 * - Real tree data / map component (there's a working map widget on the live
 *   site already — worth porting that as its own component rather than rebuilding)
 * - Wallet connect button
 * - Real images (hero device mock, testimonial photos, NFT art) — currently
 *   using placeholder blocks, swap in your actual asset URLs
 * - "See an Example NFT" and testimonial content should link to real records
 *   once you have verified trees in the system
 */

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

const nftPoints = [
  {
    title: "Tied to a real, verified tree",
    body: "Every NFT is minted only after 2-of-2 human verification. No tree, no certificate.",
  },
  {
    title: "Contains species, GPS, and date",
    body: "Full metadata stored on IPFS: species, exact coordinates, planting date, and validator IDs.",
  },
  {
    title: "Shareable proof of impact",
    body: "Share your certificate publicly. Anyone can verify the claim by checking the on-chain record.",
  },
]

// Pulled from the site's own live map widget, keep this in sync with real data
const registryStats = [
  { label: "Trees verified", value: "1,240" },
  { label: "Countries", value: "38" },
  { label: "Nature Heroes", value: "124" },
  { label: "Network", value: "Solana" },
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
        {/* Green light-beam rays behind the hero, ported from the source
            site's "Lights" decoration (vertical radial-gradient bars) */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-80" aria-hidden="true">
          <div className="absolute left-[46%] top-[-30%] h-[130%] w-[20px] rotate-[-14deg] bg-[radial-gradient(50%_50%,#2d6a31_0%,transparent_100%)] opacity-30" />
          <div className="absolute left-[50%] top-[-30%] h-[130%] w-[20px] bg-[radial-gradient(50%_50%,#2d6a31_0%,transparent_100%)] opacity-30" />
          <div className="absolute left-[53%] top-[-30%] h-[110%] w-[11px] bg-[radial-gradient(50%_50%,#2d6a31_0%,transparent_100%)] opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-[radial-gradient(50%_50%,#2d6a31_0%,transparent_100%)] opacity-25" />
        </div>
        <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-8 text-center">
          <h1 className="font-[family-name:var(--font-dm-sans)] text-[36px] font-medium leading-[1.1] tracking-[-0.02em] md:text-[64px]">
            Every Tree Verified <br className="hidden md:block" />
            On-Chain.
          </h1>
          <p className="max-w-xl text-lg leading-[1.6] text-[#cccccc]">
            CNC DAO connects real environmental action with blockchain proof. Submit a
            tree, earn verification from Nature Heroes, and mint your stewardship on
            Solana.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tree-reg"
              className="flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-medium transition-transform duration-200 hover:scale-105"
            >
              Plant a Tree <IconArrow className="h-4 w-4 rotate-45" />
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-2 rounded-full bg-white/95 px-6 py-3 text-sm font-medium text-[#0b0a12] transition-transform duration-200 hover:scale-105"
            >
              View Map <IconArrow className="h-4 w-4 rotate-45" />
            </Link>
          </div>
        </div></Reveal>
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
        <p className="mb-8 text-center text-xs uppercase tracking-widest text-white/40">
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
            background="#0b0a12"
            radius={190}
          />
        </div>
        <LogoMarquee /></Reveal>
      </section>

      {/* ---------- The Process ---------- */}
      <section className="border-t border-white/5 bg-[#0d0d0d] px-6 py-24 md:px-16">
        <Reveal>
        <div className="mx-auto max-w-[1120px]">
          <p className="mb-4 text-center font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-[0.15em] text-[#f0a830]">
            The Process
          </p>
          <h2 className="mb-4 text-center font-[family-name:var(--font-syne)] text-[36px] font-bold leading-tight tracking-[-0.02em] md:text-[52px]">
            Simple to plant.
            <br />
            Impossible to fake.
          </h2>
          <p className="mx-auto mb-16 max-w-lg text-center leading-[1.6] text-[#cccccc]">
            Six steps from tree in the ground to proof on-chain. No crypto knowledge
            required to get started.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#0c0c15]"
              >
                <StepIcon step={(i + 1) as 1 | 2 | 3 | 4 | 5 | 6} className="mb-4 h-12 w-12" />
                <span className="mb-4 block font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#f0a830]">
                  {s.n}
                </span>
                <h3 className="mb-2 font-[family-name:var(--font-syne)] text-xl font-bold tracking-[-0.02em]">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>

          {/* Glowing green "shelf" light beneath the step cards, ported from
              the source site's "Highlights" decoration */}
          <div className="relative mt-2 h-16" aria-hidden="true">
            <div className="absolute left-1/2 top-0 h-12 w-[90%] -translate-x-1/2 rounded-full bg-[#a9f5ae] opacity-10 blur-[64px]" />
            <div className="absolute left-1/2 top-2 h-4 w-[85%] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-[#2d6a31] to-transparent opacity-40 blur-[20px]" />
            <div className="absolute left-1/2 top-3 h-2 w-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-[#2d6a31] to-transparent opacity-80 blur-[10px]" />
          </div>
        </div></Reveal>
      </section>

      {/* ---------- Why We Exist ---------- */}
      <section id="overview" className="px-6 py-24 md:px-16">
        <Reveal>
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-4 text-center font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px]">
            Why We Exist
          </h2>
          <p className="mx-auto mb-20 max-w-2xl text-center leading-[1.6] text-[#cccccc]">
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
                        className="rounded-full bg-[#121319] px-4 py-1.5 text-xs text-[#beafff]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-4 font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px]">
                    {block.heading}
                  </h3>
                  <p className="text-muted-foreground">{block.body}</p>
                </div>
                <div className="group relative aspect-[4/3] flex-1 overflow-hidden rounded-xl bg-white/5">
                  <img src={block.image} alt={block.heading} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              </div>
            ))}
          </div>
        </div></Reveal>
      </section>

      {/* ---------- Features (replaces the crypto-trading feature grid) ---------- */}
      <section id="benefits" className="px-6 py-24 md:px-16">
        <Reveal>
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-4 text-center font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px]">
            Built for verification, not speculation
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center leading-[1.6] text-[#cccccc]">
            Every part of the system exists to make one thing hard to fake: proof
            that a tree was actually planted, actually verified, and actually
            survives.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-white/5 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/40 hover:bg-[#0c0c15]"
              >
                <h5 className="mb-2 font-[family-name:var(--font-dm-sans)] text-lg font-medium tracking-[-0.02em]">
                  {f.title}
                </h5>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div></Reveal>
      </section>

      {/* ---------- Registry stats (replaces the live crypto price ticker) ---------- */}
      <section className="px-6 py-24 md:px-16">
        <Reveal>
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-4 text-center font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px]">
            Keep Your Environment Secured On-Chain
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center leading-[1.6] text-[#cccccc]">
            Track live tree, verification, and Nature Hero activity as it happens.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {registryStats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-gradient-to-br from-[#08080f] to-[#12121c] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <div className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-white">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </div></Reveal>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="px-6 py-24 md:px-16">
        <Reveal>
        <div className="mx-auto max-w-[1008px]">
          <h2 className="mb-4 text-center font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px]">
            From seed to certificate
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center leading-[1.6] text-[#cccccc]">
            Four steps from signup to your first verified tree on-chain.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step) => (
              <div
                key={step.n}
                className="relative rounded-xl border border-[#1a3e1c] bg-[#05050a] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1db954]/50"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2d6a31]/20">
                  <span className="text-lg font-medium">{step.n}</span>
                </div>
                <p className="text-white/80">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/tree-reg"
              className="rounded-full bg-white/95 px-6 py-3 text-sm font-medium text-[#0b0a12] transition-transform duration-200 hover:scale-105"
            >
              Plant Tree <IconArrow className="inline h-4 w-4 rotate-45" />
            </Link>
          </div>
        </div></Reveal>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="px-6 py-24 md:px-16">
        <Reveal>
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-xl p-9 transition-transform duration-500 hover:-translate-y-2"
            >
              <img src={t.image} alt={t.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
              {/* Original site used "Satoshi" here (a Fontshare font, not on
                  Google Fonts) — using Syne as the closest loaded match.
                  Swap in Satoshi via @font-face if you want an exact match. */}
              <p className="relative z-10 mb-6 font-[family-name:var(--font-syne)] text-xl font-bold leading-snug">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="relative z-10 text-sm">
                <div className="font-bold">{t.name}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div></Reveal>
      </section>

      {/* ---------- Global Registry / Map ---------- */}
      <section className="px-6 py-24 md:px-16">
        <Reveal>
        <div className="mx-auto max-w-[1008px] text-center">
          <p className="mb-4 font-[family-name:var(--font-space-mono)] text-sm font-bold uppercase tracking-[0.12em] text-[#ede8dc]">
            Global Registry
          </p>
          <h2 className="mb-6 font-[family-name:var(--font-syne)] text-[36px] font-bold tracking-[-0.02em] md:text-[52px]">
            Every tree has a permanent address.
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-white/80">
            Our interactive map shows every verified tree on Earth. Click any pin to
            see its full verification history, on-chain proof, and the Nature
            Heroes who confirmed it.
          </p>

          <div className="mb-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            <div className="rounded-2xl border border-[#ddd8ce] bg-[#f9f6ef] p-5 text-[#1a1a18] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              <IconGPS className="mb-3 h-9 w-9" />
              <div className="mb-1 font-medium">GPS-verified coordinates</div>
              <div className="text-sm text-[#7a7870]">
                Every tree is pinned to exact GPS location submitted at registration
              </div>
            </div>
            <div className="rounded-2xl border border-[#ddd8ce] bg-[#f9f6ef] p-5 text-[#1a1a18] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              <IconRealtime className="mb-3 h-9 w-9" />
              <div className="mb-1 font-medium">Real-time updates</div>
              <div className="text-sm text-[#7a7870]">
                New trees appear as soon as 2-of-2 validation is complete
              </div>
            </div>
            <div className="rounded-2xl border border-[#ddd8ce] bg-[#f9f6ef] p-5 text-[#1a1a18] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              <IconOnChain className="mb-3 h-9 w-9" />
              <div className="mb-1 font-medium">On-chain proof for every pin</div>
              <div className="text-sm text-[#7a7870]">
                Click any tree to view its Solana transaction and IPFS metadata
              </div>
            </div>
          </div>

          <Link
            href="/map"
            className="inline-block rounded-full bg-[#1db954] px-9 py-3.5 text-sm font-medium transition-transform duration-200 hover:scale-105"
          >
            Explore the Map
          </Link>

          {/* Live registry map, ported from the site's real interactive widget */}
          <div className="h-[600px] overflow-hidden rounded-2xl border border-border">
            <TreeMap />
          </div>

          {/* Rotating dot-matrix globe, same component as the one before the
              footer, reused here to match the source site's layout */}
          <div className="relative mx-auto mt-16 h-[420px] w-full max-w-[700px] md:h-[600px]">
            <DotGlobe className="h-full w-full" />
          </div>
        </div></Reveal>
      </section>

      {/* ---------- NFT Identity / Mint gallery ---------- */}
      <section id="nft" className="relative overflow-hidden border-t border-white/5 bg-black">
        <Reveal>
          <div className="px-6 pb-16 pt-24 text-center md:px-16">
            <h2 className="mx-auto mb-6 max-w-lg font-[family-name:var(--font-dm-sans)] text-[32px] font-medium leading-tight tracking-[-0.02em] md:text-[44px]">
              Mint Your Digital Tree Identity
            </h2>
            <p className="mx-auto mb-8 max-w-xl leading-[1.6] text-[#cccccc]">
              CNC DAO connects real environmental action with blockchain proof.
              Submit a tree, earn verification from Nature Heroes, and mint your
              stewardship on Solana.
            </p>
            <button className="mx-auto flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-medium transition-transform duration-200 hover:scale-105">
              <span className="h-2 w-2 rounded-full bg-white" />
              Mint NFT
            </button>
          </div>
        </Reveal>

        <Reveal>
          <div className="border-t border-white/5 bg-[#0d0d0d] px-6 py-16 md:px-16">
            <div className="mx-auto mb-8 flex max-w-[1200px] items-center justify-between">
              <div>
                <h3 className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">
                  Potential Variations
                </h3>
                <p className="text-sm text-white/50">
                  Each mint generates unique genetic markers and aesthetic traits.
                </p>
              </div>
              <Link
                href="#"
                className="hidden items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#f0a830] sm:flex"
              >
                View Collection <IconArrow className="h-3 w-3 rotate-45" />
              </Link>
            </div>

            {/* Tap a card to flip it. Art is a placeholder — the real cards
                use commissioned character illustrations that I can't
                reproduce; swap the gradient blocks for the real art. */}
            <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "CNC Green", price: "$12.00", token: "672VC" },
                { name: "CNC Tree Guy", price: "$12.00", token: "672VC" },
                { name: "CNC Green", price: "$12.00", token: "672VC" },
              ].map((card, i) => (
                <FlipCard
                  key={i}
                  className="h-[220px]"
                  front={
                    <div className="flex h-[220px] items-center overflow-hidden rounded-2xl border border-border bg-[#1b1b1e]">
                      <div className="flex h-full w-2/5 flex-shrink-0 items-center justify-center bg-gradient-to-br from-[#1db954]/25 via-[#0d0d0d] to-[#2d6a30]/40 text-[10px] text-white/30">
                        Art placeholder
                      </div>
                      <div className="flex-1 px-6">
                        <div className="mb-1 text-sm text-white/50">{card.price}</div>
                        <div className="mb-1 font-[family-name:var(--font-syne)] text-lg font-bold">
                          {card.name} 👀
                        </div>
                        <div className="mb-4 text-sm text-white/40">{card.token}</div>
                        <span className="inline-block rounded-full bg-white/95 px-5 py-2 text-xs font-semibold text-[#0b0a12]">
                          Mine NFT
                        </span>
                      </div>
                    </div>
                  }
                  back={
                    <div className="flex h-[220px] flex-col justify-center gap-3 rounded-2xl border border-[#1db954]/30 bg-[#12121c] px-6">
                      <div className="font-[family-name:var(--font-syne)] text-sm font-bold text-white">
                        {card.name} — Token Details
                      </div>
                      <div className="space-y-1.5 text-xs text-white/50">
                        <div>Trait: Genetic marker #{i + 1}</div>
                        <div>Chain: Solana</div>
                        <div>Status: Unminted</div>
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1db954]">
                        View on Explorer <IconArrow className="h-3 w-3 rotate-45" />
                      </span>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Global network globe ---------- */}
      <section className="border-t border-white/5 bg-[#0b0a12] px-6 py-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-[1120px] text-center">
            <h2 className="mb-4 font-[family-name:var(--font-dm-sans)] text-[24px] font-medium tracking-[-0.02em] md:text-[40px]">
              A planet-wide registry
            </h2>
            <p className="mx-auto mb-14 max-w-xl leading-[1.6] text-[#cccccc]">
              Every highlighted point is a region with verified trees on-chain.
              The network grows with every submission.
            </p>
            <div className="relative mx-auto h-[420px] w-full max-w-[560px] md:h-[560px]">
              <DotGlobe className="h-full w-full" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Footer ---------- */}
      <Footer />
    </main>
  )
}
