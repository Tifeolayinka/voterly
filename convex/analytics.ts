import { v } from "convex/values";
import { query } from "./_generated/server";

export const getSubmissionTimestamps = query({
  args: { voteId: v.id("votes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const vote = await ctx.db.get(args.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier) return [];
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .order("asc")
      .take(10000);
    return submissions.map((s) => s._creationTime);
  },
});

export const getFlaggedActivity = query({
  args: { voteId: v.id("votes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const vote = await ctx.db.get(args.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier) return [];
    return await ctx.db
      .query("flaggedActivity")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .order("desc")
      .take(100);
  },
});
