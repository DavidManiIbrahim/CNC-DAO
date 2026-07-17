import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // ─── Users ────────────────────────────────────────────
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("user"), v.literal("validator"), v.literal("admin")),
    walletAddress: v.optional(v.string()),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // ─── Sessions ─────────────────────────────────────────
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  // ─── Validator Applications ───────────────────────────
  validatorApplications: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    reason: v.string(),
    experience: v.optional(v.string()),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // ─── Trees (updated with planterId) ──────────────────
  trees: defineTable({
    name: v.string(),
    species: v.string(),
    location: v.string(),
    country: v.string(),
    lat: v.number(),
    lng: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("validated"),
      v.literal("verified"),
      v.literal("minted"),
      v.literal("rejected")
    ),
    photoUrl: v.optional(v.string()),
    planterId: v.optional(v.id("users")),
    planterName: v.string(),
    planterEmail: v.string(),
    planterWallet: v.optional(v.string()),
    height: v.optional(v.number()),
    age: v.optional(v.string()),
    notes: v.optional(v.string()),
    landOwnership: v.string(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_country", ["country"])
    .index("by_lat_lng", ["lat", "lng"])
    .index("by_planterId", ["planterId"]),

  // ─── Tree Validations (2-of-2 consensus) ─────────────
  validations: defineTable({
    treeId: v.id("trees"),
    validatorId: v.id("users"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_treeId", ["treeId"])
    .index("by_validatorId", ["validatorId"])
    .index("by_treeId_validatorId", ["treeId", "validatorId"]),

  // ─── Admin Actions (audit log) ───────────────────────
  adminActions: defineTable({
    adminId: v.id("users"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_adminId", ["adminId"])
    .index("by_targetType", ["targetType"]),

  // ─── Stats ────────────────────────────────────────────
  stats: defineTable({
    key: v.string(),
    value: v.number(),
  }).index("by_key", ["key"]),
})
