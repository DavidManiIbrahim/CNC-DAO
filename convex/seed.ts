import { mutation } from "./_generated/server"

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("trees").collect()
    if (existing.length > 0) return "already_seeded"

    const trees = [
      {
        name: "Neem tree #001",
        species: "Neem",
        location: "Lagos, Nigeria",
        country: "Nigeria",
        lat: 6.5244,
        lng: 3.3792,
        status: "minted" as const,
        planterName: "Adebayo O.",
        planterEmail: "adebayo@example.com",
        landOwnership: "Community/communal land",
      },
      {
        name: "Mango tree #001",
        species: "Mango",
        location: "Yola, Nigeria",
        country: "Nigeria",
        lat: 9.2035,
        lng: 12.4954,
        status: "minted" as const,
        planterName: "Fatima H.",
        planterEmail: "fatima@example.com",
        landOwnership: "I own this land",
      },
    ]

    for (const tree of trees) {
      await ctx.db.insert("trees", tree)
    }

    await ctx.db.insert("stats", { key: "total_trees", value: 2 })
    await ctx.db.insert("stats", { key: "minted_trees", value: 2 })
    await ctx.db.insert("stats", { key: "verified_trees", value: 0 })
    await ctx.db.insert("stats", { key: "pending_trees", value: 0 })
    await ctx.db.insert("stats", { key: "countries", value: 38 })
    await ctx.db.insert("stats", { key: "heroes", value: 124 })

    return "seeded"
  },
})
