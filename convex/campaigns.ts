import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    creatorId: v.id("users"),
    name: v.string(),
    region: v.string(),
    participantLimit: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.creatorId)
    if (!creator || (creator.role !== "nature_hero" && creator.role !== "admin")) {
      throw new Error("Only approved Nature Heroes can create campaigns")
    }

    const id = await ctx.db.insert("campaigns", {
      name: args.name,
      region: args.region,
      participantLimit: args.participantLimit,
      description: args.description,
      createdBy:
        creator.displayName || creator.name || creator.walletAddress || "Unknown",
      createdByWallet: creator.walletAddress ?? `email:${creator.email ?? ""}`,
      joined: 0,
      createdAt: new Date().toISOString(),
    })
    return await ctx.db.get(id)
  },
})

export const list = query({
  handler: async (ctx) => {
    return ctx.db.query("campaigns").order("desc").collect()
  },
})
