import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const HEARTBEAT_WINDOW_MS = 30_000;

export const upsertPresence = mutation({
  args: {
    voteId: v.id("votes"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_vote_and_session", (q) =>
        q.eq("voteId", args.voteId).eq("sessionId", args.sessionId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeenAt: Date.now() });
    } else {
      await ctx.db.insert("presence", {
        voteId: args.voteId,
        sessionId: args.sessionId,
        lastSeenAt: Date.now(),
      });
    }
  },
});

export const getActiveCount = query({
  args: { voteId: v.id("votes") },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - HEARTBEAT_WINDOW_MS;
    const records = await ctx.db
      .query("presence")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .take(1000);
    return records.filter((r) => r.lastSeenAt >= cutoff).length;
  },
});
