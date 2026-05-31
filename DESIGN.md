---
name: Votely
description: Geo-restricted community voting for churches, schools, and events.
colors:
  assembly-blue: "oklch(0.49 0.21 255)"
  deep-ink: "oklch(0.13 0.025 255)"
  pure-white: "oklch(1 0 0)"
  pale-gather: "oklch(0.97 0.008 255)"
  quiet-slate: "oklch(0.55 0.02 255)"
  open-sky: "oklch(0.94 0.04 255)"
  chalk-line: "oklch(0.91 0.01 255)"
  alert-red: "oklch(0.577 0.245 27.325)"
  sidebar-canvas: "oklch(0.985 0.005 255)"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.assembly-blue}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "oklch(0.49 0.21 255 / 0.82)"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.md}"
  button-outline:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.quiet-slate}"
    rounded: "{rounded.md}"
  button-ghost-hover:
    backgroundColor: "{colors.pale-gather}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.md}"
  nav-item-active:
    backgroundColor: "oklch(0.49 0.21 255 / 0.08)"
    textColor: "{colors.assembly-blue}"
    rounded: "{rounded.md}"
  vote-row:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
---

# Design System: Votely

## 1. Overview

**Creative North Star: "The Village Square"**

Votely is not a SaaS tool. It is the room where a community makes a decision. The people inside it already know each other: they're in the same church, the same school, the same organization. The interface carries the weight of that moment without making it feel heavy. Light, open, honest — the way a well-organized public meeting feels before it starts.

Color is restrained: Assembly Blue anchors trust and action; everything else is neutral so the ballot content, not the chrome, commands attention. Type is Inter at deliberately modest sizes — large enough to read across the room on a phone, small enough to feel composed rather than shouting. Depth is nearly flat. Surfaces are separated by fine chalk-line borders, not shadows. A shadow appearing means something lifted off the page: hover, confirmation, active state. Not decoration.

This system explicitly rejects startup precision-noir (dark sidebar, monospaced display type, over-minimal chrome — that coldness is wrong for a room of church members or student delegates), and it rejects consumer-social theatrics (gradient hero numbers, animated "votes received" counters, anything that turns a ballot into a game). The Village Square is welcoming and purposeful, not cool or exciting.

**Key Characteristics:**
- White page, blue intention: pure white canvas with Assembly Blue reserved for interactive elements only
- Flat-first surfaces: borders define hierarchy; shadows signal state change, never decoration
- Prose-sized type: Inter at readable weights — the ballot should feel like a printed form, not an app pitch
- One tap, clear consequence: every action state (hover, active, disabled, success) is unambiguous at arm's length
- Plain language throughout: status and error copy written as a neighbor would say it, not as a status code

## 2. Colors: The Village Square Palette

A restrained strategy: one saturated accent + tinted neutrals. Assembly Blue occupies less than 15% of any screen; its rarity is the signal of authority.

### Primary
- **Assembly Blue** (`oklch(0.49 0.21 255)`, ≈ #2563EB): The sole saturated color. Used for: primary buttons, active navigation state, focus rings, interactive links. Never used for decorative fills, background washes, or section color.

### Secondary
(None. The design system has one accent by design. Introducing a second saturated color is prohibited without revising this spec.)

### Neutral
- **Deep Ink** (`oklch(0.13 0.025 255)`, ≈ #0F172A): Primary text. Page headings, content titles, body copy. Slightly blue-tinted toward the brand's own hue.
- **Quiet Slate** (`oklch(0.55 0.02 255)`, ≈ #64748B): Secondary text. Captions, metadata, disabled labels, nav items at rest. Contrast 4.5:1+ against Pure White confirmed.
- **Pure White** (`oklch(1 0 0)`, #FFFFFF): Page background and card surfaces.
- **Pale Gather** (`oklch(0.97 0.008 255)`, ≈ #F1F5F9): Tinted near-white for section backgrounds (landing features row, sidebar canvas alt), hover fill on ghost buttons. Never used as primary page background.
- **Open Sky** (`oklch(0.94 0.04 255)`, ≈ #EFF6FF): Active-state background tint (nav item active, accent/hover chips). The blue-tint of "I am here."
- **Chalk Line** (`oklch(0.91 0.01 255)`, ≈ #E2E8F0): Default border on cards, inputs, dividers, nav separators. Fine and quiet.
- **Sidebar Canvas** (`oklch(0.985 0.005 255)`, ≈ #F8FAFC): Dashboard sidebar background. One step off Pure White to distinguish the navigation layer without visual weight.
- **Alert Red** (`oklch(0.577 0.245 27.325)`, ≈ #DC2626): Destructive actions, form errors, out-of-bounds geo state. Used only with supporting copy — never as the sole signal.

### Named Rules
**The Assembly Voice Rule.** Assembly Blue appears on interactive elements (buttons, links, active states) and nowhere else. On any screen, it occupies less than 15% of the visible surface. Its rarity is the point: when it appears, the user knows exactly what to do.

**The Tint Direction Rule.** Every neutral is tinted toward blue (hue 255), not toward warm (hue 40-100). There is no cream, sand, or parchment in this system. Warmth is carried by the product — the community it serves — not by background color.

## 3. Typography

**Display + Body Font:** Inter (single family, weight contrast)
**Fallback:** ui-sans-serif, system-ui, sans-serif

**Character:** One font family, five distinct roles through weight and size contrast. Inter's humanist proportions make it readable for non-technical attendees on low-quality phone screens. No display typeface, no serif, no pairing: the single-family discipline communicates "we built this for the content, not the brand."

### Hierarchy
- **Display** (800, clamp 2.25rem→3.75rem, line-height 1.08, tracking -0.02em): Landing page hero, vote result announcement headline. One per page or view maximum.
- **Headline** (700, clamp 1.5rem→2rem, line-height 1.2, tracking -0.015em): Page titles (dashboard "My Votes"), section breaks, modal headers.
- **Title** (600, 1.125rem, line-height 1.4, tracking -0.01em): Card headings, list section dividers, form step labels.
- **Body** (400, 0.9375rem / 15px, line-height 1.65): All prose — vote descriptions, candidate bios, helper text. Maximum line length 68ch.
- **Label** (500, 0.8125rem / 13px, line-height 1.4): Status dots, navigation items, table headers, metadata. Sentence case. Never all-caps body; uppercase reserved for labels ≤4 words (e.g. status chips).

### Named Rules
**The Weight Contrast Rule.** Heading over body must have at least a 1-step weight jump (600 over 400; 700 over 500). Two 400-weight elements at different sizes do not make hierarchy — they make ambiguity.

**The Floor Rule.** Minimum rendered body font size is 16px (1rem) for voter-facing screens. 15px is acceptable for organizer dashboard metadata. Nothing below 12px in any active context.

## 4. Elevation

Votely is flat-first. Surfaces are defined by a 1px Chalk Line border, not by shadow depth. This keeps the interface from feeling like it's trying to impress; the vote itself is the important thing.

One shadow register exists: `shadow-sm` (`0 1px 3px oklch(0 0 0 / 0.06), 0 1px 2px oklch(0 0 0 / 0.04)`). It appears only as a hover-state lift on interactive rows and cards — the signal that "this is responding to you." It never appears at rest.

### Named Rules
**The Flat-First Rule.** At rest, a surface has a Chalk Line border OR nothing. Shadow appears only on state (hover, active, elevated modal). No element has both a colored border and a shadow simultaneously — that is the "ghost card" pattern and it is prohibited.

## 5. Components

**The system's feel:** Confident and structured. Sizes are intentional, not arbitrary. Elements don't overlap or float; they are placed. State changes are visible and deliberate.

### Buttons
- **Shape:** Rounded corners (8px, `rounded-lg`)
- **Primary:** Assembly Blue fill, white text, 32px height default / 44px height large (voter-facing CTAs). `bg-primary text-primary-foreground`. Hover drops opacity to 82%.
- **Hover / Focus:** Opacity-80 on hover. Focus ring: 3px Assembly Blue at 50% opacity, 1px offset. No border/shadow on same element — focus ring is the only elevation signal.
- **Outline:** 1px Chalk Line border, white fill, Deep Ink text. For secondary actions alongside a primary.
- **Ghost:** No border, no fill at rest. Quiet Slate text. Hover fills with Pale Gather and shifts text to Deep Ink. Used for tertiary actions (nav items, row actions).
- **Destructive:** Alert Red at 10% opacity fill, Alert Red text. Never a solid red fill — that reads as alarm, not a considered action.

### Vote Rows (Dashboard)
The primary list element of the organizer dashboard. Not a card — a row.
- **Shape:** 12px radius (`rounded-xl`), 1px Chalk Line border
- **Background:** Pure White at rest
- **Hover:** Border shifts to Assembly Blue at 30% opacity + shadow-sm lift
- **Status dot:** 8px circle, left-aligned. Emerald 500 (active), Slate 300 (draft, closed)
- **Internal padding:** 14px vertical, 16px horizontal

### Inputs / Fields
- **Style:** 1px Chalk Line border, white fill, 8px radius
- **Focus:** Border shifts to Assembly Blue (1px); 3px Assembly Blue ring at 50% opacity
- **Error:** Border shifts to Alert Red; 3px Alert Red ring at 20% opacity; error text in Alert Red below the field
- **Disabled:** 50% opacity, cursor-not-allowed

### Navigation (Dashboard Sidebar)
- **Background:** Sidebar Canvas (`oklch(0.985 0.005 255)`), 56px width, 1px Chalk Line border-right
- **Item at rest:** Quiet Slate text, 8px radius, no fill
- **Item active:** Open Sky fill (`oklch(0.94 0.04 255)`), Assembly Blue text, medium weight
- **Brand mark:** 28px square, Assembly Blue fill, rounded-lg, white icon inside — the only saturated fill in the nav

### Ballot Cards (Voter Flow)
The candidate card shown during voting. This is the most consequential UI component in the product.
- **Shape:** 12px radius, 1px Chalk Line border, 16px padding
- **At rest:** Pure White fill
- **Selected:** Open Sky fill, Assembly Blue border (1px), check indicator
- **Tap target:** Full card is the tap target; minimum 64px tall
- **State changes:** 150ms ease-out transition on border-color and background

### Geo Status Screens
Shown when location permission is requested, denied, or fails. Distinct from a generic error state.
- **Container:** Centered column, 24px gap between icon and copy
- **Icon:** 48px rounded-2xl container at 10% primary opacity; icon at 28px
- **Retry button:** Outline style (Chalk Line border, white fill) — never Primary, which would suggest the action is required rather than available

## 6. Do's and Don'ts

### Do:
- **Do** use Assembly Blue for interactive elements only. A blue headline or a blue background section are both prohibited.
- **Do** write every voter-facing error state as a person would say it in the room. "You're not at the venue" over "Geo-validation failed."
- **Do** use the Chalk Line border (`oklch(0.91 0.01 255)`) as the primary separation tool. Reserve shadows for interactive lift states.
- **Do** meet 4.5:1 contrast on all body text. Quiet Slate (#64748B) on Pure White is 4.6:1 — confirm any new Quiet Slate context at WCAG AA.
- **Do** keep ballot tap targets a minimum of 64px tall on voter-facing screens. Voters are in a crowded room.
- **Do** use Inter's weight contrast (700+ over 400) to communicate hierarchy. Don't add a second font family to compensate for a flat scale.
- **Do** use `text-wrap: balance` on all h1–h3 elements to prevent orphaned words on narrow screens.

### Don't:
- **Don't** use startup-generic aesthetics: no dark sidebar, no monospaced display type, no over-minimal chrome. This is a village square, not a dev tool.
- **Don't** use consumer-social polling patterns: no gradient hero numbers, no animated vote counters, no emoji reactions, no gamification of ballot submission. A vote is a decision, not an engagement moment.
- **Don't** use border-left or border-right greater than 1px as a colored side-stripe accent on cards, alerts, or list items. Full borders or background tints only.
- **Don't** apply `background-clip: text` with any gradient. Solid Assembly Blue for text emphasis; size and weight for hierarchy.
- **Don't** use `border-radius` above 16px on cards, vote rows, or inputs. Pill shape is acceptable for status chips and tags only.
- **Don't** use Assembly Blue and shadow-sm on the same element at rest. Pick one: a Chalk Line border OR a shadow on hover. Never both simultaneously.
- **Don't** use cream, sand, beige, or any warm-tinted neutral as a background. Warmth is carried by the community using the product, not by the interface's temperature.
- **Don't** add eyebrows (small uppercase tracked labels above every section heading). One deliberate labeled section is voice; eyebrows on every section is AI scaffold.
- **Don't** use `letter-spacing` tighter than -0.04em on any text. -0.02em on display, -0.015em on headlines is already precise.
- **Don't** gate voter-facing content visibility on animation class triggers. Geo-gate, error, and success states must be immediately visible; state transitions enhance, they don't reveal.
