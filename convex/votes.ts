import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

const accessControlValidator = v.object({
  mode: v.union(v.literal("open"), v.literal("restricted")),
  geoEnabled: v.boolean(),
  timeWindowEnabled: v.boolean(),
  onePerPhone: v.boolean(),
  otpRequired: v.boolean(),
  inviteOnly: v.boolean(),
});

export const createVote = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    return await ctx.db.insert("votes", {
      organiserId: identity.tokenIdentifier,
      title: args.title,
      description: args.description,
      bannerUrl: args.bannerUrl,
      slug: "",
      status: "draft",
      startAt: args.startAt,
      endAt: args.endAt,
      showResultsToVoters: false,
      submissionCount: 0,
      accessControl: {
        mode: "open",
        geoEnabled: false,
        timeWindowEnabled: false,
        onePerPhone: true,
        otpRequired: false,
        inviteOnly: false,
      },
    });
  },
});

export const updateVote = mutation({
  args: {
    voteId: v.id("votes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    showResultsToVoters: v.optional(v.boolean()),
    accessControl: v.optional(accessControlValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const vote = await ctx.db.get(args.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Not found or unauthorized");
    const { voteId, ...patch } = args;
    await ctx.db.patch(voteId, patch);
  },
});

export const publishVote = mutation({
  args: {
    voteId: v.id("votes"),
    showResultsToVoters: v.boolean(),
    accessControl: accessControlValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const vote = await ctx.db.get(args.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Not found or unauthorized");
    const slug = generateSlug(vote.title);
    await ctx.db.patch(args.voteId, {
      status: "active",
      slug,
      showResultsToVoters: args.showResultsToVoters,
      accessControl: args.accessControl,
    });
    return slug;
  },
});

export const closeVote = mutation({
  args: { voteId: v.id("votes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const vote = await ctx.db.get(args.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Not found or unauthorized");
    await ctx.db.patch(args.voteId, { status: "closed" });
  },
});

export const reopenVote = mutation({
  args: { voteId: v.id("votes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const vote = await ctx.db.get(args.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Not found or unauthorized");
    await ctx.db.patch(args.voteId, { status: "active" });
  },
});

export const deleteVote = mutation({
  args: { voteId: v.id("votes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const vote = await ctx.db.get(args.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Not found or unauthorized");
    await ctx.db.delete(args.voteId);
  },
});

export const getVoteBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getVotesByOrganiser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("votes")
      .withIndex("by_organiser", (q) =>
        q.eq("organiserId", identity.tokenIdentifier)
      )
      .order("desc")
      .take(200);
  },
});
