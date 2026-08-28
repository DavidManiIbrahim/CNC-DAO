import { v, ConvexError } from "convex/values"
import { mutation, query } from "./_generated/server"

type UserDoc = {
  _id: string
  email?: string
  passwordHash?: string
  name?: string
  walletAddress?: string
  displayName?: string
  bio?: string
  avatar?: string
  role: "user" | "nature_hero_pending" | "nature_hero" | "admin"
  joinedAt: string
}

function toPublicUser(user: UserDoc) {
  return {
    _id: user._id,
    email: user.email ?? null,
    name: user.name ?? null,
    walletAddress: user.walletAddress ?? null,
    displayName: user.displayName ?? null,
    bio: user.bio ?? null,
    avatar: user.avatar ?? null,
    role: user.role,
    joinedAt: user.joinedAt,
  }
}

async function requireAdmin(ctx: any, userId: string) {
  const admin = await ctx.db.get(userId)
  if (!admin || admin.role !== "admin") {
    throw new Error("Admin access required")
  }
  return admin
}

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
      throw new ConvexError("A user with this email already exists")
    }

    if (args.password.length < 6) {
      throw new ConvexError("Password must be at least 6 characters")
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

    const created = await ctx.db.get(userId)
    if (!created) throw new ConvexError("Failed to create user")
    return toPublicUser(created)
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
      throw new ConvexError("No account found with this email. Please check your email or create a new account.")
    }

    if (!user.passwordHash) {
      throw new ConvexError("This account was created with a wallet. Please connect your wallet to sign in.")
    }

    const [salt, storedHash] = user.passwordHash.split(":")
    const hash = await hashPassword(args.password, salt)

    if (hash !== storedHash) {
      throw new ConvexError("Incorrect password. Please try again.")
    }

    return toPublicUser(user)
  },
})

export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) return null
    return toPublicUser(user)
  },
})

/**
 * Demo wallet connect — get-or-create a Convex user for a wallet address.
 * Replace the fake address generation with a real wallet adapter (signed
 * message) when Solana integration lands.
 */
export const connectWallet = mutation({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", args.walletAddress))
      .first()

    if (existing) return toPublicUser(existing)

    const userId = await ctx.db.insert("users", {
      walletAddress: args.walletAddress,
      role: "user",
      joinedAt: new Date().toISOString(),
    })
    const created = await ctx.db.get(userId)
    if (!created) throw new Error("Failed to create user")
    return toPublicUser(created)
  },
})

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) throw new Error("User not found")

    const patch: { displayName?: string; bio?: string; avatar?: string } = {}
    if (args.displayName !== undefined) patch.displayName = args.displayName
    if (args.bio !== undefined) patch.bio = args.bio
    if (args.avatar !== undefined) patch.avatar = args.avatar

    await ctx.db.patch(args.userId, patch)
    const updated = await ctx.db.get(args.userId)
    if (!updated) throw new Error("User not found")
    return toPublicUser(updated)
  },
})

export const listUsers = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminId)
    const docs = await ctx.db.query("users").collect()
    return docs.map(toPublicUser)
  },
})

export const setUserRole = mutation({
  args: {
    adminId: v.id("users"),
    userId: v.id("users"),
    role: v.union(
      v.literal("user"),
      v.literal("nature_hero_pending"),
      v.literal("nature_hero"),
      v.literal("admin"),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminId)
    const target = await ctx.db.get(args.userId)
    if (!target) throw new Error("User not found")
    await ctx.db.patch(args.userId, { role: args.role })
    const updated = await ctx.db.get(args.userId)
    if (!updated) throw new Error("User not found")
    return toPublicUser(updated)
  },
})

export const removeUser = mutation({
  args: {
    adminId: v.id("users"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminId)
    if (args.adminId === args.userId) {
      throw new Error("You cannot remove your own account")
    }
    await ctx.db.delete(args.userId)
    return true
  },
})

// ─── CONTACT INQUIRIES & MESSAGES HANDLERS ─────────────────────────
export const listMessages = query({
  args: { adminId: v.optional(v.string()) },
  handler: async (ctx) => {
    try {
      const messages = await ctx.db.query("contactMessages").collect()
      return messages.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } catch {
      return []
    }
  },
})

export const submitMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim() || !args.email.trim() || !args.message.trim()) {
      throw new ConvexError("Please provide all required fields")
    }

    const messageId = await ctx.db.insert("contactMessages", {
      name: args.name.trim(),
      email: args.email.trim().toLowerCase(),
      message: args.message.trim(),
      status: "unread",
      createdAt: new Date().toISOString(),
    })

    return { success: true, messageId }
  },
})

export const updateMessageStatus = mutation({
  args: {
    adminId: v.optional(v.string()),
    messageId: v.id("contactMessages"),
    status: v.union(v.literal("unread"), v.literal("read"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.messageId)
    if (!target) throw new ConvexError("Message not found")
    await ctx.db.patch(args.messageId, { status: args.status })
    return { success: true }
  },
})

export const removeMessage = mutation({
  args: {
    adminId: v.optional(v.string()),
    messageId: v.id("contactMessages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId)
    return { success: true }
  },
})

