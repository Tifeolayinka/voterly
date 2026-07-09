"use client"

import Link from "next/link"
import { ScrollReveal } from "@/components/landing-scroll-reveal"
import { useAuth } from "@clerk/nextjs"
import {
  Building2,
  Heart,
  GraduationCap,
  CheckCircle2,
  Lock,
  MapPin,
  Home,
  ChevronRight,
  Quote,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Primitives ────────────────────────────────────────────────────────────────

function FeatureLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-electric-blue mb-3">
      {children}
    </p>
  )
}

function FeatureTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[clamp(1.35rem,2.4vw,1.875rem)] font-bold tracking-tight leading-[1.18] text-obsidian font-heading">
      {children}
    </h3>
  )
}

function FeatureLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-5 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-electric-blue hover:underline underline-offset-4"
    >
      {children}
      <ChevronRight className="size-3.5" />
    </Link>
  )
}

// ─── Mock UI cards (aria-hidden — purely decorative) ──────────────────────────

function MockCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full max-w-sm bg-canvas-white rounded-[32px] border border-silver-pine/10 overflow-hidden shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  )
}

function MockInviteGate() {
  return (
    <MockCard>
      <div className="bg-midnight-ink px-6 py-4 flex items-center gap-2.5">
        <Lock className="size-4 text-canvas-white/70" />
        <span className="text-canvas-white text-sm font-semibold">Secure Community Voting</span>
      </div>
      <div className="px-6 py-6 space-y-4">
        <div className="rounded-[16px] border border-silver-pine/10 bg-arctic-mist px-4 py-3">
          <p className="text-[11px] text-silver-pine mb-0.5">You&apos;ve been invited to</p>
          <p className="font-semibold text-sm text-obsidian">St. Michael&apos;s Church</p>
          <p className="text-[11px] text-silver-pine">Annual Elder Election 2025</p>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-silver-pine">Enter your invite code</p>
          <div className="flex gap-2">
            {["V", "T", "L", "·"].map((char, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-10 rounded-[8px] border flex items-center justify-center text-sm font-bold",
                  i < 3
                    ? "border-electric-blue bg-sky-wash text-electric-blue"
                    : "border-silver-pine/20 text-silver-pine/40",
                )}
              >
                {char}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center text-[11px] text-silver-pine">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>247 eligible members</span>
          </div>
          <span className="ml-auto">Members only</span>
        </div>
        <div className="h-10 rounded-[32px] bg-midnight-ink flex items-center justify-center text-canvas-white text-sm font-semibold">
          Join and Vote →
        </div>
      </div>
    </MockCard>
  )
}

function MockBallot() {
  const candidates = [
    { name: "Sarah Mitchell", selected: true },
    { name: "James Okafor",   selected: false },
    { name: "Grace Adeyemi",  selected: false },
    { name: "David Lee",      selected: false },
  ]
  return (
    <MockCard>
      <div className="px-6 py-5 border-b border-silver-pine/10">
        <p className="text-[10px] font-bold tracking-widest uppercase text-electric-blue mb-1">
          Multiple Choice
        </p>
        <p className="font-bold text-obsidian">Elder Election 2025</p>
        <p className="text-xs text-silver-pine mt-0.5">Select your preferred candidate</p>
      </div>
      <div className="px-6 py-5 space-y-2">
        {candidates.map(({ name, selected }) => (
          <div
            key={name}
            className={cn(
              "flex items-center gap-3 px-3.5 py-3 rounded-[16px] border",
              selected
                ? "border-electric-blue bg-sky-wash"
                : "border-silver-pine/10 bg-arctic-mist",
            )}
          >
            <div
              className={cn(
                "size-4 rounded-full border-2 flex items-center justify-center shrink-0",
                selected ? "border-electric-blue" : "border-silver-pine/30",
              )}
            >
              {selected && <div className="size-2 rounded-full bg-electric-blue" />}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                selected ? "text-obsidian" : "text-silver-pine",
              )}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between text-[11px] text-silver-pine mb-4">
          <span>Closes in 2 days 4 hrs</span>
          <span>63 votes cast</span>
        </div>
        <div className="h-10 rounded-[32px] bg-midnight-ink flex items-center justify-center text-canvas-white text-sm font-semibold">
          Cast Your Vote
        </div>
      </div>
    </MockCard>
  )
}

function MockLiveResults() {
  const results = [
    { name: "Sarah Mitchell", pct: 41, votes: 102, leading: true },
    { name: "James Okafor",   pct: 31, votes: 77,  leading: false },
    { name: "Grace Adeyemi",  pct: 20, votes: 50,  leading: false },
    { name: "David Lee",      pct: 8,  votes: 20,  leading: false },
  ]
  return (
    <MockCard>
      <div className="px-6 py-5 border-b border-silver-pine/10 flex items-center justify-between">
        <div>
          <p className="font-bold text-obsidian text-sm">Elder Election 2025</p>
          <p className="text-[11px] text-silver-pine mt-0.5">163 of 247 members voted</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Live</span>
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">
        {results.map(({ name, pct, votes, leading }) => (
          <div key={name} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {leading && <CheckCircle2 className="size-4 text-electric-blue" />}
                <span
                  className={cn(
                    "text-xs font-semibold",
                    leading ? "text-obsidian" : "text-silver-pine",
                  )}
                >
                  {name}
                </span>
              </div>
              <span className="text-xs font-bold text-obsidian">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-silver-pine/10 overflow-hidden">
              <div
                className={cn("h-full rounded-full", leading ? "bg-electric-blue" : "bg-electric-blue/40")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-ash-gray">{votes} votes</p>
          </div>
        ))}
      </div>
    </MockCard>
  )
}

function MockGeoGate() {
  return (
    <MockCard>
      <div className="h-32 bg-ghostly-blue relative flex items-center justify-center overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={`h${i}`}
            className="absolute w-full border-b border-canvas-white/60"
            style={{ top: `${(i + 1) * 18}%` }}
          />
        ))}
        {[...Array(7)].map((_, i) => (
          <div
            key={`v${i}`}
            className="absolute h-full border-r border-canvas-white/60"
            style={{ left: `${(i + 1) * 14.28}%` }}
          />
        ))}
        <div className="relative flex flex-col items-center">
          <div className="size-10 rounded-full bg-electric-blue/15 border-2 border-electric-blue/30 flex items-center justify-center">
            <MapPin className="size-5 text-electric-blue" />
          </div>
          <div className="mt-1.5 px-2.5 py-0.5 bg-electric-blue text-canvas-white text-[10px] font-bold rounded-full">
            You are here
          </div>
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div>
          <p className="font-semibold text-obsidian text-sm">Location Verified</p>
          <p className="text-[11px] text-silver-pine mt-0.5">St. Michael&apos;s Church · Detroit, MI</p>
        </div>
        <div className="space-y-2">
          {["Within 150m radius", "Membership confirmed", "Vote not yet cast"].map((label) => (
            <div key={label} className="flex items-center gap-2">
              <div className="size-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-2.5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-silver-pine">{label}</span>
            </div>
          ))}
        </div>
        <div className="h-10 mt-2 rounded-[32px] bg-midnight-ink flex items-center justify-center text-canvas-white text-sm font-semibold">
          Proceed to Vote
        </div>
      </div>
    </MockCard>
  )
}

function MockPresentMode() {
  const results = [
    { name: "Sarah Mitchell", pct: 41, leading: true },
    { name: "James Okafor",   pct: 31, leading: false },
    { name: "Grace Adeyemi",  pct: 20, leading: false },
  ]
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-sm rounded-[32px] overflow-hidden border border-silver-pine/10 bg-canvas-white shadow-lg"
    >
      <div className="px-6 py-4 border-b border-silver-pine/10 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-silver-pine/50">
          Live Results
        </span>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-500">Voting open</span>
        </div>
      </div>
      <div className="px-6 pt-6 pb-2">
        <p className="text-[10px] text-electric-blue uppercase tracking-widest font-bold">Elder Election 2025</p>
        <p className="text-xl font-bold text-obsidian mt-1 font-heading">Results so far</p>
        <p className="text-[11px] text-silver-pine mt-0.5">163 / 247 members voted</p>
      </div>
      <div className="px-6 py-5 space-y-4">
        {results.map(({ name, pct, leading }) => (
          <div key={name} className="space-y-1.5">
            <div className="flex justify-between">
              <span className={cn("text-sm font-semibold", leading ? "text-obsidian" : "text-silver-pine")}>
                {name}
              </span>
              <span className={cn("text-sm font-bold", leading ? "text-electric-blue" : "text-silver-pine")}>
                {pct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-silver-pine/10 overflow-hidden">
              <div
                className={cn("h-full rounded-full", leading ? "bg-electric-blue" : "bg-electric-blue/40")}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-silver-pine/10 bg-arctic-mist">
        <p className="text-[10px] text-silver-pine/60 text-center tracking-widest uppercase font-bold">
          Powered by Votely
        </p>
      </div>
    </div>
  )
}

// ─── Page sections ─────────────────────────────────────────────────────────────

export function IntroSection() {
  return (
    <section className="bg-canvas-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <ScrollReveal className="max-w-3xl">
          <p className="text-[1.125rem] text-silver-pine leading-[1.75] font-medium">
            Community-based decisions, rebuilt around genuine participation. Votely gives
            churches and member organizations a simple, secure way to vote — so every member
            has a real say, leaders have a clear record, and outcomes are trusted by everyone
            in the room.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}

// Alias for page.tsx backward compat
export { IntroSection as ProblemSection }

export function FeaturesSection() {
  return (
    <section id="features" className="bg-sky-wash py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Section header */}
        <ScrollReveal className="flex items-end justify-between gap-4 mb-16 pb-8 border-b border-silver-pine/10">
          <div>
            <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-bold tracking-tight text-obsidian leading-tight font-heading">
              How Votely works
            </h2>
            <p className="mt-3 text-sm text-silver-pine max-w-sm font-medium leading-relaxed">
              Five focused features, built around the way communities actually make decisions.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="shrink-0 hidden sm:inline-flex items-center h-10 px-6 rounded-[32px] bg-canvas-white border border-silver-pine/20 text-sm font-semibold text-obsidian hover:bg-arctic-mist transition-colors shadow-sm"
          >
            Get started
          </Link>
        </ScrollReveal>

        <div className="space-y-24 md:space-y-32">

          {/* 1 — Control */}
          <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="max-w-md">
              <FeatureLabel>Control</FeatureLabel>
              <FeatureTitle>Support tailored to each community.</FeatureTitle>
              <p className="mt-5 text-[0.9375rem] text-silver-pine leading-relaxed font-medium">
                Votely gives you full control over membership — so votes are cast only by the
                people who belong. Invite members by email or a secure link. Set expiry
                dates. Remove access at any time.
              </p>
              <FeatureLink href="/sign-up">Explore community access</FeatureLink>
            </div>
            <div className="flex justify-center lg:justify-end relative">
              <div className="absolute inset-0 bg-whisper-fade-blue blur-3xl opacity-50 rounded-full scale-150" />
              <div className="relative z-10 w-full flex justify-end">
                <MockInviteGate />
              </div>
            </div>
          </ScrollReveal>

          {/* 2 — Adapt */}
          <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start relative">
               <div className="absolute inset-0 bg-whisper-fade-violet blur-3xl opacity-50 rounded-full scale-150" />
               <div className="relative z-10 w-full flex justify-start">
                  <MockBallot />
               </div>
            </div>
            <div className="order-1 lg:order-2 max-w-md lg:ml-auto">
              <FeatureLabel>Adapt</FeatureLabel>
              <FeatureTitle>Automate ballots with precision.</FeatureTitle>
              <p className="mt-5 text-[0.9375rem] text-silver-pine leading-relaxed font-medium">
                Not every decision is a yes/no. Votely supports approval votes,
                multiple-choice questions, and ranked-choice elections — so whether you&apos;re
                electing deacons, approving a budget, or gathering preferences, the format
                fits the decision.
              </p>
              <FeatureLink href="/sign-up">Explore ballot types</FeatureLink>
            </div>
          </ScrollReveal>

          {/* 3 — Trust */}
          <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="max-w-md">
              <FeatureLabel>Trust</FeatureLabel>
              <FeatureTitle>Spot outcomes before doubt can take root.</FeatureTitle>
              <p className="mt-5 text-[0.9375rem] text-silver-pine leading-relaxed font-medium">
                Members watch participation unfold as votes come in. No waiting for a tally.
                No backroom counting. When results land, they land publicly — and the
                community moves forward with confidence in the outcome.
              </p>
              <FeatureLink href="/sign-up">Explore live results</FeatureLink>
            </div>
            <div className="flex justify-center lg:justify-end relative">
               <div className="absolute inset-0 bg-whisper-fade-yellow blur-3xl opacity-50 rounded-full scale-150" />
               <div className="relative z-10 w-full flex justify-end">
                  <MockLiveResults />
               </div>
            </div>
          </ScrollReveal>

          {/* 4 — Verify */}
          <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start relative">
               <div className="absolute inset-0 bg-whisper-fade-orange blur-3xl opacity-50 rounded-full scale-150" />
               <div className="relative z-10 w-full flex justify-start">
                  <MockGeoGate />
               </div>
            </div>
            <div className="order-1 lg:order-2 max-w-md lg:ml-auto">
              <FeatureLabel>Verify</FeatureLabel>
              <FeatureTitle>Reinforce accountability with check-ins.</FeatureTitle>
              <p className="mt-5 text-[0.9375rem] text-silver-pine leading-relaxed font-medium">
                For votes that require attendance — like a congregational election — Votely
                lets you add location check-ins or custom confirmation prompts before a
                ballot is accepted. Add accountability where it matters, without friction.
              </p>
              <FeatureLink href="/sign-up">Explore verification</FeatureLink>
            </div>
          </ScrollReveal>

          {/* 5 — Present */}
          <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="max-w-md">
              <FeatureLabel>Present</FeatureLabel>
              <FeatureTitle>A simple experience for the whole room.</FeatureTitle>
              <p className="mt-5 text-[0.9375rem] text-silver-pine leading-relaxed font-medium">
                Display live results on a screen during your gathering. Watch members engage
                as the numbers move. It turns a vote into a shared moment — and a moment
                into a memory your community keeps.
              </p>
              <FeatureLink href="/sign-up">Explore present mode</FeatureLink>
            </div>
            <div className="flex justify-center lg:justify-end relative">
               <div className="absolute inset-0 bg-whisper-fade-blue blur-3xl opacity-50 rounded-full scale-150" />
               <div className="relative z-10 w-full flex justify-end">
                  <MockPresentMode />
               </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  )
}

const USE_CASES = [
  {
    icon: Building2,
    title: "Churches",
    body: "Reinforcing congregational trust through elder elections, budget approvals, and building project votes.",
  },
  {
    icon: Home,
    title: "Homeowners Associations",
    body: "Guiding neighborhoods through bylaw changes, committee elections, and community decisions.",
  },
  {
    icon: Heart,
    title: "Nonprofits & Charities",
    body: "Improving board governance with transparent elections, grant decisions, and member votes.",
  },
  {
    icon: GraduationCap,
    title: "Alumni & Member Orgs",
    body: "Improving chapter elections, event planning, and member-driven policy decisions.",
  },
] as const

export function UseCasesSection() {
  return (
    <section id="audience" className="bg-canvas-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <ScrollReveal className="flex items-end justify-between gap-4 mb-14 pb-8 border-b border-silver-pine/10">
          <div>
            <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] font-bold tracking-tight text-obsidian leading-tight font-heading">
              Use cases
            </h2>
            <p className="mt-3 text-sm text-silver-pine max-w-sm font-medium">
              See how Votely drives participation and trust across every community type.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="shrink-0 hidden sm:inline-flex items-center h-10 px-6 rounded-[32px] border border-silver-pine/20 text-sm font-semibold text-obsidian hover:bg-arctic-mist transition-colors"
          >
            See all
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map(({ icon: Icon, title, body }, i) => (
            <ScrollReveal
              key={title}
              delay={([0, 1, 2, 3] as const)[i]}
              className="group rounded-[32px] border border-silver-pine/10 bg-arctic-mist p-8 flex flex-col gap-5 hover:border-electric-blue/30 transition-colors shadow-sm"
            >
              <div className="size-12 rounded-[16px] bg-canvas-white shadow-sm flex items-center justify-center">
                <Icon className="size-5 text-electric-blue" />
              </div>
              <div>
                <h3 className="font-bold text-obsidian text-sm mb-2.5">{title}</h3>
                <p className="text-sm text-silver-pine leading-relaxed font-medium">{body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// Alias for page.tsx backward compat
export { UseCasesSection as AudienceSection }

export function TestimonialSection() {
  return (
    <section className="bg-arctic-mist py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-whisper-fade-blue blur-[120px] rounded-full opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-whisper-fade-violet blur-[100px] rounded-full opacity-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">

        <ScrollReveal delay={1} className="max-w-3xl">
          <Quote className="size-10 text-electric-blue/20 mb-6" />
          <blockquote className="text-obsidian text-xl md:text-[2rem] font-bold leading-[1.4] font-heading tracking-tight">
            "Before Votely, our congregational meetings were chaotic, and members who
            couldn&apos;t attend felt completely left out. Now our entire congregation
            participates — including our seniors who&apos;ve never used an app before. The trust
            it&apos;s built in our leadership is remarkable."
          </blockquote>
          <div className="mt-10 flex items-center gap-4">
            <div className="size-14 rounded-full bg-electric-blue/10 flex items-center justify-center shrink-0 border border-electric-blue/20">
              <span className="text-electric-blue font-bold text-sm">JO</span>
            </div>
            <div>
              <p className="font-bold text-obsidian text-sm">Rev. James Okonkwo</p>
              <p className="text-silver-pine text-sm font-medium mt-0.5">Senior Pastor, Grace Community Church</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          delay={2}
          className="mt-20 border-t border-silver-pine/10 pt-16 grid grid-cols-1 sm:grid-cols-3 gap-10"
        >
          {[
            { stat: "500+",    label: "Communities onboarded" },
            { stat: "12,000+", label: "Votes cast" },
            { stat: "94%",     label: "Average participation rate" },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="text-[2.5rem] font-bold text-obsidian font-heading tracking-tight leading-none">{stat}</p>
              <p className="text-silver-pine text-sm font-medium mt-3">{label}</p>
            </div>
          ))}
        </ScrollReveal>

      </div>
    </section>
  )
}

export function FinalCtaSection() {
  const { isSignedIn, isLoaded } = useAuth()
  return (
    <section className="bg-canvas-white pt-20 md:pt-32 pb-0 overflow-hidden relative">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-sky-wash to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">

        <ScrollReveal className="text-center max-w-xl mx-auto">
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-tight text-obsidian leading-[1.12] font-heading">
            Let&apos;s vote.
          </h2>
          <p className="mt-6 text-[1.125rem] text-silver-pine font-medium leading-relaxed">
            Set up your community in minutes. Free to start, no credit card required — just
            you and the people you serve.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            {!isLoaded ? (
              <>
                <div className="h-12 w-52 rounded-[32px] bg-black/5 animate-pulse" />
                <div className="h-12 w-32 rounded-[32px] bg-black/[0.03] animate-pulse" />
              </>
            ) : isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center h-12 px-10 rounded-[32px] bg-midnight-ink text-canvas-white text-sm font-bold hover:bg-obsidian transition-colors shadow-lg"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center h-12 px-10 rounded-[32px] bg-midnight-ink text-canvas-white text-sm font-bold hover:bg-obsidian transition-colors shadow-lg"
                >
                  Get started free
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center h-12 px-8 rounded-[32px] border-2 border-silver-pine/20 text-obsidian text-sm font-bold hover:bg-black/5 transition-colors"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
          <p className="mt-6 text-ash-gray text-xs font-medium">
            Used by churches, nonprofits, and community organizations.
          </p>
        </ScrollReveal>

        {/* Giant wordmark */}
        <div
          className="mt-16 select-none overflow-hidden pb-10"
          aria-hidden="true"
        >
          <p
            className="text-center font-bold tracking-tighter text-sky-wash leading-none whitespace-nowrap font-heading"
            style={{ fontSize: "clamp(5rem, 24vw, 20rem)" }}
          >
            votely
          </p>
        </div>

      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="bg-canvas-white border-t border-silver-pine/10 py-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-[12px] bg-electric-blue flex items-center justify-center">
              <CheckCircle2 className="size-4 text-canvas-white" />
            </div>
            <span className="font-bold text-obsidian text-base font-heading">Votely</span>
            <span className="text-silver-pine text-sm hidden md:inline font-medium ml-2">
              — Voting built for communities that trust each other.
            </span>
          </div>
          <nav className="flex gap-x-6 gap-y-3 flex-wrap justify-center">
            {["About", "Privacy", "Terms", "Contact"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-[13px] font-medium text-silver-pine hover:text-obsidian transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-silver-pine/10 flex flex-col sm:flex-row items-center justify-between gap-4">
           <p className="text-ash-gray text-[13px] font-medium text-center sm:text-left">
             © {new Date().getFullYear()} Votely. All rights reserved.
           </p>
           <p className="text-ash-gray text-[13px] font-medium text-center sm:text-right">
             Designed with Geniestudio.
           </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Exports no longer used but kept for dead-code safety ────────────────────
export function ValuePillarsSection() { return null }
export function HowItWorksSection()   { return null }
