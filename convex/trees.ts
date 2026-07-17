import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("trees").collect()
  },
})

export const getByStatus = query({
  args: { status: v.union(v.literal("pending"), v.literal("verified"), v.literal("minted")) },
  handler: async (ctx, args) => {
    return await ctx.db.query("trees").withIndex("by_status", (q) => q.eq("status", args.status)).collect()
  },
})

export const get = query({
  args: { id: v.id("trees") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    species: v.string(),
    location: v.string(),
    country: v.string(),
    lat: v.number(),
    lng: v.number(),
    photoUrl: v.optional(v.string()),
    planterName: v.string(),
    planterEmail: v.string(),
    planterWallet: v.optional(v.string()),
    height: v.optional(v.number()),
    age: v.optional(v.string()),
    notes: v.optional(v.string()),
    landOwnership: v.string(),
  },
  handler: async (ctx, args) => {
    const treeId = await ctx.db.insert("trees", {
      ...args,
      status: "pending",
    })

    const stats = await ctx.db.query("stats").collect()
    const totalRecord = stats.find((s) => s.key === "total_trees")
    if (totalRecord) {
      await ctx.db.patch(totalRecord._id, { value: totalRecord.value + 1 })
    } else {
      await ctx.db.insert("stats", { key: "total_trees", value: 1 })
    }

    return treeId
  },
})

export const updateStatus = mutation({
  args: {
    id: v.id("trees"),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("minted")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status })

    const stats = await ctx.db.query("stats").collect()
    const statusCount = stats.find((s) => s.key === `${args.status}_trees`)
    if (statusCount) {
      await ctx.db.patch(statusCount._id, { value: statusCount.value + 1 })
    } else {
      await ctx.db.insert("stats", { key: `${args.status}_trees`, value: 1 })
    }

    return args.id
  },
})
