import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const userRoles = v.union(
  v.literal("user"),
  v.literal("nature_hero_pending"),
  v.literal("nature_hero"),
  v.literal("admin"),
)

export const treeStatuses = v.union(
  v.literal("pending"),
  v.literal("verified"),
  v.literal("minted"),
)

export const applicationStatuses = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
)

export const messageStatuses = v.union(
  v.literal("unread"),
  v.literal("read"),
  v.literal("resolved"),
)

export default defineSchema({
  users: defineTable({
    email: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    name: v.optional(v.string()),
    walletAddress: v.optional(v.string()),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: userRoles,
    joinedAt: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_walletAddress", ["walletAddress"]),

  trees: defineTable({
    walletAddress: v.string(),
    name: v.string(),
    species: v.string(),
    location: v.string(),
    lat: v.number(),
    lng: v.number(),
    imageUrl: v.optional(v.string()),
    status: treeStatuses,
    createdAt: v.string(),
  })
    .index("by_walletAddress", ["walletAddress"])
    .index("by_status", ["status"]),

  natureHeroApplications: defineTable({
    userId: v.id("users"),
    walletAddress: v.string(),
    fullName: v.string(),
    email: v.string(),
    cityRegion: v.string(),
    country: v.string(),
    motivation: v.string(),
    experience: v.optional(v.string()),
    status: applicationStatuses,
    submittedAt: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_userId", ["userId"]),

  campaigns: defineTable({
    name: v.string(),
    region: v.string(),
    participantLimit: v.number(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    createdBy: v.string(),
    createdByWallet: v.string(),
    joined: v.number(),
    createdAt: v.string(),
  }).index("by_createdAt", ["createdAt"]),

  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    status: messageStatuses,
    createdAt: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
})
