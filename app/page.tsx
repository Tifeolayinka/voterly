import { MapPin, Zap, Shield, CheckCircle2 } from 'lucide-react'
import { LandingHeaderActions, LandingHeroActions } from '@/components/landing-nav'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-slate-900">Votely</span>
        </div>
        <LandingHeaderActions />
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-28 text-center">
        <div className="max-w-2xl mx-auto space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Live voting for in-person events
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            Voting that{' '}
            <span className="text-primary">belongs</span>
            <br />
            in the room.
          </h1>

          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            Create live ballots for churches, schools, and events. Geo-fence
            your vote so only people physically at the venue can participate.
          </p>

          <LandingHeroActions />
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-slate-100 bg-slate-50/60 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-12">
            Everything you need
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                color: 'bg-blue-50 text-blue-600',
                title: 'Geo-restricted voting',
                body: 'Only voters physically at the venue can access the ballot — enforced server-side.',
              },
              {
                icon: Zap,
                color: 'bg-amber-50 text-amber-600',
                title: 'Live results',
                body: 'Vote counts update in real time for everyone in the room. No refresh needed.',
              },
              {
                icon: Shield,
                color: 'bg-emerald-50 text-emerald-600',
                title: 'Tamper-proof',
                body: 'Device fingerprinting prevents double voting. One submission per device, automatically.',
              },
            ].map(({ icon: Icon, color, title, body }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4"
              >
                <div className={`inline-flex size-10 rounded-xl items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 px-6 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Votely. All rights reserved.
      </footer>
    </div>
  )
}
