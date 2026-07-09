import Image from "next/image"
import { LandingNav, LandingHeroActions } from "@/components/landing-nav"
import { HeroCyclingWord } from "@/components/hero-cycling-word"
import {
  IntroSection,
  FeaturesSection,
  UseCasesSection,
  TestimonialSection,
  FinalCtaSection,
  LandingFooter,
} from "@/components/landing-sections"

function HeroSection() {
  return (
    <section className="relative h-[100vh] overflow-hidden flex flex-col bg-sky-wash">
      {/* Soft decorative background gradients matching the light Geniestudio theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-whisper-fade-blue blur-[100px] opacity-70 pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-whisper-fade-violet blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-whisper-fade-yellow blur-[100px] opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center px-5 sm:px-8 pt-[7.5rem] pb-0 text-center flex-1 justify-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-silver-pine/20 bg-canvas-white/60 backdrop-blur-md px-3.5 py-1 mb-6 shadow-sm">
          <span className="size-1.5 rounded-full bg-electric-blue animate-pulse" />
          <span className="text-[10px] font-bold text-silver-pine tracking-[0.10em] uppercase">
            Trusted Community Voting
          </span>
        </div>

        <h1
          className="text-obsidian font-bold leading-[1.12] max-w-3xl font-heading"
          style={{
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            letterSpacing: "-0.02em",
          } as React.CSSProperties}
        >
          Run secure voting for
          <br />
          <span className="text-electric-blue">
            <HeroCyclingWord />
          </span>
        </h1>

        <p className="mt-6 text-silver-pine font-medium text-lg leading-relaxed max-w-[42ch]">
          Create public or geo-restricted votes in minutes. Live results,
          duplicate prevention, and QR access — built for the room.
        </p>

        <div className="mt-8">
          <LandingHeroActions />
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas-white font-sans text-obsidian">
      <LandingNav />
      <main>
        <HeroSection />
        <IntroSection />
        <FeaturesSection />
        <UseCasesSection />
        <TestimonialSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
