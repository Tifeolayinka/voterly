'use client'

import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function LandingHeaderActions() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return <div className="h-8 w-32 rounded-full bg-slate-100 animate-pulse" />

  if (isSignedIn) {
    return (
      <Button render={<Link href="/dashboard" />} nativeButton={false}>
        Dashboard →
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" render={<Link href="/sign-in" />} nativeButton={false} className="text-slate-600 hover:text-slate-900">
        Sign in
      </Button>
      <Button render={<Link href="/sign-up" />} nativeButton={false}>
        Get started
      </Button>
    </div>
  )
}

export function LandingHeroActions() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return <div className="h-12 w-44 rounded-xl bg-slate-100 animate-pulse mx-auto" />

  if (isSignedIn) {
    return (
      <Button size="lg" render={<Link href="/dashboard" />} nativeButton={false} className="rounded-xl h-12 px-8 text-base font-semibold shadow-sm">
        Go to Dashboard →
      </Button>
    )
  }

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      <Button
        size="lg"
        render={<Link href="/sign-up" />}
        nativeButton={false}
        className="rounded-xl h-12 px-8 text-base font-semibold shadow-sm"
      >
        Start for free
      </Button>
      <Button
        size="lg"
        variant="outline"
        render={<Link href="/sign-in" />}
        nativeButton={false}
        className="rounded-xl h-12 px-8 text-base font-semibold text-slate-700"
      >
        Sign in
      </Button>
    </div>
  )
}
