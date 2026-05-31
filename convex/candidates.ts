import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const addCandidate = mutation({
  args: {
    positionId: v.id("positions"),
    name: v.string(),
    photoUrl: v.optional(v.string()),
    photoUrls: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const position = await ctx.db.get(args.positionId);
    if (!position) throw new Error("Position not found");
    const vote = await ctx.db.get(position.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Unauthorized");
    return await ctx.db.insert("candidates", {
      positionId: args.positionId,
      name: args.name,
      photoUrl: args.photoUrl,
      photoUrls: args.photoUrls,
      bio: args.bio,
      order: args.order,
    });
  },
});

export const updateCandidate = mutation({
  args: {
    candidateId: v.id("candidates"),
    name: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    photoUrls: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) throw new Error("Not found");
    const position = await ctx.db.get(candidate.positionId);
    if (!position) throw new Error("Position not found");
    const vote = await ctx.db.get(position.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Unauthorized");
    const { candidateId, ...patch } = args;
    await ctx.db.patch(candidateId, patch);
  },
});

export const deleteCandidate = mutation({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) throw new Error("Not found");
    const position = await ctx.db.get(candidate.positionId);
    if (!position) throw new Error("Position not found");
    const vote = await ctx.db.get(position.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Unauthorized");
    await ctx.db.delete(args.candidateId);
  },
});
