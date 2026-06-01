# Votely — Development Plan

## Milestone 1: Project Setup & Infrastructure
**Goal:** Establish the full-stack foundation before any feature work.

### Tasks
- [x] Initialise Next.js 16 (App Router) project with TypeScript
- [x] Install and configure Tailwind CSS + shadcn/ui (dark mode default, light mode toggle)
- [x] Initialise Convex project; wire `ConvexProviderWithClerk` in the app layout ⚠️ run `npx convex dev` to connect live backend
- [x] Install and configure Clerk (Google OAuth + email/password); wrap app with `ClerkProvider`
- [x] Set up environment variables: `.env.local.example` created with all keys documented
- [x] Define global layout: root layout with theme provider, `suppressHydrationWarning`, provider stack
- [x] Configure path aliases, linting (ESLint), and formatting (Prettier)

**Status:** ✅ Complete  
**Deliverable:** App boots, Clerk sign-in page is reachable, Convex dashboard is connected, dark mode works.

---

## Milestone 2: Convex Schema & Data Layer
**Goal:** Define the full database schema so all future features build on a stable contract.

### Tables
- [x] `votes` — id, organiserId, title, description, bannerUrl, slug, accessControl (JSON: geoEnabled, timeWindow, onePerPhone, otpRequired, inviteOnly), status (draft/active/closed), startAt, endAt, showResultsToVoters, submissionCount, createdAt
- [x] `positions` — id, voteId, title, votingType (single/multiple/ranked), maxSelections (multiple only), order
- [x] `candidates` — id, positionId, name, photoUrl, bio, order
- [x] `geoConfig` — id, voteId, lat, lng, radiusMetres, venueName
- [x] `submissions` — id, voteId, fingerprint, phoneHash, ipAddress (one record per voter per vote)
- [x] `submissionChoices` — id, submissionId, positionId, choices (array of candidateIds; rank = index for ranked type)
- [x] `flaggedActivity` — id, voteId, type, ipAddress, count, windowSeconds
- [x] `inviteList` — id, voteId, contact (phone or email)
- [x] `presence` — id, voteId, sessionId, lastSeenAt (for active voter count on dashboard)

### Convex Functions (stubs)
- [x] Mutations: `createVote`, `updateVote`, `publishVote`, `closeVote`, `reopenVote`, `deleteVote`, `addPosition`, `updatePosition`, `deletePosition`, `addCandidate`, `updateCandidate`, `deleteCandidate`, `submitBallot`, `saveGeoConfig`, `upsertPresence`
- [x] Queries: `getVoteBySlug`, `getVotesByOrganiser`, `getPositionsWithCandidates`, `getLiveResults`, `getSubmissionCount`, `checkGeoAccess`, `getActiveCount`
- [ ] `runVelocityCheck` — deferred to M8 (Anti-Abuse)

**Status:** ✅ Complete  
**Deliverable:** Schema deployed to Convex; all core functions implemented and TypeScript-clean.

---

## Milestone 3: Organiser Authentication & Shell
**Goal:** Organisers can sign up, log in, and reach a protected dashboard shell.

### Tasks
- [x] Sign-up / sign-in pages via Clerk (Google + email/password)
- [x] Protected route middleware (`proxy.ts`) — redirects unauthenticated users to `/sign-in`
- [x] Organiser dashboard shell at `/dashboard` — sidebar (desktop) + top bar (mobile), My Votes + Create Vote nav
- [x] User identity derived from Clerk `tokenIdentifier` in every Convex mutation — no explicit sync table needed
- [x] Sign-out via Clerk `UserButton` in sidebar

**Status:** ✅ Complete  
**Deliverable:** Organiser can register, log in, see an empty dashboard, and log out.

---

## Milestone 4: Vote Creation — Multi-Step Form
**Goal:** Organiser can create and publish a fully configured vote.

### Step 1 — Basic Info
- [x] Title (required), description (optional), banner image upload (optional, stored in Convex file storage), start datetime, end datetime

### Step 2 — Positions & Candidates
- [x] Organiser adds one or more **positions** (e.g. "Best Dressed Male", "Best Dressed Female")
- [x] Each position has: title (required), voting type (Single / Multiple / Ranked), max selections if Multiple
- [x] Within each position: add/remove candidates — name (required), photo (optional), bio (optional)
- [x] Drag-to-reorder candidates within a position; drag-to-reorder positions
- [x] Enforce minimum 2 candidates per position before allowing progress
- [x] Minimum 1 position required to publish
- [x] Voting type is set **per position** (not globally) — one position can be Single Choice, another Ranked Choice

### Step 3 — Access Control
- [x] Toggle: Open vs. Restricted
- [x] Restricted sub-options (each independently togglable): Geo-fencing, Time window, One vote per phone (default on), OTP verification, Invite-only
- [x] Geo-fencing placeholder shown (Mapbox integration is M5)

### Step 4 — Publish
- [x] Summary review screen
- [x] "Show live results to voters after submission" toggle (saved as `showResultsToVoters`)
- [x] Publish button → sets status to `active`, generates unique readable slug (collision-safe), saves to Convex
- [x] Save as Draft at any step

**Status:** ✅ Complete  
**Deliverable:** Organiser can create, configure, and publish a vote end-to-end.

---

## Milestone 5: Mapbox Integration (Geo-Fencing Setup)
**Goal:** Organisers can set a precise venue location through three input methods.

### Tasks
- [x] Embed Mapbox GL JS map in the access-control step
- [x] Venue search via Mapbox Geocoding API — autocomplete address/name input
- [x] Manual pin — click on map to drop pin, coordinates saved
- [x] "Use my location" — browser Geolocation API pre-fills coordinates and centres map
- [x] Radius circle visualised on the map as organiser adjusts the slider
- [x] Coordinates and radius saved to `geoConfig` table on publish

**Status:** ✅ Complete  
**Deliverable:** Organiser can set a venue via any of three methods with a visible radius ring on the map.

---

## Milestone 6: Public Voter Flow
**Goal:** Voters can open a vote link and cast a ballot with no account required.

### Tasks
- [x] Public route `/vote/[slug]` — no auth required
- [x] Fetch vote config (all positions + candidates) by slug; show 404 for unknown or deleted votes
- [x] Ballot is rendered as a **multi-section page** — one section per position, in order
- [x] Ballot rendering adapts per position's voting type:
  - Single Choice — radio cards
  - Multiple Choice — checkbox cards with live "X of N selected" counter
  - Ranked Choice — drag-and-drop numbered ordering
- [x] Voter must complete **all positions** before the submit button activates
- [x] Position progress indicator shown (e.g. "2 of 4 positions completed")
- [x] Candidate cards: photo, name, bio
- [x] Confirmation step summarising all choices across all positions before final submission
- [x] Success screen: confirmation message + optional live results preview per position (if organiser enables it)
- [x] Vote-closed / not-yet-started guard screens with clear copy

**Status:** ✅ Complete  
**Deliverable:** Voter can open a link, choose candidates, confirm, and submit a ballot.

---

## Milestone 7: Geo-Restriction Enforcement
**Goal:** Server-side geo-check gates access to geo-restricted ballots before the ballot loads.

### Tasks
- [x] Client: request browser location permission when vote has geo-fencing enabled
- [x] Client sends coordinates to Convex query `checkGeoAccess`
- [x] Server-side Haversine distance calculation against stored `geoConfig`
- [x] Four voter-facing outcomes rendered:
  - Inside radius → ballot loads
  - Outside radius → "You must be at the event venue to vote."
  - Permission denied → "Location access is required for this vote. Please allow it in your browser settings."
  - Location unavailable → "We couldn't verify your location. Contact the organiser."
- [x] Geo-check result is not trusted from the client — server always re-validates on submission

**Status:** ✅ Complete  
**Deliverable:** Voters outside the radius are blocked; voters inside proceed to the ballot.

---

## Milestone 8: Anti-Abuse & Deduplication
**Goal:** Enforce one-vote-per-device and detect suspicious activity server-side.

### Tasks
- [x] Device fingerprinting on the client (FingerprintJS or equivalent) — hash sent with submission
- [x] Server-side duplicate check on `(voteId, fingerprint)` before recording a submission
- [x] Invite-only check: submitted phone/email must appear in `inviteList` for the vote
- [x] IP address logged on every submission
- [x] Flag logic: same IP submits > 5 votes on one vote → write to `flaggedActivity`
- [x] Velocity detection: > 100 submissions in 60 s → pause submissions + send organiser alert email via Resend
- [x] Fingerprinting limitation documented in voter-facing UI (tooltip or help text)

**Status:** ✅ Complete  
**Deliverable:** Duplicate submissions are rejected; velocity spikes trigger alerts; flagged activity is logged.

---

## Milestone 9: Real-Time Results & Dashboard
**Goal:** Organisers see live vote counts, leaderboard, and activity; results update without refresh.

### Tasks
- [x] Convex real-time query `getLiveResults` subscribed to on the dashboard — returns results **per position**
- [x] Per-vote detail view:
  - Position tabs or accordion — organiser switches between "Best Dressed Male", "Best Dressed Female", etc.
  - Per position: live vote count per candidate (bar or number), live leaderboard
  - Total submissions counter (a submission covers all positions)
  - Votes-over-time sparkline chart (overall submissions over time)
  - Flagged activity log table
  - Active voter count (voters currently on the ballot page — tracked via Convex presence)
- [x] Dashboard overview: votes grouped by Draft / Active / Closed; each row shows title, status badge, vote count, quick actions
- [x] Quick actions: close early, reopen, copy link, download QR code (PNG), delete (with confirmation modal)
- [x] Optional voter-facing live results on the success screen (toggled per vote in settings)

**Status:** ✅ Complete  
**Deliverable:** Dashboard updates live; organiser can manage votes and monitor results in real time.

---

## Milestone 10: QR Code & Sharing
**Goal:** Every published vote has a shareable URL and a downloadable QR code.

> Note: slug generation happens at publish time (M4 Step 5). This milestone covers the sharing UI built on top of that slug.

### Tasks
- [x] Public URL: `/vote/[slug]`
- [x] QR code generated client-side using `qrcode` library, exported as PNG
- [x] QR code sized for projection/print (min 512×512 px with quiet zone)
- [x] One-tap copy for share link
- [ ] WhatsApp-ready message template: "Vote title + link" — copy with one tap
- [x] Download QR code button in dashboard quick actions

### Beyond plan (also shipped in M10)
- [x] `/present/[voteId]` fullscreen projection page — giant QR + live ballot count + vote URL; toggles to live results bar chart (Space bar or button); auth-guarded
- [x] "Present" button on vote detail page
- [x] Auto-close on endAt — Convex scheduler fires `autoClose` mutation at configured end time; reschedules if endAt is edited on an active vote
- [x] Fix: `ConvexError` used for all user-facing mutation errors so messages reach the client
- [x] Fix: `checkHasVoted` query + fingerprint-gated render — voters who already voted never see candidates again
- [x] Fix: "Continue setup" on draft votes now opens the edit drawer

**Status:** ✅ Complete (WhatsApp template deferred)  
**Deliverable:** Organiser can share a link or QR code immediately after publishing.

---

## Milestone 11: Polish, Accessibility & Mobile QA
**Goal:** Every screen meets the mobile-first, under-15-second voting flow bar and is accessible.

### Tasks
- [x] Audit all tap targets — minimum 44×44 px (voter nav buttons h-12/48px, candidate cards min 64px tall, CTA buttons h-12)
- [ ] Voter flow end-to-end on iOS Safari and Android Chrome
- [x] Dark/light mode consistency — app is intentionally light-mode only; consistent across all pages
- [x] Loading states and skeleton screens for async data (dashboard skeleton, Loader2 spinners on vote detail, ballot, present page)
- [ ] Error boundaries with user-friendly fallback UI
- [x] Empty states on dashboard (no votes yet → EmptyState; draft vote detail → "Not published yet" placeholder)
- [x] Voter-facing copy review — plain language throughout; error screens written as plain sentences not status codes
- [x] Responsiveness check: dashboard uses responsive grid (sm:grid-cols-2 lg:grid-cols-3); voter flow centred max-w-lg, mobile-first
- [ ] Accessibility: keyboard navigation, ARIA labels, colour-contrast pass (ARIA labels exist on some voter controls; full audit not done)

**Deliverable:** Full voter flow completes in under 15 seconds on a mid-range phone; no broken states.

---

## Milestone 12: Testing & Launch Readiness
**Goal:** Core flows are verified; app is ready for real events.

### Tasks
- [ ] Unit tests for Convex functions: geo-check, deduplication, velocity detection
- [ ] Integration test: full vote creation → publish → vote submission → result update
- [ ] Manual QA: each voting type (single, multiple, ranked) with geo-restriction enabled and disabled
- [x] Resend velocity-alert email implemented in `antiAbuse.ts` (fires on velocity spike > 100 submissions/60s)
- [ ] Verify Resend emails end-to-end: confirm delivery and OTP flow
- [ ] Load test: simulate 100 concurrent submissions on a single vote
- [ ] Security review: ensure geo-check and dedup are server-side only; no sensitive data exposed to client
- [ ] Set up production environment variables in Vercel
- [ ] Deploy to production on Vercel; smoke test all critical paths

**Deliverable:** App is live, stable, and safe for public events.
