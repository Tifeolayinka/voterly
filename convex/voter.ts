import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Returns ballot data with all photo storage IDs resolved to serving URLs.
// Used exclusively by the public voter flow — the organiser form uses
// getPositionsWithCandidates from positions.ts (raw storage IDs).
export const getVoteBallot = query({
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
          .withIndex("by_position", (q) => q.eq("positionId", position._id))
          .take(100);
        const sortedCandidates = [...candidates].sort((a, b) => a.order - b.order);

        const resolvedCandidates = await Promise.all(
          sortedCandidates.map(async (c) => {
            // Collect all storage IDs (primary + extras), deduplicated
            const storageIds = [
              ...(c.photoUrl ? [c.photoUrl] : []),
              ...(c.photoUrls ?? []),
            ].filter((id, i, arr) => arr.indexOf(id) === i);

            const photoUrls = (
              await Promise.all(
                storageIds.map((id) => ctx.storage.getUrl(id as Id<"_storage">))
              )
            ).filter((url): url is string => url !== null);

            return {
              _id: c._id,
              positionId: c.positionId,
              name: c.name,
              bio: c.bio,
              order: c.order,
              photoUrls,
            };
          })
        );

        return {
          _id: position._id,
          voteId: position.voteId,
          title: position.title,
          votingType: position.votingType,
          maxSelections: position.maxSelections,
          order: position.order,
          candidates: resolvedCandidates,
        };
      })
    );
  },
});
