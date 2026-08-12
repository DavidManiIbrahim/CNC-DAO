import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

async function requireVerifier(ctx: any, userId: string) {
  const user = await ctx.db.get(userId)
  if (!user || (user.role !== "nature_hero" && user.role !== "admin")) {
    throw new Error("Nature Hero or Admin access required")
  }
  return user
}

export const register = mutation({
  args: {
    walletAddress: v.string(),
    name: v.string(),
    species: v.string(),
    location: v.string(),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("trees", {
      walletAddress: args.walletAddress,
      name: args.name,
      species: args.species,
      location: args.location,
      lat: args.lat,
      lng: args.lng,
      status: "pending",
      createdAt: new Date().toISOString(),
    })
    return await ctx.db.get(id)
  },
})

export const listMine = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("trees")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", args.walletAddress))
      .order("desc")
      .collect()
  },
})

export const listAll = query({
  handler: async (ctx) => {
    return ctx.db.query("trees").order("desc").collect()
  },
})

export const listPending = query({
  args: { verifierId: v.id("users") },
  handler: async (ctx, args) => {
    await requireVerifier(ctx, args.verifierId)
    return ctx.db
      .query("trees")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect()
  },
})

export const updateStatus = mutation({
  args: {
    verifierId: v.id("users"),
    treeId: v.id("trees"),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("minted")),
  },
  handler: async (ctx, args) => {
    await requireVerifier(ctx, args.verifierId)
    const tree = await ctx.db.get(args.treeId)
    if (!tree) throw new Error("Tree not found")
    await ctx.db.patch(args.treeId, { status: args.status })
    return await ctx.db.get(args.treeId)
  },
})
