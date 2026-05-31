PRD — Geo-Restricted Community Voting Platform
We're building a geo-restricted community voting platform for churches, schools, student associations, and event organisers. The app lets organisers create votes, configure access restrictions, and share them with their audience via link or QR code. Voters participate directly from their phones with no account required. The core differentiator is geo-fencing — organisers can restrict voting to people physically present at a venue, making it impossible for outsiders to manipulate results.

App Functionality
Authentication

Organisers sign up and log in via Clerk — Google OAuth or email/password
Voters do not need an account; they access votes via shared link or QR code
All vote management features are behind auth; all voter-facing pages are public

Vote Creation

Organiser creates a vote through a structured multi-step form
Step 1 — Basic Info: title (required), description (optional), banner image (optional), start datetime, end datetime
Step 2 — Candidates: add candidates with name (required), photo (optional), bio/description (optional); minimum 2 candidates required to publish
Step 3 — Voting Type: organiser selects one voting mode for the vote

Single Choice — voter selects exactly one candidate
Multiple Choice — voter selects up to N candidates; organiser sets the max number of selections
Ranked Choice — voter ranks candidates in order of preference (1st, 2nd, 3rd, etc.)


Step 4 — Access Control: organiser toggles between Open or Restricted

Open — public link, anyone with the link can vote, one vote per phone enforced
Restricted — organiser enables any combination of the following controls:

Geo-fencing — voters must be within a set radius of the venue to access the vote
Time window — vote only accepts submissions between set start and end times
One vote per phone — device fingerprint + phone hash deduplication (on by default)
OTP verification — voter must verify a phone number before submitting
Invite-only — only voters on an uploaded whitelist (phone or email) can participate




Step 5 — Publish: vote goes live; share link and QR code are generated

Geo-Restriction

When geo-fencing is enabled, organiser sets the venue using one of three methods: search by venue name or address, pin manually on a Mapbox map, or use their current location
Organiser sets a voting radius — options are 100m, 150m, 250m, or a custom value; default is 150m (50m is not offered as it is unreliable due to GPS drift indoors)
When a voter opens a geo-restricted vote link, the browser requests location permission
The app validates the voter's coordinates against the venue coordinates server-side
Voter-facing outcomes:

Inside radius → voter proceeds to the ballot
Outside radius → "You must be at the event venue to vote."
Location permission denied → "Location access is required for this vote. Please allow it in your browser settings."
Location unavailable (no GPS signal) → "We couldn't verify your location. Contact the organiser."


Organiser is shown a note during setup that GPS drift of 50–150m is normal, particularly indoors, and to account for this when choosing a radius

Voting Experience

Voter opens the vote via share link or QR code scan — no login or account creation required
If geo-restricted, location is checked before the ballot loads
Ballot displays candidate cards showing photo, name, and bio
Voting UI adapts to the voting type:

Single Choice — radio-style selection, one candidate at a time
Multiple Choice — checkbox-style selection, up to the organiser-set limit
Ranked Choice — drag-and-drop or numbered ordering interface


A confirmation step is shown before final submission to prevent accidental votes
On successful submission: vote is recorded, success screen is shown, interest count updates
One-vote-per-phone is enforced using device fingerprint and phone hash — a voter cannot submit more than once from the same device regardless of browser or session

Organiser Dashboard

Overview of all votes created by the organiser, grouped by status: Draft, Active, Closed
Each vote row shows title, status badge, vote count, and quick actions
Per-vote detail view includes:

Live vote count per candidate, updated in real time
Total submissions and votes-over-time chart
Live leaderboard showing current ranking
Flagged activity log (suspicious IPs, velocity spikes)
Active voter count (number of voters currently on the ballot page)


Actions available per vote: close voting early, reopen a closed vote, copy share link, download QR code as PNG, delete vote (requires confirmation)

Real-Time Results

Convex real-time subscriptions keep vote counts and leaderboard positions updated live without page refresh
Organiser sees live count updates on the dashboard
Voters optionally see live results on the success screen after submitting (organiser can disable this per vote)

QR Code & Sharing

Every published vote automatically generates a shareable URL at /vote/[slug] and a downloadable QR code (PNG)
A WhatsApp-ready message containing the vote title and link is available to copy with one tap
QR codes are sized and formatted for use on projection screens, printed banners, and event signage

Anti-Abuse

Every ballot submission logs the voter's IP address
If the same IP address submits more than 5 votes on a single vote, it is flagged in the organiser's activity log
Velocity detection runs server-side on every submission — if more than 100 votes are recorded within 60 seconds, the system pauses new submissions and sends an alert email to the organiser via Resend
Device fingerprinting and phone hashing are the primary deduplication layer; IP monitoring is a secondary signal
Fingerprinting limitations: does not work across different browsers or private/incognito mode — this is documented as a known limitation, not a bug


Tech

Next.js 15 (App Router)
Convex (real-time database, backend functions, and subscriptions)
Clerk (organiser authentication — Google + email)
Mapbox (venue search, interactive map pinning, server-side coordinate validation)
Resend (voter confirmation emails, organiser velocity alert emails)
Tailwind + shadcn/ui for all UI components

Look & Feel

Mobile-first — every screen is designed for a phone; the voting flow completes in under 15 seconds
Dark mode by default with a light mode toggle
Clean, trustworthy aesthetic — must feel approachable for non-technical organisers and first-time voters
Large tap targets throughout, minimal clicks from link open to vote submitted
shadcn/ui as the component base, customised for a polished event-native feel
No jargon in voter-facing UI — all copy written in plain, direct language


Process

Use MCP for all external service integrations (Mapbox, Resend, Clerk)
Voters never hit a login wall — all public vote pages must be accessible without authentication
Server-side validation for geo-checks, fingerprint deduplication, and velocity detection — never trust the client