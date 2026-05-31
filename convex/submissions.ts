import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { haversineMetres } from "./geoUtils";

export const submitBallot = mutation({
  args: {
    voteId: v.id("votes"),
    fingerprint: v.string(),
    ipAddress: v.string(),
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
    if (vote.status !== "active") throw new Error("Vote is not active");

    // Server-side geo re-validation — never trust the client result
    if (vote.accessControl.geoEnabled) {
      if (args.voterLat == null || args.voterLng == null) {
        throw new Error("Location required for this vote");
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
          throw new Error("Outside geo-fence");
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
    if (existing) throw new Error("Already voted");

    const submissionId = await ctx.db.insert("submissions", {
      voteId: args.voteId,
      fingerprint: args.fingerprint,
      ipAddress: args.ipAddress,
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
