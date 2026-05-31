import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  votes: defineTable({
    organiserId: v.string(), // Clerk tokenIdentifier
    title: v.string(),
    description: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    slug: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("closed")
    ),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    showResultsToVoters: v.boolean(),
    submissionCount: v.number(),
    accessControl: v.object({
      mode: v.union(v.literal("open"), v.literal("restricted")),
      geoEnabled: v.boolean(),
      timeWindowEnabled: v.boolean(),
      onePerPhone: v.boolean(),
      otpRequired: v.boolean(),
      inviteOnly: v.boolean(),
    }),
  })
    .index("by_organiser", ["organiserId"])
    .index("by_slug", ["slug"])
    .index("by_organiser_and_status", ["organiserId", "status"]),

  positions: defineTable({
    voteId: v.id("votes"),
    title: v.string(),
    votingType: v.union(
      v.literal("single"),
      v.literal("multiple"),
      v.literal("ranked")
    ),
    maxSelections: v.optional(v.number()),
    order: v.number(),
  }).index("by_vote", ["voteId"]),

  candidates: defineTable({
    positionId: v.id("positions"),
    name: v.string(),
    photoUrl: v.optional(v.string()),
    photoUrls: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    order: v.number(),
  }).index("by_position", ["positionId"]),

  geoConfig: defineTable({
    voteId: v.id("votes"),
    lat: v.number(),
    lng: v.number(),
    radiusMetres: v.number(),
    venueName: v.optional(v.string()),
  }).index("by_vote", ["voteId"]),

  submissions: defineTable({
    voteId: v.id("votes"),
    fingerprint: v.string(),
    phoneHash: v.optional(v.string()),
    ipAddress: v.string(),
  })
    .index("by_vote", ["voteId"])
    .index("by_vote_and_fingerprint", ["voteId", "fingerprint"]),

  submissionChoices: defineTable({
    submissionId: v.id("submissions"),
    positionId: v.id("positions"),
    choices: v.array(v.id("candidates")), // ordered array; rank = index for ranked type
  })
    .index("by_submission", ["submissionId"])
    .index("by_position", ["positionId"]),

  flaggedActivity: defineTable({
    voteId: v.id("votes"),
    type: v.union(v.literal("ip_threshold"), v.literal("velocity_spike")),
    ipAddress: v.optional(v.string()),
    count: v.optional(v.number()),
    windowSeconds: v.optional(v.number()),
  }).index("by_vote", ["voteId"]),

  inviteList: defineTable({
    voteId: v.id("votes"),
    contact: v.string(), // phone number or email
  })
    .index("by_vote", ["voteId"])
    .index("by_vote_and_contact", ["voteId", "contact"]),

  presence: defineTable({
    voteId: v.id("votes"),
    sessionId: v.string(),
    lastSeenAt: v.number(),
  })
    .index("by_vote", ["voteId"])
    .index("by_vote_and_session", ["voteId", "sessionId"]),
});
