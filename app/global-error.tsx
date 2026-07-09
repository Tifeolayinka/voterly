"use client"

import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5 bg-white font-sans antialiased">
        <div className="size-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="size-7 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">Something went wrong</h1>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            An unexpected error occurred. Refreshing the page usually fixes it.
          </p>
        </div>
        <button
          onClick={reset}
          className="h-10 px-5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
