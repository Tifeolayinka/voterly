import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// ── Photo helpers ─────────────────────────────────────────────────────────────

function u(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=480&h=480&fit=crop&crop=face&auto=format&q=80`;
}

// ── Candidate data per position ───────────────────────────────────────────────

const SEED_POSITIONS = [
  {
    title: "Best Dressed Male",
    candidates: [
      {
        name: "Chukwuemeka Okafor",
        bio: "Royal agbada in hand-woven Aso-oke with gold-threaded embroidery and matching fìlà",
        photoUrl: u("1506794778202-cad84cf45f1d"),
      },
      {
        name: "Kwame Asante",
        bio: "Full kente cloth senator suit with hand-stitched gold accents and leather sandals",
        photoUrl: u("1507003211169-0a1dd7228f2d"),
      },
      {
        name: "Babatunde Adeyemi",
        bio: "Richly embroidered deep blue kaftan with matching sokoto trousers and cap",
        photoUrl: u("1543373014-cfe4f4bc1c4f"),
      },
      {
        name: "Seun Afolabi",
        bio: "Champagne damask agbada with intricate hand-stitched cuffs and collar",
        photoUrl: u("1504257432389-52343af06ae3"),
      },
    ],
  },
  {
    title: "Best Dressed Female",
    candidates: [
      {
        name: "Adaeze Okonkwo",
        bio: "Isiagu wrapper set adorned with coral bead necklace, gold gele and ipele",
        photoUrl: u("1531123414-2f86aed36a2b"),
      },
      {
        name: "Yetunde Lawal",
        bio: "Three-piece aso-oke — buba, iro and ipele — with sculptural towering gele",
        photoUrl: u("1573496359142-b8d87ea9ecc4"),
      },
      {
        name: "Fatima Al-Hassan",
        bio: "Grand boubou in royal indigo with gold-thread embroidery and matching headwrap",
        photoUrl: u("1523824921871-d6f1a15151f1"),
      },
      {
        name: "Abena Sarpong",
        bio: "Handwoven kente cloth gown with bold geometric patterns and matching headband",
        photoUrl: u("1487897421600-2b2023e71ef7"),
      },
    ],
  },
  {
    title: "Best Dressed Child — Male",
    candidates: [
      {
        name: "Timi Adewale",
        bio: "Mini agbada set in royal blue Aso-oke with matching fìlà and beaded sandals",
        photoUrl: u("1558618666-fcd25c85cd64"),
      },
      {
        name: "Emeka Nwosu",
        bio: "Traditional isiagu shirt and ankle trousers with a tiny coral necklace",
        photoUrl: u("1519340241574-2cec6aef0c01"),
      },
      {
        name: "Kwesi Boateng",
        bio: "Kente-print shorts set with matching bow tie and leather sandals",
        photoUrl: u("1580466947098-b84d9d2f6a86"),
      },
    ],
  },
  {
    title: "Best Dressed Child — Female",
    candidates: [
      {
        name: "Chisom Obi",
        bio: "Petite aso-oke wrapper and blouse with a delicate little gele and coral bracelet",
        photoUrl: u("1491349174775-aaaefdd1e47f"),
      },
      {
        name: "Amara Diallo",
        bio: "Ankara print dress with matching headband, pearl beads and white sandals",
        photoUrl: u("1522337360788-8b13dee7a37e"),
      },
      {
        name: "Sade Adeyinka",
        bio: "Tie-and-dye boubou with gold thread appliqué and beaded hair accessories",
        photoUrl: u("1567532939604-b6b5b0db2604"),
      },
    ],
  },
  {
    title: "Best Dressed Youth",
    candidates: [
      {
        name: "Tobi Fashola",
        bio: "Modern fusion agbada — traditional Aso-oke silhouette with a contemporary cut",
        photoUrl: u("1570158268183-d296b2892211"),
      },
      {
        name: "Amara Mensah",
        bio: "Bold kente-inspired co-ord set with statement gold earrings and block heels",
        photoUrl: u("1529626455594-4ff0802cfb7e"),
      },
      {
        name: "Kemi Adeleke",
        bio: "Ankara jumpsuit with hand-dyed accessories and matching gele twist",
        photoUrl: u("1488426862026-3ee34a7d66df"),
      },
      {
        name: "Jide Afolabi",
        bio: "Embroidered dashiki shirt with matching straight-cut trousers and open-toe sandals",
        photoUrl: u("1546961342-ea5f62d4d276"),
      },
    ],
  },
  {
    title: "Best Dressed Adult",
    candidates: [
      {
        name: "Deji Olamide",
        bio: "Three-piece senator suit in champagne Aso-oke with a hand-folded pocket square",
        photoUrl: u("1545167622-3a6ac756afa4"),
      },
      {
        name: "Bunmi Adeyemi",
        bio: "Silk damask wrapper set with a sculptural fan-pleated gele in matching tones",
        photoUrl: u("1573496359142-b8d87ea9ecc4"),
      },
      {
        name: "Funmilayo Ransome",
        bio: "Ivory lace blouse and iro with hand-embroidered buba in rose gold and cream",
        photoUrl: u("1531123414-2f86aed36a2b"),
      },
      {
        name: "Wale Okonkwo",
        bio: "Custom-tailored deep burgundy agbada with cream embroidery at collar and hem",
        photoUrl: u("1507003211169-0a1dd7228f2d"),
      },
    ],
  },
  {
    title: "Overall Best Dressed",
    candidates: [
      {
        name: "Chukwuemeka Okafor",
        bio: "Best Dressed Male nominee — Royal gold Aso-oke agbada",
        photoUrl: u("1506794778202-cad84cf45f1d"),
      },
      {
        name: "Adaeze Okonkwo",
        bio: "Best Dressed Female nominee — Isiagu & coral gele",
        photoUrl: u("1531123414-2f86aed36a2b"),
      },
      {
        name: "Yetunde Lawal",
        bio: "Best Dressed Female nominee — Sculptural three-piece aso-oke",
        photoUrl: u("1573496359142-b8d87ea9ecc4"),
      },
      {
        name: "Tobi Fashola",
        bio: "Best Dressed Youth nominee — Contemporary agbada fusion",
        photoUrl: u("1570158268183-d296b2892211"),
      },
      {
        name: "Bunmi Adeyemi",
        bio: "Best Dressed Adult nominee — Silk damask & sculptural gele",
        photoUrl: u("1523824921871-d6f1a15151f1"),
      },
    ],
  },
];

// ── Seed mutation ─────────────────────────────────────────────────────────────

// Helper: call this while logged in to get your tokenIdentifier for the seed override.
export const whoAmI = internalMutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity
      ? { tokenIdentifier: identity.tokenIdentifier, email: identity.email }
      : null;
  },
});

export const seedCulturalSunday = internalMutation({
  args: {
    organiserEmail: v.string(),
    // Pass this directly if no existing votes exist yet.
    // Get it by running: npx convex run seed:whoAmI  (while logged in)
    organiserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let organiserId = args.organiserId;

    if (!organiserId) {
      // Resolve the Clerk tokenIdentifier from any existing vote by this user.
      // .take() + JS filter used intentionally — one-time seed, no index on email.
      const allVotes = await ctx.db.query("votes").take(500);
      const match = allVotes.find((v) => v.organiserEmail === args.organiserEmail);

      if (!match) {
        throw new Error(
          `No existing vote found for "${args.organiserEmail}" and no organiserId provided.\n` +
            "Option A — create any draft vote in the Votely dashboard first, then re-run.\n" +
            "Option B — pass your tokenIdentifier directly: add \"organiserId\": \"<token>\" to the args."
        );
      }
      organiserId = match.organiserId;
    }
    const slug =
      "cultural-sunday-2026-" + Math.random().toString(36).slice(2, 7);

    // July 20 2026, 23:59 UTC
    const endAt = new Date("2026-07-20T23:59:00Z").getTime();

    const voteId = await ctx.db.insert("votes", {
      organiserId,
      organiserEmail: args.organiserEmail,
      title: "Cultural Sunday 2026 — Best Dressed",
      description:
        "Celebrating African heritage and culture at our annual Cultural Sunday. " +
        "Vote for the best dressed across all age groups and categories.",
      slug,
      status: "active",
      endAt,
      showResultsToVoters: true,
      submissionCount: 0,
      accessControl: {
        mode: "open",
        geoEnabled: false,
        timeWindowEnabled: false,
        onePerPhone: false,
        otpRequired: false,
        inviteOnly: false,
      },
    });

    for (let p = 0; p < SEED_POSITIONS.length; p++) {
      const pos = SEED_POSITIONS[p];
      const positionId = await ctx.db.insert("positions", {
        voteId,
        title: pos.title,
        votingType: "single",
        order: p,
      });
      for (let c = 0; c < pos.candidates.length; c++) {
        const cand = pos.candidates[c];
        await ctx.db.insert("candidates", {
          positionId,
          name: cand.name,
          bio: cand.bio,
          photoUrl: cand.photoUrl,
          order: c,
        });
      }
    }

    return {
      voteId,
      slug,
      positions: SEED_POSITIONS.length,
      totalCandidates: SEED_POSITIONS.reduce(
        (sum, p) => sum + p.candidates.length,
        0
      ),
    };
  },
});
