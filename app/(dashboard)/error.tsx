"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-6 text-center gap-5">
      <div className="size-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-black tracking-tight">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          This page ran into a problem. Try again or go back to your votes.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity flex items-center"
        >
          My votes
        </Link>
      </div>
    </div>
  )
}
