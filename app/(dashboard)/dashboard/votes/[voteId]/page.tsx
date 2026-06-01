"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  ChevronLeft,
  Copy,
  Check,
  XCircle,
  RefreshCw,
  Trash2,
  QrCode,
  AlertTriangle,
  Loader2,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Id, Doc } from "@/convex/_generated/dataModel"

// ─── Types ───────────────────────────────────────────────────────────────────

type CandidateResult = Doc<"candidates"> & { votes: number }
type PositionResult = { position: Doc<"positions">; candidates: CandidateResult[] }

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ timestamps }: { timestamps: number[] }) {
  if (timestamps.length < 2) {
    return (
      <div className="h-14 flex items-center justify-center">
        <p className="text-[11px] text-muted-foreground">Not enough data yet</p>
      </div>
    )
  }

  const W = 400
  const H = 52
  const PAD = 5
  const t0 = timestamps[0]
  const tN = timestamps[timestamps.length - 1]
  const span = Math.max(tN - t0, 60_000)
  const N = 40
  const bucketMs = span / N
  const buckets = new Array(N + 1).fill(0)
  for (const ts of timestamps) {
    const i = Math.min(Math.floor((ts - t0) / bucketMs), N)
    buckets[i]++
  }
  const cum: number[] = []
  let running = 0
  for (const c of buckets) {
    running += c
    cum.push(running)
  }
  const maxVal = cum[cum.length - 1]
  if (!maxVal) return null

  const pts = cum.map((v, i) => {
    const x = (i / N) * W
    const y = H - PAD - (v / maxVal) * (H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p}`).join(" ")
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.49 0.21 255)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="oklch(0.49 0.21 255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spark-grad)" />
      <path
        d={linePath}
        fill="none"
        stroke="oklch(0.49 0.21 255)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Position result bars ────────────────────────────────────────────────────

function PositionResultBars({ result }: { result: PositionResult }) {
  const { candidates } = result
  const total = candidates.reduce((s, c) => s + c.votes, 0)
  const maxVotes = Math.max(...candidates.map((c) => c.votes), 1)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-2 text-center">
        <BarChart3 className="size-7 text-muted-foreground/25" />
        <p className="text-sm text-muted-foreground">No votes cast yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3.5">
      {candidates.map((c, i) => {
        const pct = total > 0 ? Math.round((c.votes / total) * 100) : 0
        const barPct = Math.round((c.votes / maxVotes) * 100)
        const isLeader = i === 0 && c.votes > 0
        return (
          <div key={c._id} className="space-y-1.5">
            <div className="flex items-center gap-3 text-[13px]">
              {isLeader ? (
                <span className="shrink-0 text-[10px] font-bold text-primary uppercase tracking-wide w-4">
                  #1
                </span>
              ) : (
                <span className="shrink-0 text-[11px] text-slate-400 w-4 tabular-nums">
                  {i + 1}
                </span>
              )}
              <span className={cn("font-medium flex-1 truncate", isLeader ? "text-foreground" : "text-slate-600")}>
                {c.name}
              </span>
              <span className="font-semibold tabular-nums text-foreground shrink-0">{c.votes}</span>
              <span className="text-muted-foreground tabular-nums text-[12px] shrink-0 w-8 text-right">
                {pct}%
              </span>
            </div>
            <div className="h-[5px] rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${barPct}%`,
                  background: isLeader ? "oklch(0.49 0.21 255)" : "oklch(0 0 0 / 0.14)",
                }}
              />
            </div>
          </div>
        )
      })}
      <p className="text-[11px] text-muted-foreground pt-1 tabular-nums">
        {total} vote{total !== 1 ? "s" : ""} cast for this position
      </p>
    </div>
  )
}

// ─── Stat cell ───────────────────────────────────────────────────────────────

function StatCell({
  value,
  label,
  accent = false,
  live = false,
  warn = false,
}: {
  value: number
  label: string
  accent?: boolean
  live?: boolean
  warn?: boolean
}) {
  return (
    <div className="px-5 py-4 flex items-center gap-3">
      {live && (
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-px self-start mt-[9px]" />
      )}
      <div>
        <p
          className={cn(
            "text-[22px] font-bold tabular-nums tracking-tight leading-none",
            accent ? "text-primary" : warn ? "text-amber-500" : "text-foreground"
          )}
        >
          {value}
        </p>
        <p className="text-[11px] font-medium text-muted-foreground mt-1.5 uppercase tracking-wide">
          {label}
        </p>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  draft:  { label: "Draft",  dot: "bg-slate-400",  chip: "bg-slate-100 text-slate-600" },
  active: { label: "Active", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
  closed: { label: "Closed", dot: "bg-slate-300",  chip: "bg-slate-100 text-slate-500" },
} as const

type PendingAction = "close" | "reopen" | "delete"

export default function VoteDetailPage() {
  const { voteId } = useParams<{ voteId: string }>()
  const router = useRouter()

  const vote        = useQuery(api.votes.getVoteById, { voteId: voteId as Id<"votes"> })
  const results     = useQuery(
    api.submissions.getLiveResults,
    vote ? { voteId: vote._id } : "skip"
  ) as PositionResult[] | undefined
  const activeCount = useQuery(
    api.presence.getActiveCount,
    vote ? { voteId: vote._id } : "skip"
  )
  const flagged     = useQuery(
    api.analytics.getFlaggedActivity,
    vote ? { voteId: vote._id } : "skip"
  )
  const timestamps  = useQuery(
    api.analytics.getSubmissionTimestamps,
    vote ? { voteId: vote._id } : "skip"
  )

  const closeVote  = useMutation(api.votes.closeVote)
  const reopenVote = useMutation(api.votes.reopenVote)
  const deleteVote = useMutation(api.votes.deleteVote)

  const [selectedTab,   setSelectedTab]   = useState(0)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isActing,      setIsActing]      = useState(false)
  const [copied,        setCopied]        = useState(false)

  async function handleCopyLink() {
    if (!vote?.slug) return
    await navigator.clipboard.writeText(`${window.location.origin}/vote/${vote.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownloadQr() {
    if (!vote?.slug) return
    const { toDataURL } = await import("qrcode")
    const url = `${window.location.origin}/vote/${vote.slug}`
    const dataUrl = await toDataURL(url, { width: 512, margin: 2 })
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `votely-${vote.slug}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  async function handleConfirm() {
    if (!vote || !pendingAction) return
    setIsActing(true)
    try {
      if (pendingAction === "close")  await closeVote({ voteId: vote._id })
      if (pendingAction === "reopen") await reopenVote({ voteId: vote._id })
      if (pendingAction === "delete") {
        await deleteVote({ voteId: vote._id })
        router.push("/dashboard")
        return
      }
      setPendingAction(null)
    } finally {
      setIsActing(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (vote === undefined) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (vote === null) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-[50vh] text-center">
        <p className="text-[15px] font-semibold text-foreground">Vote not found</p>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          ← Back to My Votes
        </Link>
      </div>
    )
  }

  const cfg            = STATUS_CONFIG[vote.status]
  const isActive       = vote.status === "active"
  const isDraft        = vote.status === "draft"
  const selectedResult = results?.[selectedTab]

  return (
    <div className="p-6 md:p-8 space-y-6">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-3.5" />
          My Votes
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[220px]">{vote.title}</span>
      </div>

      {/* ── Title + quick actions ── */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold tracking-tight text-foreground leading-snug">
              {vote.title}
            </h1>
            {vote.description && (
              <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                {vote.description}
              </p>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full mt-0.5",
              cfg.chip
            )}
          >
            <span className={cn("size-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
          </span>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {vote.slug && (
            <>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-background hover:bg-muted text-[12.5px] font-medium text-foreground transition-all"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied!" : "Copy link"}
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-background hover:bg-muted text-[12.5px] font-medium text-foreground transition-all"
              >
                <QrCode className="size-3.5" />
                QR code
              </button>
            </>
          )}

          {!isDraft && (
            isActive ? (
              <button
                type="button"
                onClick={() => setPendingAction("close")}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-background hover:bg-muted text-[12.5px] font-medium text-foreground transition-all"
              >
                <XCircle className="size-3.5" />
                Close early
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPendingAction("reopen")}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-background hover:bg-muted text-[12.5px] font-medium text-foreground transition-all"
              >
                <RefreshCw className="size-3.5" />
                Reopen
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setPendingAction("delete")}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-[12.5px] font-medium text-red-600 transition-all"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <StatCell
            value={vote.submissionCount}
            label="Ballots cast"
            accent={vote.submissionCount > 0}
          />
          <StatCell
            value={activeCount ?? 0}
            label="On ballot now"
            live={isActive && (activeCount ?? 0) > 0}
          />
          <StatCell
            value={flagged?.length ?? 0}
            label="Flagged events"
            warn={(flagged?.length ?? 0) > 0}
          />
          <StatCell
            value={results?.length ?? 0}
            label="Positions"
          />
        </div>
      </div>

      {/* ── Sparkline ── */}
      {!isDraft && (timestamps?.length ?? 0) >= 2 && (
        <div className="border border-border rounded-xl px-4 pt-4 pb-3 bg-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12.5px] font-semibold text-foreground">
              Submissions over time
            </p>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {vote.submissionCount} total
            </span>
          </div>
          <Sparkline timestamps={timestamps!} />
        </div>
      )}

      {/* ── Results panel ── */}
      {!isDraft ? (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          {/* Panel header */}
          <div className="px-4 pt-4 pb-3 border-b border-border flex items-center gap-2">
            <p className="text-[13px] font-semibold text-foreground flex-1">Results</p>
            {isActive && (
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-emerald-600 font-semibold">Live</span>
              </div>
            )}
          </div>

          {results === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2 text-center px-4">
              <BarChart3 className="size-8 text-muted-foreground/25" />
              <p className="text-sm text-muted-foreground">No positions found for this vote.</p>
            </div>
          ) : (
            <>
              {/* Position tabs — only when there are multiple positions */}
              {results.length > 1 && (
                <div className="flex overflow-x-auto border-b border-border">
                  {results.map((r, i) => (
                    <button
                      key={r.position._id}
                      type="button"
                      onClick={() => setSelectedTab(i)}
                      className={cn(
                        "px-4 py-2.5 text-[12.5px] font-medium whitespace-nowrap shrink-0 border-b-2 -mb-px transition-colors",
                        i === selectedTab
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {r.position.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Candidate bars */}
              <div className="p-4">
                {results.length === 1 && (
                  <p className="text-[11px] font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    {results[0].position.title}
                  </p>
                )}
                {selectedResult && <PositionResultBars result={selectedResult} />}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Draft placeholder */
        <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 text-center bg-card">
          <BarChart3 className="size-10 text-muted-foreground/25" />
          <p className="text-[15px] font-semibold text-foreground">Not published yet</p>
          <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed">
            Results appear here once you publish the vote and voters start submitting ballots.
          </p>
          <Link
            href="/dashboard/create"
            className="mt-1 h-9 px-4 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-all inline-flex items-center"
          >
            Continue setup
          </Link>
        </div>
      )}

      {/* ── Flagged activity ── */}
      {(flagged?.length ?? 0) > 0 && (
        <div className="border border-amber-200 rounded-xl bg-amber-50/40 overflow-hidden">
          <div className="px-4 pt-3.5 pb-3 border-b border-amber-200 flex items-center gap-2">
            <AlertTriangle className="size-3.5 text-amber-500" />
            <p className="text-[12.5px] font-semibold text-amber-700">Flagged Activity</p>
          </div>
          <div className="divide-y divide-amber-100">
            {flagged!.map((row) => (
              <div
                key={row._id}
                className="px-4 py-2.5 flex items-center gap-3 text-[12px] flex-wrap"
              >
                <span
                  className={cn(
                    "shrink-0 px-1.5 py-0.5 rounded text-[10.5px] font-semibold uppercase tracking-wide",
                    row.type === "velocity_spike"
                      ? "bg-red-100 text-red-600"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {row.type === "velocity_spike" ? "Velocity" : "IP"}
                </span>
                {row.ipAddress && (
                  <span className="text-slate-500 font-mono">{row.ipAddress}</span>
                )}
                {row.count != null && (
                  <span className="text-slate-500">{row.count} submissions</span>
                )}
                {row.windowSeconds != null && (
                  <span className="text-slate-500">in {row.windowSeconds}s</span>
                )}
                <span className="ml-auto text-muted-foreground tabular-nums shrink-0">
                  {new Date(row._creationTime).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Confirm modal ── */}
      {pendingAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingAction(null)
          }}
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h2 className="text-[17px] font-bold text-foreground">
              {pendingAction === "close"  && "Close this vote?"}
              {pendingAction === "reopen" && "Reopen this vote?"}
              {pendingAction === "delete" && "Delete this vote?"}
            </h2>
            <p className="text-[13.5px] text-muted-foreground leading-relaxed">
              {pendingAction === "close"  && "Voters will no longer be able to submit ballots. You can reopen it later."}
              {pendingAction === "reopen" && "This will allow voters to submit new ballots again."}
              {pendingAction === "delete" && `Permanently delete "${vote.title}" and all ${vote.submissionCount} ballot${vote.submissionCount !== 1 ? "s" : ""}. This cannot be undone.`}
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={isActing}
                className="flex-1 h-10 rounded-xl border border-border bg-background hover:bg-muted text-[13px] font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isActing}
                className={cn(
                  "flex-1 h-10 rounded-xl text-[13px] font-semibold text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-60",
                  pendingAction === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {isActing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    {pendingAction === "close"  && "Close vote"}
                    {pendingAction === "reopen" && "Reopen vote"}
                    {pendingAction === "delete" && "Delete forever"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
