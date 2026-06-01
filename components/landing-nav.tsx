"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { CheckCircle2, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Features",     href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing",      href: "#pricing" },
]

export function LandingNav() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const { isSignedIn, isLoaded }      = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const transparent = !scrolled && !menuOpen
  const textCls     = "text-white/70 hover:text-white"
  const bgCls       = transparent
    ? "bg-transparent"
    : "bg-[oklch(0.10_0.022_255)]/90 backdrop-blur-md border-b border-white/[0.07]"

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        bgCls,
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <CheckCircle2 className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="font-bold text-[16px] tracking-tight text-white">
            Votely
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                textCls,
                transparent ? "hover:bg-white/10" : "hover:bg-slate-50",
              )}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {!isLoaded ? (
            <div className="h-9 w-28 rounded-lg bg-white/10 animate-pulse" />
          ) : isSignedIn ? (
            <Link href="/dashboard" className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/88 transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="h-9 px-4 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/8 transition-colors">
                Log in
              </Link>
              <Link href="/sign-up" className="h-9 px-5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/88 transition-colors">
                Start free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className={cn(
            "md:hidden p-2 rounded-lg transition-colors",
            transparent
              ? "text-white hover:bg-white/10"
              : "text-slate-700 hover:bg-slate-100",
          )}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-5 pt-3 pb-5 space-y-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="h-11 flex items-center justify-center rounded-xl bg-primary text-white text-sm font-semibold"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="h-11 flex items-center justify-center rounded-xl border border-slate-200 text-sm font-medium text-slate-700"
                >
                  Log in
                </Link>
                <Link
                  href="/sign-up"
                  className="h-11 flex items-center justify-center rounded-xl bg-primary text-white text-sm font-semibold"
                >
                  Start voting free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

/* ─── Hero CTA buttons (auth-aware) ───────────────────────────────────────── */
export function LandingHeroActions() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex gap-3 flex-wrap justify-center">
        <div className="h-12 w-48 rounded-xl bg-white/20 animate-pulse" />
        <div className="h-12 w-36 rounded-xl bg-white/10 animate-pulse" />
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="flex justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center h-12 px-8 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-white/90 transition-colors"
        >
          Go to Dashboard →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      <Link
        href="/sign-up"
        className="inline-flex items-center h-12 px-8 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-white/90 transition-colors"
      >
        Start Voting Free
      </Link>
      <a
        href="#how-it-works"
        className="inline-flex items-center h-12 px-6 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
      >
        See how it works
      </a>
    </div>
  )
}
