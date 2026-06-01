"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id, Doc } from "@/convex/_generated/dataModel"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, BarChart3, QrCode, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type CandidateResult = Doc<"candidates"> & { votes: number }
type PositionResult = { position: Doc<"positions">; candidates: CandidateResult[] }

export default function PresentPage() {
  const { voteId } = useParams<{ voteId: string }>()
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  const [view, setView] = useState<"qr" | "results">("qr")
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [voteUrl, setVoteUrl] = useState<string | null>(null)

  const vote = useQuery(api.votes.getVoteById, { voteId: voteId as Id<"votes"> })
  const results = useQuery(
    api.submissions.getLiveResults,
    vote ? { voteId: vote._id } : "skip"
  ) as PositionResult[] | undefined

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in")
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!vote?.slug) return
    const url = `${window.location.origin}/vote/${vote.slug}`
    setVoteUrl(url)
    import("qrcode").then(({ toDataURL }) => {
      toDataURL(url, {
        width: 640,
        margin: 2,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      }).then(setQrDataUrl)
    })
  }, [vote?.slug])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "KeyR") {
        e.preventDefault()
        setView((v) => (v === "qr" ? "results" : "qr"))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (!isLoaded || vote === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (vote === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-base font-semibold text-foreground">Vote not found</p>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const isActive = vote.status === "active"

  return (
    <div className="min-h-screen bg-white flex flex-col select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <Link
          href={`/dashboard/votes/${vote._id}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Exit
        </Link>
        <div className="flex items-center gap-3">
          {isActive && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
          <button
            type="button"
            onClick={() => setView((v) => (v === "qr" ? "results" : "qr"))}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-background hover:bg-muted text-[12px] font-medium text-foreground transition-all"
          >
            {view === "qr" ? (
              <><BarChart3 className="size-3.5" /> Results</>
            ) : (
              <><QrCode className="size-3.5" /> QR Code</>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "flex-1 px-8 py-8",
        view === "qr"
          ? "flex flex-col items-center justify-center"
          : "overflow-y-auto"
      )}>
        {view === "qr" ? (
          <QrView
            vote={vote}
            qrDataUrl={qrDataUrl}
            voteUrl={voteUrl}
            isActive={isActive}
          />
        ) : (
          <ResultsView vote={vote} results={results} />
        )}
      </div>

      {/* Keyboard hint */}
      <p className="shrink-0 pb-4 text-center text-[11px] text-muted-foreground/40">
        Press Space to toggle view
      </p>
    </div>
  )
}

// ─── QR View ─────────────────────────────────────────────────────────────────

function QrView({
  vote,
  qrDataUrl,
  voteUrl,
  isActive,
}: {
  vote: Doc<"votes">
  qrDataUrl: string | null
  voteUrl: string | null
  isActive: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-7 max-w-lg w-full">
      <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-tight text-foreground text-center text-balance leading-snug">
        {vote.title}
      </h1>

      <div className="p-4 rounded-2xl border border-border shadow-sm bg-white">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Ballot QR code"
            className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
          />
        ) : (
          <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="text-center space-y-1">
        <p className="text-[clamp(2.5rem,8vw,5rem)] font-black tabular-nums text-foreground tracking-tight leading-none">
          {vote.submissionCount}
        </p>
        <p className="text-[clamp(0.875rem,2vw,1.125rem)] font-medium text-muted-foreground">
          {vote.submissionCount === 1 ? "ballot cast" : "ballots cast"}
        </p>
      </div>

      {voteUrl && (
        <div className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[clamp(0.75rem,1.5vw,0.9375rem)] font-mono text-slate-500 text-center select-all">
            {voteUrl}
          </p>
        </div>
      )}

      {!isActive && (
        <div className="px-4 py-2 rounded-lg bg-slate-100">
          <p className="text-sm font-medium text-slate-600">Voting is closed</p>
        </div>
      )}
    </div>
  )
}

// ─── Results View — all positions visible at once ─────────────────────────────

function ResultsView({
  vote,
  results,
}: {
  vote: Doc<"votes">
  results: PositionResult[] | undefined
}) {
  if (results === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading results…</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
        <BarChart3 className="size-10 text-muted-foreground/20" />
        <p className="text-lg font-semibold text-foreground">No positions yet</p>
      </div>
    )
  }

  const cols =
    results.length === 1 ? "grid-cols-1" :
    results.length <= 4 ? "grid-cols-1 lg:grid-cols-2" :
    "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-4">
      <h1 className="text-[clamp(1.1rem,2.5vw,1.75rem)] font-bold tracking-tight text-foreground text-balance">
        {vote.title}
      </h1>

      <div className={cn("grid gap-4", cols)}>
        {results.map((r) => (
          <div
            key={r.position._id}
            className="rounded-2xl border border-border bg-white p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {r.position.title}
              </p>
              <p className="text-[11px] text-muted-foreground/60 tabular-nums shrink-0">
                {r.candidates.reduce((s, c) => s + c.votes, 0)} votes
              </p>
            </div>
            <PresentResultBars result={r} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function PresentResultBars({ result }: { result: PositionResult }) {
  const sorted = [...result.candidates].sort((a, b) => b.votes - a.votes)
  const total = sorted.reduce((s, c) => s + c.votes, 0)
  const maxVotes = Math.max(...sorted.map((c) => c.votes), 1)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground/60">No votes yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sorted.map((c, i) => {
        const pct = Math.round((c.votes / total) * 100)
        const barPct = Math.round((c.votes / maxVotes) * 100)
        const isLeader = i === 0 && c.votes > 0
        return (
          <div key={c._id} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={cn(
                "shrink-0 text-[10px] font-bold tabular-nums w-5",
                isLeader ? "text-primary" : "text-slate-400"
              )}>
                {i + 1}
              </span>
              <span className={cn(
                "flex-1 text-sm font-semibold truncate",
                isLeader ? "text-foreground" : "text-slate-500"
              )}>
                {c.name}
              </span>
              <span className={cn(
                "shrink-0 text-sm font-black tabular-nums",
                isLeader ? "text-foreground" : "text-slate-400"
              )}>
                {c.votes}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground/60 tabular-nums w-9 text-right">
                {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden ml-7">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${barPct}%`,
                  background: isLeader
                    ? "oklch(0.49 0.21 255)"
                    : "oklch(0 0 0 / 0.12)",
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
