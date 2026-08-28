import { v, ConvexError } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    creatorId: v.id("users"),
    name: v.string(),
    region: v.string(),
    participantLimit: v.number(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.creatorId)
    if (!creator || (creator.role !== "nature_hero" && creator.role !== "admin")) {
      throw new ConvexError("Only approved Nature Heroes and Admins can create campaigns")
    }

    const id = await ctx.db.insert("campaigns", {
      name: args.name,
      region: args.region,
      participantLimit: args.participantLimit,
      description: args.description,
      imageUrl: args.imageUrl,
      createdBy:
        creator.displayName || creator.name || creator.walletAddress || "Unknown",
      createdByWallet: creator.walletAddress ?? `email:${creator.email ?? ""}`,
      joined: 0,
      createdAt: new Date().toISOString(),
    })
    return await ctx.db.get(id)
  },
})

export const join = mutation({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId)
    if (!campaign) throw new ConvexError("Campaign not found")
    if (campaign.joined >= campaign.participantLimit) {
      throw new ConvexError("This campaign is already full")
    }
    await ctx.db.patch(args.campaignId, {
      joined: campaign.joined + 1,
    })
    return await ctx.db.get(args.campaignId)
  },
})

export const remove = mutation({
  args: {
    adminId: v.id("users"),
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId)
    if (!admin || admin.role !== "admin") {
      throw new ConvexError("Only Admins can delete campaigns")
    }
    await ctx.db.delete(args.campaignId)
    return { success: true }
  },
})

export const list = query({
  handler: async (ctx) => {
    return ctx.db.query("campaigns").order("desc").collect()
  },
})
