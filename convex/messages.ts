import { v, ConvexError } from "convex/values"
import { mutation, query } from "./_generated/server"

export const submit = mutation({
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

export const list = query({
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

export const updateStatus = mutation({
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

export const remove = mutation({
  args: {
    adminId: v.optional(v.string()),
    messageId: v.id("contactMessages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId)
    return { success: true }
  },
})
