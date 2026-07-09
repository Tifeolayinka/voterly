"use client"

import { AlertTriangle } from "lucide-react"

export default function BallotError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5">
      <div className="size-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight">Unable to load ballot</h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Something went wrong while loading this vote. Check your connection and try again.
        </p>
      </div>
      <button
        onClick={reset}
        className="h-12 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  )
}
