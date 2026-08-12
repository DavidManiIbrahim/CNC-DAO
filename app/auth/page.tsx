"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { setMockUser } from "@/lib/mockAuth"
import type { MockUser } from "@/lib/mockAuth"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [convexReady, setConvexReady] = useState(true)

  const registerMutation = useMutation(api.users.register)
  const loginMutation = useMutation(api.users.login)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      setConvexReady(false)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result =
        mode === "register"
          ? await registerMutation({
              email,
              password,
              name: name || undefined,
            })
          : await loginMutation({ email, password })

      const user: MockUser = {
        userId: result._id,
        walletAddress: `email:${result.email}`,
        role: "user",
        displayName: result.name ?? undefined,
        joinedAt: result.joinedAt,
      }
      setMockUser(user)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-[#0b0a12] text-white font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="flex min-h-[80vh] items-center justify-center px-6 py-16 md:px-16">
        <Reveal className="w-full flex justify-center">
          <div className="w-full max-w-md rounded-2xl border border-[#1db954]/20 bg-gradient-to-b from-[#12121c] to-[#08080f] p-8 shadow-[0_0_60px_-15px_rgba(29,185,84,0.25)]">
            {!convexReady ? (
              <div className="py-8 text-center">
                <p className="text-white/70">
                  Convex backend not configured. Run{" "}
                  <code className="text-[#1db954]">npx convex dev</code>{" "}
                  and add <code className="text-[#1db954]">NEXT_PUBLIC_CONVEX_URL</code> to your .env.local file.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-center">
                  <span className="flex items-center gap-1.5 rounded-full border border-[#1db954]/30 bg-[#1db954]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1db954]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1db954]" />
                    {mode === "login" ? "Sign in" : "Create account"}
                  </span>
                </div>

                <div className="mb-8 text-center">
                  <img
                    src="https://framerusercontent.com/images/XkdqyILHzud8shJDghKw5DhZuw.png"
                    alt="CNC DAO"
                    className="mx-auto mb-4 h-10 w-10 object-cover"
                  />
                  <h1 className="mb-1 font-[family-name:var(--font-syne)] text-2xl font-bold">
                    {mode === "login" ? "Welcome Back" : "Join CNC DAO"}
                  </h1>
                  <p className="text-sm text-white/50">
                    {mode === "login"
                      ? "Sign in with your email and password"
                      : "Create an account to get started"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
                  {mode === "register" && (
                    <div>
                      <label htmlFor="name" className="mb-1 block text-xs font-medium text-white/60">
                        Name (optional)
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#1db954]/40"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="mb-1 block text-xs font-medium text-white/60">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#1db954]/40"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1 block text-xs font-medium text-white/60">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#1db954]/40"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1db954] px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-[#1db954]/90 disabled:opacity-50"
                  >
                    {loading
                      ? "Please wait..."
                      : mode === "login"
                        ? "Sign In"
                        : "Create Account"}
                  </button>
                </form>

                <div className="flex items-center justify-center gap-1 text-sm text-white/50">
                  <span>
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                  </span>
                  <button
                    onClick={() => {
                      setMode(mode === "login" ? "register" : "login")
                      setError("")
                    }}
                    className="font-medium text-[#1db954] hover:underline"
                  >
                    {mode === "login" ? "Register" : "Sign In"}
                  </button>
                </div>
              </>
            )}
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  )
}
