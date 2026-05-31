import { Vote, MapPin, Zap, Shield } from 'lucide-react'
import { LandingHeaderActions, LandingHeroActions } from '@/components/landing-nav'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-primary" />
          <span className="font-bold text-base tracking-tight">Votely</span>
        </div>
        <LandingHeaderActions />
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center gap-6 max-w-2xl mx-auto w-full">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          Voting that stays in the room.
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg">
          Create live votes for churches, schools, and events. Geo-fence your
          ballot so only people at the venue can participate.
        </p>
        <LandingHeroActions />
      </main>

      {/* Features */}
      <section className="border-t border-border px-6 py-16 grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto w-full">
        {[
          {
            icon: MapPin,
            title: 'Geo-restricted voting',
            body: 'Only voters physically at the venue can access the ballot.',
          },
          {
            icon: Zap,
            title: 'Live results',
            body: 'Counts update in real time — no refresh needed.',
          },
          {
            icon: Shield,
            title: 'One vote per device',
            body: 'Device fingerprinting prevents double voting automatically.',
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
