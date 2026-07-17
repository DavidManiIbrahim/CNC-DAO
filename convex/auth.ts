import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Simple hash function (in production, use a proper bcrypt-like library)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "cnc_dao_salt_v1")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// ─── Signup ─────────────────────────────────────────────
export const signup = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    walletAddress: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (existingUser) {
      throw new Error("Email already registered")
    }

    const passwordHash = await hashPassword(args.password)
    const now = Date.now()

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash,
      role: "user",
      walletAddress: args.walletAddress,
      country: args.country,
      isActive: true,
      createdAt: now,
    })

    const token = generateToken()
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return { userId, token }
  },
})

// ─── Login ──────────────────────────────────────────────
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (!user) {
      throw new Error("Invalid email or password")
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated")
    }

    const isValid = await verifyPassword(args.password, user.passwordHash)
    if (!isValid) {
      throw new Error("Invalid email or password")
    }

    const token = generateToken()
    const now = Date.now()
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return { userId: user._id, token, role: user.role }
  },
})

// ─── Logout ─────────────────────────────────────────────
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (session) {
      await ctx.db.delete(session._id)
    }

    return { success: true }
  },
})

// ─── Get Current User (from token) ─────────────────────
export const getCurrentUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session || session.expiresAt < Date.now()) {
      return null
    }

    const user = await ctx.db.get(session.userId)
    if (!user) {
      return null
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      walletAddress: user.walletAddress,
      country: user.country,
      region: user.region,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  },
})

// ─── Validate Token (internal helper) ──────────────────
export const validateToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session || session.expiresAt < Date.now()) {
      return null
    }

    return session.userId
  },
})
