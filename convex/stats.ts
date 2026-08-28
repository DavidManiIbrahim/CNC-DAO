import { query } from "./_generated/server"

export const get = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db.query("stats").collect()
    const map: Record<string, number> = {}
    for (const stat of stats) {
      map[stat.key] = stat.value
    }
    return {
      totalTrees: map.total_trees ?? 0,
      pendingTrees: map.pending_trees ?? 0,
      verifiedTrees: map.verified_trees ?? 0,
      mintedTrees: map.minted_trees ?? 0,
      countries: map.countries ?? 38,
      heroes: map.heroes ?? 124,
    }
  },
})
