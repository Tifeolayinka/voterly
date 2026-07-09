"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function PresentError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 text-center gap-5">
      <div className="size-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertTriangle className="size-7 text-red-400" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight text-white">Presentation error</h1>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          Something went wrong while loading the presentation. Try reloading or go back to the dashboard.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="h-10 px-5 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="h-10 px-5 rounded-lg bg-white text-gray-900 text-sm font-medium hover:opacity-90 transition-opacity flex items-center"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
