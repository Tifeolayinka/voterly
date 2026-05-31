import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const votingTypeValidator = v.union(
  v.literal("single"),
  v.literal("multiple"),
  v.literal("ranked")
);

export const addPosition = mutation({
  args: {
    voteId: v.id("votes"),
    title: v.string(),
    votingType: votingTypeValidator,
    maxSelections: v.optional(v.number()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const vote = await ctx.db.get(args.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Not found or unauthorized");
    return await ctx.db.insert("positions", {
      voteId: args.voteId,
      title: args.title,
      votingType: args.votingType,
      maxSelections: args.maxSelections,
      order: args.order,
    });
  },
});

export const updatePosition = mutation({
  args: {
    positionId: v.id("positions"),
    title: v.optional(v.string()),
    votingType: v.optional(votingTypeValidator),
    maxSelections: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const position = await ctx.db.get(args.positionId);
    if (!position) throw new Error("Position not found");
    const vote = await ctx.db.get(position.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Unauthorized");
    const { positionId, ...patch } = args;
    await ctx.db.patch(positionId, patch);
  },
});

export const deletePosition = mutation({
  args: { positionId: v.id("positions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const position = await ctx.db.get(args.positionId);
    if (!position) throw new Error("Position not found");
    const vote = await ctx.db.get(position.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Unauthorized");
    await ctx.db.delete(args.positionId);
  },
});

export const getPositionsWithCandidates = query({
  args: { voteId: v.id("votes") },
  handler: async (ctx, args) => {
    const positions = await ctx.db
      .query("positions")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .take(50);
    const sorted = [...positions].sort((a, b) => a.order - b.order);
    return await Promise.all(
      sorted.map(async (position) => {
        const candidates = await ctx.db
          .query("candidates")
          .withIndex("by_position", (q) =>
            q.eq("positionId", position._id)
          )
          .take(100);
        const sortedCandidates = [...candidates].sort((a, b) => a.order - b.order);
        return { ...position, candidates: sortedCandidates };
      })
    );
  },
});
