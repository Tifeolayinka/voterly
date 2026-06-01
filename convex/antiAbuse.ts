import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";

export const countSubmissionsByIp = internalQuery({
  args: { voteId: v.id("votes"), ipAddress: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("submissions")
      .withIndex("by_vote_and_ip", (q) =>
        q.eq("voteId", args.voteId).eq("ipAddress", args.ipAddress)
      )
      .collect();
    return rows.length;
  },
});

export const countRecentSubmissions = internalQuery({
  args: { voteId: v.id("votes"), windowSeconds: v.number() },
  handler: async (ctx, args) => {
    const since = Date.now() - args.windowSeconds * 1000;
    const rows = await ctx.db
      .query("submissions")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .filter((q) => q.gte(q.field("_creationTime"), since))
      .collect();
    return rows.length;
  },
});

export const getOrganiserEmail = internalQuery({
  args: { voteId: v.id("votes") },
  handler: async (ctx, args) => {
    const vote = await ctx.db.get(args.voteId);
    return vote?.organiserEmail ?? null;
  },
});

export const flagActivity = internalMutation({
  args: {
    voteId: v.id("votes"),
    type: v.union(v.literal("ip_threshold"), v.literal("velocity_spike")),
    ipAddress: v.optional(v.string()),
    count: v.optional(v.number()),
    windowSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // De-duplicate: skip if same flag type was already written in the last hour
    const existing = await ctx.db
      .query("flaggedActivity")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), args.type),
          q.gte(q.field("_creationTime"), Date.now() - 3_600_000)
        )
      )
      .first();
    if (!existing) {
      await ctx.db.insert("flaggedActivity", {
        voteId: args.voteId,
        type: args.type,
        ipAddress: args.ipAddress,
        count: args.count,
        windowSeconds: args.windowSeconds,
      });
    }
  },
});

export const runVelocityCheck = internalAction({
  args: { voteId: v.id("votes"), ipAddress: v.string() },
  handler: async (ctx, args) => {
    // IP threshold: same IP submits > 5 times on this vote
    if (args.ipAddress !== "unknown") {
      const ipCount = await ctx.runQuery(
        internal.antiAbuse.countSubmissionsByIp,
        { voteId: args.voteId, ipAddress: args.ipAddress }
      );
      if (ipCount > 5) {
        await ctx.runMutation(internal.antiAbuse.flagActivity, {
          voteId: args.voteId,
          type: "ip_threshold",
          ipAddress: args.ipAddress,
          count: ipCount,
        });
      }
    }

    // Velocity spike: > 100 submissions in the last 60 s
    const recentCount = await ctx.runQuery(
      internal.antiAbuse.countRecentSubmissions,
      { voteId: args.voteId, windowSeconds: 60 }
    );
    if (recentCount > 100) {
      await ctx.runMutation(internal.antiAbuse.flagActivity, {
        voteId: args.voteId,
        type: "velocity_spike",
        count: recentCount,
        windowSeconds: 60,
      });

      const organiserEmail = await ctx.runQuery(
        internal.antiAbuse.getOrganiserEmail,
        { voteId: args.voteId }
      );
      if (organiserEmail) {
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Votely Alerts <alerts@votely.app>",
              to: organiserEmail,
              subject: "⚠️ Unusual voting activity detected",
              html: `<p>Hi,</p><p>We detected <strong>${recentCount} submissions in 60 seconds</strong> on your vote. Submissions have been temporarily paused. Please review your vote in the Votely dashboard.</p><p>— The Votely Team</p>`,
            }),
          });
        }
      }
    }
  },
});
