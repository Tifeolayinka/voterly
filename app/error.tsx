"use client"

import { AlertTriangle } from "lucide-react"

export default function RootError({
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
        <h1 className="text-2xl font-black tracking-tight">Something went wrong</h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          An unexpected error occurred. Refreshing the page usually fixes it.
        </p>
      </div>
      <button
        onClick={reset}
        className="h-10 px-5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity"
      >
        Try again
      </button>
    </div>
  )
}
