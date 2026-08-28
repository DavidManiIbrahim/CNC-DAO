"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import { api } from "@/convex/_generated/api"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { setMockUser } from "@/lib/mockAuth"
import type { MockUser } from "@/lib/mockAuth"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
    setSuccess("")
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
      setSuccess(
        mode === "login"
          ? "Login successful! Redirecting to dashboard..."
          : "Account created successfully! Redirecting..."
      )
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(typeof err.data === "string" ? err.data : JSON.stringify(err.data))
      } else if (err && typeof err === "object" && "data" in err && typeof (err as { data: unknown }).data === "string") {
        setError((err as { data: string }).data)
      } else if (err instanceof Error) {
        const cleaned = err.message
          .replace(/^\[CONVEX[^\]]*\]\s*/i, "")
          .replace(/^(?:Server Error\s*)?(?:Uncaught\s+)?Error:\s*/i, "")
          .split("\n")[0]
          .split(" at ")[0]
          .trim()
        setError(cleaned || "Something went wrong. Please try again.")
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-background text-foreground font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="flex min-h-[80vh] items-center justify-center px-6 py-16 md:px-16">
        <Reveal className="w-full flex justify-center">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
            {!convexReady ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
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
                    src="/favicon.png"
                    alt="CNC DAO"
                    className="mx-auto mb-4 h-10 w-10 object-cover"
                  />
                  <h1 className="mb-1 font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
                    {mode === "login" ? "Welcome Back" : "Join CNC DAO"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {mode === "login"
                      ? "Sign in with your email and password"
                      : "Create an account to get started"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
                  {mode === "register" && (
                    <div>
                      <label htmlFor="name" className="mb-1 block text-xs font-semibold text-foreground">
                        Name (optional)
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-[#1db954]/60"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="mb-1 block text-xs font-semibold text-foreground">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-[#1db954]/60"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1 block text-xs font-semibold text-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-border bg-input px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-[#1db954]/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 transition-colors hover:text-yellow-400"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-start gap-2.5 rounded-2xl border border-[#1db954]/20 bg-[#1db954]/10 px-4 py-3 text-sm text-[#1db954]">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{success}</span>
                    </div>
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

                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <span>
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                  </span>
                  <button
                    onClick={() => {
                      setMode(mode === "login" ? "register" : "login")
                      setError("")
                    }}
                    className="font-semibold text-[#1db954] hover:underline"
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
