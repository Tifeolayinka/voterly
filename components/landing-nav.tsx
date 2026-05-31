'use client'

import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function LandingHeaderActions() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />

  if (isSignedIn) {
    return (
      <Button render={<Link href="/dashboard" />} nativeButton={false}>
        Go to Dashboard
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" render={<Link href="/sign-in" />} nativeButton={false}>
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

  if (!isLoaded) return <div className="h-10 w-40 rounded-md bg-muted animate-pulse" />

  if (isSignedIn) {
    return (
      <Button size="lg" render={<Link href="/dashboard" />} nativeButton={false}>
        Go to Dashboard
      </Button>
    )
  }

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      <Button size="lg" render={<Link href="/sign-up" />} nativeButton={false}>
        Start for free
      </Button>
      <Button size="lg" variant="outline" render={<Link href="/sign-in" />} nativeButton={false}>
        Sign in
      </Button>
    </div>
  )
}
