"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { IconCheck, IconArrow } from "@/components/Icons"
import { connectMockWallet } from "@/lib/mockAuth"

const wallets = [
  { name: "Phantom", note: "DETECTED", emoji: "👻" },
  { name: "Backpack", note: "", emoji: "🎒" },
  { name: "MetaMask", note: "", emoji: "🦊" },
  { name: "WalletConnect", note: "QR CODE / MOBILE", emoji: "🔗" },
  { name: "Coinbase Wallet", note: "", emoji: "🔵" },
]

const guarantees = [
  "You retain full custody & control of your digital identity",
  "No funds are ever directly accessed or stored by the platform",
  "Every submission or verification requires signature approval",
]

export default function ConnectWalletPage() {
  const router = useRouter()

  function handleConnect() {
    connectMockWallet()
    router.push("/dashboard")
  }

  function handleGoogleSignIn() {
    signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <main className="bg-[#0b0a12] text-white font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="flex min-h-[80vh] items-center justify-center px-6 py-16 md:px-16">
        <Reveal className="w-full flex justify-center">
          <div className="w-full rounded-2xl border border-[#1db954]/20 bg-gradient-to-b from-[#12121c] to-[#08080f] p-8 shadow-[0_0_60px_-15px_rgba(29,185,84,0.25)]">
            <div className="mb-6 flex justify-center">
              <span className="flex items-center gap-1.5 rounded-full border border-[#1db954]/30 bg-[#1db954]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1db954]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1db954]" />
                Secure verification gateway
              </span>
            </div>

            <div className="mb-8 text-center">
              <img
                src="https://framerusercontent.com/images/XkdqyILHzud8shJDghKw5DhZuw.png"
                alt="CNC DAO"
                className="mx-auto mb-4 h-10 w-10 object-cover"
              />
              <h1 className="mb-1 font-[family-name:var(--font-syne)] text-2xl font-bold">
                Connect Wallet
              </h1>
              <p className="text-sm text-white/50">Access your CNC DAO dashboard securely</p>
            </div>

            <div className="mb-8 flex flex-col gap-3">
              {wallets.map((w) => (
                <button
                  key={w.name}
                  onClick={handleConnect}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition-colors hover:border-[#1db954]/40 hover:bg-white/[0.06]"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{w.emoji}</span>
                    <span className="text-sm font-medium">{w.name}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                    {w.note}
                    <IconArrow className="h-3 w-3 rotate-45" />
                  </span>
                </button>
              ))}

              <div className="my-1 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30">
                  or
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <Link
                href="/auth"
                className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition-colors hover:border-[#1db954]/40 hover:bg-white/[0.06]"
              >
                <span className="text-xl">✉️</span>
                <span className="text-sm font-medium">Sign in with Email</span>
              </Link>

              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3.5 text-left transition-colors hover:bg-white/90"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0">
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.55-5.17 3.55-8.66Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
                  <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z" />
                </svg>
                <span className="text-sm font-medium text-[#0b0a12]">Sign in with Google</span>
              </button>
            </div>

            <div className="mb-6 flex flex-col gap-2.5 border-t border-white/10 pt-6">
              {guarantees.map((g) => (
                <div key={g} className="flex items-start gap-2 text-xs text-white/60">
                  <IconCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  {g}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs">
              <button onClick={handleConnect} className="text-white/50 hover:text-white">
                Continue in Demo Mode (Read-only)
              </button>
              <Link href="/contact" className="text-white/50 hover:text-white">
                How connection works
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  )
}
