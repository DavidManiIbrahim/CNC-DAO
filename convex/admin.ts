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

// ─── Helper: Verify admin password ─────────────────────
async function verifyAdminPassword(ctx: any, token: string, password: string) {
  const user = await getUserFromToken(ctx, token)
  if (!user || user.role !== "admin") {
    return null
  }

  // In production, this should be a proper password check
  // For now, we use a simple comparison with a stored admin password hash
  // The admin password is "admin123" (hashed with the same salt as user passwords)
  const adminPasswordHash = await hashPassword("admin123")
  if (password !== adminPasswordHash) {
    return null
  }

  return user
}

// Simple hash function (same as in auth.ts)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "cnc_dao_salt_v1")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// ─── Admin Dashboard ────────────────────────────────────
export const dashboard = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user || user.role !== "admin") {
      throw new Error("Not authorized")
    }

    const allUsers = await ctx.db.query("users").collect()
    const allTrees = await ctx.db.query("trees").collect()
    const allValidations = await ctx.db.query("validations").collect()
    const allApplications = await ctx.db.query("validatorApplications").collect()

    return {
      users: {
        total: allUsers.length,
        byRole: {
          users: allUsers.filter((u) => u.role === "user").length,
          validators: allUsers.filter((u) => u.role === "validator").length,
          admins: allUsers.filter((u) => u.role === "admin").length,
        },
        active: allUsers.filter((u) => u.isActive).length,
        inactive: allUsers.filter((u) => !u.isActive).length,
      },
      trees: {
        total: allTrees.length,
        pending: allTrees.filter((t) => t.status === "pending").length,
        validated: allTrees.filter((t) => t.status === "validated").length,
        verified: allTrees.filter((t) => t.status === "verified").length,
        minted: allTrees.filter((t) => t.status === "minted").length,
        rejected: allTrees.filter((t) => t.status === "rejected").length,
      },
      validations: {
        total: allValidations.length,
        approved: allValidations.filter((v) => v.decision === "approved").length,
        rejected: allValidations.filter((v) => v.decision === "rejected").length,
      },
      applications: {
        total: allApplications.length,
        pending: allApplications.filter((a) => a.status === "pending").length,
        approved: allApplications.filter((a) => a.status === "approved").length,
        rejected: allApplications.filter((a) => a.status === "rejected").length,
      },
    }
  },
})

// ─── Get pending validator applications ─────────────────
export const getPendingApplications = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user || user.role !== "admin") {
      throw new Error("Not authorized")
    }

    const applications = await ctx.db
      .query("validatorApplications")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect()

    const results = await Promise.all(
      applications.map(async (app) => {
        const applicant = await ctx.db.get(app.userId)
        return {
          _id: app._id,
          userId: app.userId,
          applicantName: applicant?.name ?? "Unknown",
          applicantEmail: applicant?.email ?? "Unknown",
          reason: app.reason,
          experience: app.experience,
          createdAt: app.createdAt,
        }
      })
    )

    return results
  },
})

// ─── Approve/Reject validator application ───────────────
export const reviewApplication = mutation({
  args: {
    token: v.string(),
    applicationId: v.id("validatorApplications"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserFromToken(ctx, args.token)
    if (!user || user.role !== "admin") {
      throw new Error("Not authorized")
    }

    const application = await ctx.db.get(args.applicationId)
    if (!application) throw new Error("Application not found")
    if (application.status !== "pending") {
      throw new Error("Application already reviewed")
    }

    await ctx.db.patch(args.applicationId, {
      status: args.decision,
      reviewedBy: user._id,
      reviewedAt: Date.now(),
      rejectionReason: args.decision === "rejected" ? args.rejectionReason : undefined,
    })

    // If approved, update user role to validator
    if (args.decision === "approved") {
      await ctx.db.patch(application.userId, { role: "validator" })
    }

    // Log admin action
    await ctx.db.insert("adminActions", {
      adminId: user._id,
      action: `review_validator_application_${args.decision}`,
      targetType: "validatorApplication",
      targetId: args.applicationId,
      details: args.decision === "rejected" ? args.rejectionReason : undefined,
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

// ─── Accept tree validation (admin with password) ───────
export const acceptTree = mutation({
  args: {
    token: v.string(),
    adminPassword: v.string(),
    treeId: v.id("trees"),
  },
  handler: async (ctx, args) => {
    const admin = await verifyAdminPassword(ctx, args.token, args.adminPassword)
    if (!admin) {
      throw new Error("Invalid admin credentials")
    }

    const tree = await ctx.db.get(args.treeId)
    if (!tree) throw new Error("Tree not found")

    if (tree.status !== "validated") {
      throw new Error("Tree must be validated by 2 validators first")
    }

    await ctx.db.patch(args.treeId, { status: "verified" })

    // Update stats
    const stats = await ctx.db.query("stats").collect()
    const verifiedStat = stats.find((s) => s.key === "verified_trees")
    if (verifiedStat) {
      await ctx.db.patch(verifiedStat._id, { value: verifiedStat.value + 1 })
    } else {
      await ctx.db.insert("stats", { key: "verified_trees", value: 1 })
    }

    // Log admin action
    await ctx.db.insert("adminActions", {
      adminId: admin._id,
      action: "accept_tree",
      targetType: "tree",
      targetId: args.treeId,
      details: `Accepted tree: ${tree.name} (${tree.species})`,
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

// ─── Reject tree (admin with password) ──────────────────
export const rejectTree = mutation({
  args: {
    token: v.string(),
    adminPassword: v.string(),
    treeId: v.id("trees"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await verifyAdminPassword(ctx, args.token, args.adminPassword)
    if (!admin) {
      throw new Error("Invalid admin credentials")
    }

    const tree = await ctx.db.get(args.treeId)
    if (!tree) throw new Error("Tree not found")

    if (tree.status !== "validated") {
      throw new Error("Tree must be validated by 2 validators first")
    }

    await ctx.db.patch(args.treeId, { status: "rejected" })

    // Log admin action
    await ctx.db.insert("adminActions", {
      adminId: admin._id,
      action: "reject_tree",
      targetType: "tree",
      targetId: args.treeId,
      details: `Rejected tree: ${tree.name} - Reason: ${args.reason}`,
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

// ─── Revoke validator badge ─────────────────────────────
export const revokeValidator = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await getUserFromToken(ctx, args.token)
    if (!admin || admin.role !== "admin") {
      throw new Error("Not authorized")
    }

    const user = await ctx.db.get(args.userId)
    if (!user) throw new Error("User not found")

    if (user.role !== "validator") {
      throw new Error("User is not a validator")
    }

    // Don't allow revoking other admins
    if (user.role === "admin") {
      throw new Error("Cannot revoke admin role")
    }

    await ctx.db.patch(args.userId, { role: "user" })

    // Log admin action
    await ctx.db.insert("adminActions", {
      adminId: admin._id,
      action: "revoke_validator",
      targetType: "user",
      targetId: args.userId,
      details: `Revoked validator badge from: ${user.name} (${user.email})`,
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

// ─── Toggle user active status ──────────────────────────
export const toggleUserActive = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await getUserFromToken(ctx, args.token)
    if (!admin || admin.role !== "admin") {
      throw new Error("Not authorized")
    }

    const user = await ctx.db.get(args.userId)
    if (!user) throw new Error("User not found")

    // Don't allow deactivating other admins
    if (user.role === "admin" && user._id !== admin._id) {
      throw new Error("Cannot deactivate other admins")
    }

    await ctx.db.patch(args.userId, { isActive: !user.isActive })

    // Log admin action
    await ctx.db.insert("adminActions", {
      adminId: admin._id,
      action: user.isActive ? "deactivate_user" : "activate_user",
      targetType: "user",
      targetId: args.userId,
      details: `${user.isActive ? "Deactivated" : "Activated"} user: ${user.name} (${user.email})`,
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

// ─── Get admin action log ──────────────────────────────
export const getActionLog = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await getUserFromToken(ctx, args.token)
    if (!admin || admin.role !== "admin") {
      throw new Error("Not authorized")
    }

    const limit = args.limit ?? 50
    const actions = await ctx.db
      .query("adminActions")
      .withIndex("by_adminId", (q) => q.eq("adminId", admin._id))
      .order("desc")
      .take(limit)

    return actions
  },
})
