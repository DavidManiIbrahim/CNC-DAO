import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  )
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  )
  return bufferToHex(hash)
}

function generateSalt(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return bufferToHex(array.buffer)
}

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (existing) {
      throw new Error("A user with this email already exists")
    }

    if (args.password.length < 6) {
      throw new Error("Password must be at least 6 characters")
    }

    const salt = generateSalt()
    const passwordHash = await hashPassword(args.password, salt)

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: `${salt}:${passwordHash}`,
      name: args.name,
      role: "user",
      joinedAt: new Date().toISOString(),
    })

    return {
      _id: userId,
      email: args.email,
      name: args.name,
      role: "user" as const,
      joinedAt: new Date().toISOString(),
    }
  },
})

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

    const [salt, storedHash] = user.passwordHash.split(":")
    const hash = await hashPassword(args.password, salt)

    if (hash !== storedHash) {
      throw new Error("Invalid email or password")
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      joinedAt: user.joinedAt,
    }
  },
})

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) return null
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      joinedAt: user.joinedAt,
    }
  },
})
