import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// ─── Helper: Get user from token ───────────────────────
async function getUserFromToken(ctx: any, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first()

  if (!session || session.expiresAt < Date.now()) {
    return null
  }

  return await ctx.db.get(session.userId)
}

// ─── Get Profile ────────────────────────────────────────
export const getProfile = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user) return null

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

// ─── Update Profile ─────────────────────────────────────
export const updateProfile = mutation({
  args: {
    token: v.string(),
    name: v.optional(v.string()),
    walletAddress: v.optional(v.string()),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user) throw new Error("Not authenticated")

    const updates: Record<string, any> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.walletAddress !== undefined) updates.walletAddress = args.walletAddress
    if (args.country !== undefined) updates.country = args.country
    if (args.region !== undefined) updates.region = args.region
    if (args.bio !== undefined) updates.bio = args.bio
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl

    await ctx.db.patch(user._id, updates)
    return { success: true }
  },
})

// ─── User Dashboard ─────────────────────────────────────
export const dashboard = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user) return null

    // Get user's trees
    const trees = await ctx.db
      .query("trees")
      .withIndex("by_planterId", (q) => q.eq("planterId", user._id))
      .collect()

    // Get user's validations (if validator)
    const validations = user.role === "validator"
      ? await ctx.db
          .query("validations")
          .withIndex("by_validatorId", (q) => q.eq("validatorId", user._id))
          .collect()
      : []

    // Get validator application status (if any)
    const application = await ctx.db
      .query("validatorApplications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first()

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        country: user.country,
        region: user.region,
      },
      stats: {
        totalTrees: trees.length,
        pendingTrees: trees.filter((t) => t.status === "pending").length,
        validatedTrees: trees.filter((t) => t.status === "validated").length,
        verifiedTrees: trees.filter((t) => t.status === "verified").length,
        mintedTrees: trees.filter((t) => t.status === "minted").length,
        rejectedTrees: trees.filter((t) => t.status === "rejected").length,
        totalValidations: validations.length,
      },
      recentTrees: trees.slice(0, 10),
      validatorApplication: application,
    }
  },
})

// ─── Get User by ID (for admin) ────────────────────────
export const getById = query({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requester = await getUserFromToken(ctx, args.token)
    if (!requester || requester.role !== "admin") {
      throw new Error("Not authorized")
    }

    const user = await ctx.db.get(args.userId)
    if (!user) return null

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

// ─── List All Users (admin only) ───────────────────────
export const listAll = query({
  args: {
    token: v.string(),
    role: v.optional(v.union(v.literal("user"), v.literal("validator"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    const requester = await getUserFromToken(ctx, args.token)
    if (!requester || requester.role !== "admin") {
      throw new Error("Not authorized")
    }

    let users
    if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect()
    } else {
      users = await ctx.db.query("users").collect()
    }

    return users.map((u) => ({
      _id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      country: u.country,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }))
  },
})
