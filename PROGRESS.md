# Votely — Build Progress

## ✅ Done

### Foundation
- [x] Next.js 16 + Convex + Clerk auth scaffolding
- [x] Sign-in / sign-up pages (Clerk)
- [x] Convex schema — votes, positions, candidates, submissions, submissionChoices, geoConfig, inviteList, flaggedActivity, presence
- [x] Root layout with ClerkProvider + ConvexProviderWithClerk

### Design system
- [x] PRODUCT.md — personas, purpose, brand personality, design principles
- [x] DESIGN.md — full design system spec (Village Square palette, Inter typography, elevation, components)
- [x] Light-mode rebuild — Assembly Blue palette, Inter font, Chalk Line borders, flat-first surfaces

### Dashboard (organiser)
- [x] Sidebar layout with mobile top bar
- [x] My Votes page — stat strip, grouped by status (active / draft / closed), vote cards with access badges
- [x] Vote creation wizard — 4-step drawer (basic info, positions & candidates, access control, publish)
  - [x] Step 1 — title, description, banner upload, start/end time
  - [x] Step 2 — positions + candidates, drag-to-reorder (dnd-kit), multi-photo per candidate
  - [x] Step 3 — access control (geo-fence, time window, one-per-device, OTP, invite-only)
  - [x] Step 4 — review + publish / save changes
- [x] Edit vote — pre-fill all 4 steps from existing vote data
- [x] Vote detail page — stat strip, sparkline, live results bar chart with position tabs, flagged activity panel
- [x] Close / reopen / delete vote with confirmation modal
- [x] Copy link + download QR code
- [x] Present button → fullscreen projection view
- [x] Fix: "Continue setup" on draft votes now opens the edit drawer

### Voter ballot flow
- [x] `/vote/[slug]` — vote page with status guards (loading, not found, closed, not started yet)
- [x] Geo gate — browser location request, haversine server-side re-validation, plain-language error screens
- [x] Invite gate — contact entry, server-side invite list check
- [x] Ballot shell — sticky progress bar, position-by-position navigation
  - [x] Single choice (card grid)
  - [x] Multiple choice (card grid with max-selection enforcement)
  - [x] Ranked choice (drag-to-rank)
- [x] Confirmation step — review selections before submit
- [x] Success screen — "Vote recorded" + optional live results for voters
- [x] Already voted screen — shown immediately on load if fingerprint already in DB (candidates never shown)

### Anti-abuse & integrity
- [x] Device fingerprinting (FingerprintJS v5) — one submission per device
- [x] Server-side duplicate check (fingerprint index) — blocks re-submission even if client is bypassed
- [x] Fix: ConvexError used for all user-facing mutation errors so messages reach the client
- [x] Fix: checkHasVoted query gates ballot render — already-voted voters never see candidates
- [x] IP velocity detection — flags unusual submission bursts, pauses voting temporarily
- [x] IP threshold flagging — flags IPs with abnormal submission counts
- [x] Flagged activity panel on vote detail page

### Real-time
- [x] Live results — Convex reactive queries update bar charts without refresh
- [x] Submission sparkline — cumulative vote timeline on vote detail
- [x] Presence counter — "X on ballot now" via session heartbeat

### Present mode
- [x] `/present/[voteId]` — fullscreen projection page (auth-guarded)
- [x] QR view — giant QR code, live ballot count, vote URL
- [x] Results view — large bar chart with position tabs
- [x] Space bar / button toggle between views

### Scheduler
- [x] Auto-close on endAt — Convex scheduler fires `autoClose` mutation at the configured end time
- [x] Reschedule when endAt is edited on an active vote

---

## 🔲 Not yet built

- [ ] OTP verification flow (flag exists in access control, not implemented)
- [ ] Invite list management UI (add/remove contacts for invite-only votes)
- [ ] Voter-facing results page (separate route, not just post-submit screen)
- [ ] Account / profile settings page for organisers
- [ ] Email notifications (vote opened, vote closed, results ready)
- [ ] Export results (CSV / PDF)
- [ ] Public results page (shareable after vote closes)
