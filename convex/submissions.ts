import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { haversineMetres } from "./geoUtils";

export const submitBallot = mutation({
  args: {
    voteId: v.id("votes"),
    fingerprint: v.string(),
    ipAddress: v.string(),
    contact: v.optional(v.string()), // required when vote is invite-only
    voterLat: v.optional(v.number()),
    voterLng: v.optional(v.number()),
    choices: v.array(
      v.object({
        positionId: v.id("positions"),
        candidateIds: v.array(v.id("candidates")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db.get(args.voteId);
    if (!vote) throw new Error("Vote not found");
    if (vote.status !== "active") throw new ConvexError("This vote is no longer accepting ballots.");

    // Submissions paused due to a recent velocity spike
    const recentSpike = await ctx.db
      .query("flaggedActivity")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "velocity_spike"),
          q.gte(q.field("_creationTime"), Date.now() - 3_600_000)
        )
      )
      .first();
    if (recentSpike) {
      throw new ConvexError(
        "Submissions are temporarily paused due to unusual activity. Please try again later."
      );
    }

    // Server-side geo re-validation — never trust the client result
    if (vote.accessControl.geoEnabled) {
      if (args.voterLat == null || args.voterLng == null) {
        throw new ConvexError("Location required for this vote");
      }
      const geoConfig = await ctx.db
        .query("geoConfig")
        .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
        .unique();
      if (geoConfig) {
        const dist = haversineMetres(
          args.voterLat,
          args.voterLng,
          geoConfig.lat,
          geoConfig.lng
        );
        if (dist > geoConfig.radiusMetres) {
          throw new ConvexError("Outside geo-fence");
        }
      }
    }

    // Duplicate fingerprint check
    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_vote_and_fingerprint", (q) =>
        q.eq("voteId", args.voteId).eq("fingerprint", args.fingerprint)
      )
      .unique();
    if (existing) throw new ConvexError("Already voted");

    // Invite-only check — server re-validates regardless of client gate
    if (vote.accessControl.inviteOnly) {
      if (!args.contact) throw new Error("Contact required for this invite-only vote");
      const normalised = args.contact.trim().toLowerCase();
      const entry = await ctx.db
        .query("inviteList")
        .withIndex("by_vote_and_contact", (q) =>
          q.eq("voteId", args.voteId).eq("contact", normalised)
        )
        .unique();
      if (!entry) throw new ConvexError("You are not on the invite list for this vote");
    }

    const submissionId = await ctx.db.insert("submissions", {
      voteId: args.voteId,
      fingerprint: args.fingerprint,
      ipAddress: args.ipAddress,
      ...(args.contact
        ? { phoneHash: args.contact.trim().toLowerCase() }
        : {}),
    });

    for (const choice of args.choices) {
      await ctx.db.insert("submissionChoices", {
        submissionId,
        positionId: choice.positionId,
        choices: choice.candidateIds,
      });
    }

    await ctx.db.patch(args.voteId, {
      submissionCount: vote.submissionCount + 1,
    });

    // Background anti-abuse checks (non-blocking)
    await ctx.scheduler.runAfter(0, internal.antiAbuse.runVelocityCheck, {
      voteId: args.voteId,
      ipAddress: args.ipAddress,
    });

    return submissionId;
  },
});

export const getSubmissionCount = query({
  args: { voteId: v.id("votes") },
  handler: async (ctx, args) => {
    const vote = await ctx.db.get(args.voteId);
    return vote?.submissionCount ?? 0;
  },
});

export const getLiveResults = query({
  args: { voteId: v.id("votes") },
  handler: async (ctx, args) => {
    const positions = await ctx.db
      .query("positions")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .order("asc")
      .take(50);

    return await Promise.all(
      positions.map(async (position) => {
        const candidates = await ctx.db
          .query("candidates")
          .withIndex("by_position", (q) =>
            q.eq("positionId", position._id)
          )
          .take(100);

        const choices = await ctx.db
          .query("submissionChoices")
          .withIndex("by_position", (q) =>
            q.eq("positionId", position._id)
          )
          .take(10000);

        const tally: Record<string, number> = {};
        for (const c of candidates) tally[c._id] = 0;
        for (const choice of choices) {
          for (const candidateId of choice.choices) {
            tally[candidateId] = (tally[candidateId] ?? 0) + 1;
          }
        }

        return {
          position,
          candidates: candidates
            .map((c) => ({ ...c, votes: tally[c._id] ?? 0 }))
            .sort((a, b) => b.votes - a.votes),
        };
      })
    );
  },
});
