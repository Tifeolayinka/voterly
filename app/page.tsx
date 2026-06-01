import Image from "next/image"
import { LandingNav, LandingHeroActions } from "@/components/landing-nav"
import { HeroCyclingWord } from "@/components/hero-cycling-word"

function HeroSection() {
  return (
    <section className="relative h-[100vh] overflow-hidden flex flex-col">

      {/* Background photo */}
      <Image
        src="/hero-community.png"
        alt="Community members gathered outdoors for a vote, with a large cross on a hill and a blue sky behind"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Radial overlay anchored to the top — darkens the nav/sky area, fades out below */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 120% 60% at 50% 0%, oklch(0 0 0 / 0.72) 0%, oklch(0 0 0 / 0.30) 55%, transparent 100%)",
        }}
      />

      {/* Content — anchored to the dark top zone, just below the fixed nav */}
      <div className="relative z-10 w-full flex flex-col items-center px-5 sm:px-8 pt-[5.5rem] pb-0 text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.08] backdrop-blur-sm px-3.5 py-1 mb-5">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-white/65 tracking-[0.10em] uppercase">
            Trusted Community Voting
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-white font-extrabold leading-[1.12] max-w-2xl"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
            letterSpacing: "-0.025em",
          } as React.CSSProperties}
        >
          Run secure voting for
          <br />
          <span className="text-primary">
            <HeroCyclingWord />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-white/60 text-[0.8125rem] leading-relaxed max-w-[38ch]">
          Create public or geo-restricted votes in minutes. Live results,
          duplicate prevention, and QR access — built for the room.
        </p>

        {/* CTAs */}
        <div className="mt-6">
          <LandingHeroActions />
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
      </main>
    </div>
  )
}
