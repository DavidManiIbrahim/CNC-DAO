import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

async function requireAdmin(ctx: any, userId: string) {
  const admin = await ctx.db.get(userId)
  if (!admin || admin.role !== "admin") {
    throw new Error("Admin access required")
  }
  return admin
}

export const apply = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
    email: v.string(),
    cityRegion: v.string(),
    country: v.string(),
    motivation: v.string(),
    experience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) throw new Error("User not found")

    const existing = await ctx.db
      .query("natureHeroApplications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first()
    if (existing) throw new Error("You already have a pending application")

    const id = await ctx.db.insert("natureHeroApplications", {
      userId: args.userId,
      walletAddress: user.walletAddress ?? `email:${user.email ?? ""}`,
      fullName: args.fullName,
      email: args.email,
      cityRegion: args.cityRegion,
      country: args.country,
      motivation: args.motivation,
      experience: args.experience,
      status: "pending",
      submittedAt: new Date().toISOString(),
    })

    await ctx.db.patch(args.userId, { role: "nature_hero_pending" })

    return {
      application: await ctx.db.get(id),
      user: await ctx.db.get(args.userId),
    }
  },
})

export const listApplications = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminId)
    return ctx.db.query("natureHeroApplications").order("desc").collect()
  },
})

export const setApplicationStatus = mutation({
  args: {
    adminId: v.id("users"),
    applicationId: v.id("natureHeroApplications"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminId)
    const application = await ctx.db.get(args.applicationId)
    if (!application) throw new Error("Application not found")

    await ctx.db.patch(args.applicationId, { status: args.status })

    if (args.status === "approved") {
      await ctx.db.patch(application.userId, { role: "nature_hero" })
    } else if (args.status === "rejected") {
      await ctx.db.patch(application.userId, { role: "user" })
    }

    return await ctx.db.get(args.applicationId)
  },
})
