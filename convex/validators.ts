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

// ─── Apply to become a validator ────────────────────────
export const apply = mutation({
  args: {
    token: v.string(),
    reason: v.string(),
    experience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user) throw new Error("Not authenticated")

    // Check if already a validator
    if (user.role === "validator") {
      throw new Error("Already a validator")
    }

    // Check for pending application
    const pendingApp = await ctx.db
      .query("validatorApplications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first()

    if (pendingApp && pendingApp.status === "pending") {
      throw new Error("Application already pending")
    }

    const applicationId = await ctx.db.insert("validatorApplications", {
      userId: user._id,
      status: "pending",
      reason: args.reason,
      experience: args.experience,
      createdAt: Date.now(),
    })

    return applicationId
  },
})

// ─── Get my application status ──────────────────────────
export const getMyApplication = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user) return null

    const application = await ctx.db
      .query("validatorApplications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first()

    return application
  },
})

// ─── Validate a tree (validators only) ──────────────────
export const validateTree = mutation({
  args: {
    token: v.string(),
    treeId: v.id("trees"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user) throw new Error("Not authenticated")
    if (user.role !== "validator" && user.role !== "admin") {
      throw new Error("Only validators can validate trees")
    }

    const tree = await ctx.db.get(args.treeId)
    if (!tree) throw new Error("Tree not found")

    if (tree.status !== "pending") {
      throw new Error("Tree is not pending validation")
    }

    // Check if already validated by this validator
    const existingValidation = await ctx.db
      .query("validations")
      .withIndex("by_treeId_validatorId", (q: any) =>
        q.eq("treeId", args.treeId).eq("validatorId", user._id)
      )
      .first()

    if (existingValidation) {
      throw new Error("Already validated this tree")
    }

    // Create validation record
    await ctx.db.insert("validations", {
      treeId: args.treeId,
      validatorId: user._id,
      decision: args.decision,
      notes: args.notes,
      createdAt: Date.now(),
    })

    // Count validations for this tree
    const validations = await ctx.db
      .query("validations")
      .withIndex("by_treeId", (q) => q.eq("treeId", args.treeId))
      .collect()

    const approvedCount = validations.filter((v) => v.decision === "approved").length
    const rejectedCount = validations.filter((v) => v.decision === "rejected").length

    // If 2 validators approve, mark as "validated" (ready for admin review)
    if (approvedCount >= 2) {
      await ctx.db.patch(args.treeId, { status: "validated" })
    }

    // If 2 validators reject, mark as "rejected"
    if (rejectedCount >= 2) {
      await ctx.db.patch(args.treeId, { status: "rejected" })
    }

    return {
      treeId: args.treeId,
      approvedCount,
      rejectedCount,
      totalValidations: validations.length,
    }
  },
})

// ─── Get validations for a tree ─────────────────────────
export const getTreeValidations = query({
  args: { treeId: v.id("trees") },
  handler: async (ctx, args) => {
    const validations = await ctx.db
      .query("validations")
      .withIndex("by_treeId", (q) => q.eq("treeId", args.treeId))
      .collect()

    const results = await Promise.all(
      validations.map(async (v) => {
        const validator = await ctx.db.get(v.validatorId)
        return {
          _id: v._id,
          decision: v.decision,
          notes: v.notes,
          createdAt: v.createdAt,
          validatorName: validator?.name ?? "Unknown",
          validatorEmail: validator?.email ?? "Unknown",
        }
      })
    )

    return results
  },
})

// ─── Get my validations (for validators) ────────────────
export const getMyValidations = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user) return null

    if (user.role !== "validator" && user.role !== "admin") {
      throw new Error("Not a validator")
    }

    const validations = await ctx.db
      .query("validations")
      .withIndex("by_validatorId", (q) => q.eq("validatorId", user._id))
      .collect()

    const results = await Promise.all(
      validations.map(async (v) => {
        const tree = await ctx.db.get(v.treeId)
        return {
          _id: v._id,
          treeId: v.treeId,
          decision: v.decision,
          notes: v.notes,
          createdAt: v.createdAt,
          treeName: tree?.name ?? "Unknown",
          treeSpecies: tree?.species ?? "Unknown",
          treeStatus: tree?.status ?? "unknown",
        }
      })
    )

    return results
  },
})

// ─── Get pending trees (for validators) ─────────────────
export const getPendingTrees = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user) return null

    if (user.role !== "validator" && user.role !== "admin") {
      throw new Error("Not a validator")
    }

    const pendingTrees = await ctx.db
      .query("trees")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect()

    // Filter out trees already validated by this user
    const filteredTrees = []
    for (const tree of pendingTrees) {
      const existingValidation = await ctx.db
        .query("validations")
        .withIndex("by_treeId_validatorId", (q: any) =>
          q.eq("treeId", tree._id).eq("validatorId", user._id)
        )
        .first()

      if (!existingValidation) {
        filteredTrees.push(tree)
      }
    }

    return filteredTrees
  },
})

// ─── Get validated trees (for admin review) ─────────────
export const getValidatedTrees = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user) return null

    if (user.role !== "admin") {
      throw new Error("Not authorized")
    }

    const validatedTrees = await ctx.db
      .query("trees")
      .withIndex("by_status", (q) => q.eq("status", "validated"))
      .collect()

    return validatedTrees
  },
})
