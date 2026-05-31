import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { haversineMetres } from "./geoUtils";

export const checkGeoAccess = query({
  args: {
    voteId: v.id("votes"),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const geoConfig = await ctx.db
      .query("geoConfig")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .unique();

    if (!geoConfig) return { allowed: true, distanceMetres: null, radiusMetres: null };

    const distanceMetres = haversineMetres(
      args.lat,
      args.lng,
      geoConfig.lat,
      geoConfig.lng
    );

    return {
      allowed: distanceMetres <= geoConfig.radiusMetres,
      distanceMetres: Math.round(distanceMetres),
      radiusMetres: geoConfig.radiusMetres,
      venueName: geoConfig.venueName ?? null,
    };
  },
});

export const saveGeoConfig = mutation({
  args: {
    voteId: v.id("votes"),
    lat: v.number(),
    lng: v.number(),
    radiusMetres: v.number(),
    venueName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const vote = await ctx.db.get(args.voteId);
    if (!vote || vote.organiserId !== identity.tokenIdentifier)
      throw new Error("Not found or unauthorized");

    const existing = await ctx.db
      .query("geoConfig")
      .withIndex("by_vote", (q) => q.eq("voteId", args.voteId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lat: args.lat,
        lng: args.lng,
        radiusMetres: args.radiusMetres,
        venueName: args.venueName,
      });
    } else {
      await ctx.db.insert("geoConfig", {
        voteId: args.voteId,
        lat: args.lat,
        lng: args.lng,
        radiusMetres: args.radiusMetres,
        venueName: args.venueName,
      });
    }
  },
});
