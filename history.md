# Votely — Build History

## Milestone 1: Project Setup & Infrastructure
**Date:** 2026-05-30  
**Status:** ✅ Complete (Convex backend connection requires one manual step — see note)

### What was done
- Next.js 16 (App Router) + TypeScript — already scaffolded via Create Next App
- Tailwind CSS v4 — already installed; shadcn/ui initialised (`npx shadcn@latest init -d`)
  - Dark/light CSS tokens set up via oklch variables in `globals.css`
  - `next-themes` installed; `ThemeProvider` wired with `defaultTheme="dark"`
- Clerk installed (`@clerk/nextjs`); `ClerkProvider` added to root layout
- Convex installed (`convex`); `ConvexProviderWithClerk` wired in `components/providers.tsx`
- `convex/auth.config.ts` created pointing to `CLERK_JWT_ISSUER_DOMAIN` env var
- Root layout updated: metadata → "Votely", `suppressHydrationWarning`, provider stack
- `proxy.ts` created (Next.js 16 auth guard, replaces `middleware.ts`); protects `/dashboard/**`
- `.env.local.example` created with all required keys documented
- `.prettierrc` added; `npm run format` script added to `package.json`
- Project renamed from `my-app` → `votely` in `package.json`
- TypeScript check passes with zero errors

### ⚠️ Manual step required before Milestone 2
Convex backend not yet connected to a live project. Run:
```bash
npx convex dev
```
Log in, create a new project, and copy the generated `NEXT_PUBLIC_CONVEX_URL` into `.env.local`.
Also set `CLERK_JWT_ISSUER_DOMAIN` to your Clerk instance URL (found in Clerk Dashboard → API Keys).

---

## Milestone 3: Organiser Authentication & Shell
**Date:** 2026-05-30  
**Status:** ✅ Complete

### Files created
| File | Contents |
|---|---|
| `app/(auth)/layout.tsx` | Centred layout for auth pages |
| `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Clerk `<SignIn />` component |
| `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Clerk `<SignUp />` component |
| `components/dashboard/sidebar.tsx` | `DashboardSidebar` (desktop) + `MobileTopBar` (mobile) with active link state |
| `app/(dashboard)/layout.tsx` | Dashboard shell — sidebar + mobile top bar |
| `app/(dashboard)/dashboard/page.tsx` | Vote list grouped by Draft / Active / Closed; empty state; skeleton loading |
| `app/page.tsx` | Landing page replacing Next.js default |

### Key decisions
- No `users` table — Clerk `tokenIdentifier` is the stable identity used directly in Convex
- `UserButton` no longer accepts `afterSignOutUrl` in Clerk v7+ — prop removed
- shadcn v4 Button uses `@base-ui/react` with `render` prop instead of Radix `asChild`
- Dashboard page uses `useQuery(api.votes.getVotesByOrganiser)` — shows skeleton while Convex loads, empty state when no votes exist

---

## Milestone 5: Mapbox Integration (Geo-Fencing Setup)
**Date:** 2026-05-30  
**Status:** ✅ Complete

### Files created / modified
| File | Contents |
|---|---|
| `components/geo/geo-fencing-card.tsx` | Full Mapbox GL JS map — venue search, click-to-pin, drag marker, Use My Location, radius circle, GPS drift note |
| `components/vote-form/step3-access.tsx` | Added `geoConfig`/`onGeoConfigChange` props; dynamically imports `GeoFencingCard` with `ssr: false` |
| `components/vote-form/step4-publish.tsx` | Added `geoConfig` prop; calls `saveGeoConfig` mutation after `publishVote` when geo enabled |
| `app/(dashboard)/dashboard/create/page.tsx` | Added `geoConfig` state, wired into step 3 and step 4 |

### Key decisions
- `mapbox-gl@3.24.0` installed directly (no `react-map-gl` wrapper needed for the imperative API pattern)
- `GeoFencingCard` is dynamically imported with `ssr: false` to keep mapbox-gl out of the server bundle; loading skeleton shown while it loads
- Map click handler and drag-end handler use stable `onChangeRef` / `radiusRef` refs to avoid stale closure issues in the imperative Mapbox event listeners
- `mapboxgl.accessToken` set globally; `NEXT_PUBLIC_MAPBOX_TOKEN` env var documents in `.env.local.example`
- `GeoConfig` type defined in `geo-fencing-card.tsx`, re-exported from `step3-access.tsx` for downstream consumers
- `saveGeoConfig` uses upsert logic already in `convex/geo.ts` — no schema changes needed
- Radius options: 100m / 150m / 250m preset buttons + Custom (50–5000m) number input
- If geo is enabled at publish but no venue is set, step 4 shows an amber warning (geo check still passes everyone through until a venue is stored, matching `checkGeoAccess` behaviour when `geoConfig` row is absent)

---

## Milestone 4: Vote Creation — Multi-Step Form
**Date:** 2026-05-30  
**Status:** ✅ Complete

### Files created
| File | Contents |
|---|---|
| `app/(dashboard)/dashboard/create/page.tsx` | Orchestrator — step state, voteId, accessControl, showResultsToVoters |
| `components/vote-form/step-indicator.tsx` | 4-step progress indicator with check marks for completed steps |
| `components/vote-form/step1-basic-info.tsx` | Title, description, banner upload (Convex storage), start/end datetime |
| `components/vote-form/step2-positions.tsx` | Positions + candidates editor with @dnd-kit drag-to-reorder |
| `components/vote-form/step3-access.tsx` | Open vs Restricted toggle; geo/time/phone/OTP/invite sub-options |
| `components/vote-form/step4-publish.tsx` | Summary review, showResultsToVoters toggle, Publish + success screen |
| `convex/files.ts` | `generateUploadUrl` mutation, `getFileUrl` query for Convex file storage |
| `components/ui/input.tsx` | Styled input component |
| `components/ui/textarea.tsx` | Styled textarea component |
| `components/ui/label.tsx` | Styled label component |
| `components/ui/switch.tsx` | Toggle switch (accessible button-based) |

### Key decisions
- `createVote` called on step 1 "Continue" → `voteId` held in parent page state; `updateVote` used when going back and re-submitting step 1
- Positions and candidates are written to Convex in real-time in step 2; no "save" button needed per item
- `getPositionsWithCandidates` now sorts by `order` field in JS after `.take()` (avoids schema migration; perf acceptable at this scale)
- Banner and candidate photo uploads: `generateUploadUrl` → POST file → store `storageId` as `bannerUrl`/`photoUrl`; URL resolution deferred to M9 display milestone
- Drag-to-reorder uses `@dnd-kit/core` + `@dnd-kit/sortable` (v6.3.1, React 19 compatible)
- Geo-fencing toggle saved but venue config deferred to M5 (Mapbox)
- `publishVote` returns the slug → shown on success screen with copy-link button

---

## Milestone 2: Convex Schema & Data Layer
**Date:** 2026-05-30  
**Status:** ✅ Complete (schema needs `npx convex dev` to deploy to live backend)

### Files created
| File | Contents |
|---|---|
| `convex/schema.ts` | Full schema — 9 tables with all indexes |
| `convex/votes.ts` | `createVote`, `updateVote`, `publishVote`, `closeVote`, `reopenVote`, `deleteVote`, `getVoteBySlug`, `getVotesByOrganiser` |
| `convex/positions.ts` | `addPosition`, `updatePosition`, `deletePosition`, `getPositionsWithCandidates` |
| `convex/candidates.ts` | `addCandidate`, `updateCandidate`, `deleteCandidate` |
| `convex/submissions.ts` | `submitBallot`, `getSubmissionCount`, `getLiveResults` |
| `convex/geo.ts` | `checkGeoAccess` (Haversine query), `saveGeoConfig` |
| `convex/presence.ts` | `upsertPresence`, `getActiveCount` |

### Key design decisions
- `submissionCount` denormalised on `votes` table — avoids full table scan for counts (per Convex guidelines)
- `choices` array in `submissionChoices` doubles as rank order for ranked voting (rank = index position)
- All mutations derive identity from `ctx.auth.getUserIdentity()` — never trust client-supplied user IDs
- `getLiveResults` returns candidates sorted by votes descending, scoped per position
- `runVelocityCheck` deferred to M8 where IP flagging and Resend email logic lives

---
