import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    role: v.union(
      v.literal("user"),
      v.literal("nature_hero_pending"),
      v.literal("nature_hero"),
      v.literal("admin"),
    ),
    joinedAt: v.string(),
  }).index("by_email", ["email"]),
})
