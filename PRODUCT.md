# Product

## Register

product

## Users

**Organizers** — church leaders, school administrators, student union officers, event hosts. They set up votes before an event, typically on a laptop, and manage results from the venue on their phone during the event. Non-technical; they should not need to read documentation to create a vote.

**Voters** — attendees at an in-person event. They arrive at the ballot via a shared link or QR code scan, on their own phone, in a crowded room. They have never used this product before and will not use it again for weeks. The entire experience must complete in under 15 seconds. They never create an account.

## Product Purpose

Votely lets organizers run geo-fenced votes at in-person events. The ballot is only accessible to people physically at the venue. This removes the outside-manipulation problem that breaks community and organizational trust in digital polling. Success: an organizer can set up a vote, project the QR code, and have 100 attendees submit a verifiable ballot — all within a single event session.

## Brand Personality

Warm, communal, human. Not a startup tool, not a government form. Feels like the organization itself made it: trusted, purposeful, a little proud. The ballot is consequential; the interface should carry that weight without becoming heavy.

## Anti-references

- **Startup-generic (Linear, Vercel, Raycast aesthetic)**: Dark sidebar, monospace display type, over-minimal chrome. Cold precision is wrong for a church AGM or a student election.
- **Consumer social polling (Slido, Mentimeter in party mode)**: Playful gradients, emoji reactions, "engagement" animations. Turns a serious vote into a game show.
- **Enterprise SaaS (Salesforce, legacy survey tools)**: Dense chrome, acronym-heavy labels, nested modals. Voters would abandon before submitting.
- **Government/civic (usa.gov, generic council portals)**: Utilitarian, flat, no warmth, no trust signal beyond official seals.

## Design Principles

1. **Trust at first contact.** A voter who opens the ballot link has never seen this product. They must feel in three seconds that this is legitimate and worth their vote — not a phishing page, not a toy. Visual credibility, plain language, and zero dark patterns.
2. **The room is the context.** The voting flow is designed for a phone in a crowded venue: variable lighting, one hand available, 10 people nearby also voting. Every tap target, every word, every state transition is tested for that specific physical context.
3. **Organizer confidence, not organizer expertise.** The creation flow should feel like setting up something important — clear steps, confirmable choices, recoverable mistakes. An organizer should never wonder if they clicked the wrong thing.
4. **Communal, not competitive.** Voting is a collective act in the same room. The design acknowledges the shared moment: results feel like an announcement, not a leaderboard reveal.
5. **Plain language at every state.** Geo-denied, permission-blocked, duplicate-detected — every error state is written for a first-time voter with no context, not a developer reading a status code.

## Accessibility & Inclusion

WCAG AA minimum. Large tap targets throughout (minimum 44px). Font sizes suit older attendees (minimum 16px body). Ballot states must not rely on color alone. Reduced-motion respected. Voter-facing copy written at a reading level accessible to a 14-year-old.
