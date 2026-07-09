"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CheckCircle2, Loader2 } from "lucide-react"
import type { Doc, Id } from "@/convex/_generated/dataModel"

interface Props {
  vote: Doc<"votes">
  submissionId: Id<"submissions"> | null
}

export function SuccessScreen({ vote, submissionId: _ }: Props) {
  const liveResults = useQuery(
    api.submissions.getLiveResults,
    vote.showResultsToVoters ? { voteId: vote._id } : "skip"
  )

  return (
    <div className="min-h-dvh flex flex-col items-center px-5 pt-14 pb-12">
      {/* Confirmation mark */}
      <div className="flex flex-col items-center text-center gap-4 mb-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full animate-ring-pulse" />
          <div className="size-24 rounded-full ring-1 ring-primary/20 flex items-center justify-center">
            <div className="size-20 rounded-full bg-primary/8 flex items-center justify-center">
              <CheckCircle2 aria-hidden="true" className="size-10 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 mt-1">
          <h1 className="text-3xl font-bold tracking-tight">Vote recorded</h1>
          <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
            Your ballot for{" "}
            <span className="font-medium text-foreground">{vote.title}</span> has
            been submitted.
          </p>
        </div>
      </div>

      {/* Live results */}
      {vote.showResultsToVoters && (
        <div className="w-full max-w-lg space-y-4">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-semibold text-muted-foreground">Live results</p>
          </div>

          {liveResults === undefined ? (
            <div role="status" className="flex justify-center py-10">
              <Loader2 aria-hidden="true" className="size-5 animate-spin text-muted-foreground" />
              <span className="sr-only">Loading live results…</span>
            </div>
          ) : (
            liveResults.map(({ position, candidates }) => {
              const total = candidates.reduce((sum, c) => sum + c.votes, 0)
              return (
                <div
                  key={position._id}
                  className="rounded-xl border border-border bg-white overflow-hidden"
                >
                  <div className="px-4 pt-3.5 pb-3 border-b border-border bg-slate-50/60">
                    <h3 className="font-semibold text-sm text-foreground">{position.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      {total} vote{total !== 1 ? "s" : ""} cast
                    </p>
                  </div>

                  <div className="px-4 py-3 space-y-3.5">
                    {candidates.map((c, i) => {
                      const pct = total > 0 ? Math.round((c.votes / total) * 100) : 0
                      const isTop = i === 0 && c.votes > 0
                      return (
                        <div key={c._id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 font-medium text-foreground">
                              {isTop ? (
                                <span className="text-[9px] font-bold uppercase tracking-wide text-primary">
                                  #1
                                </span>
                              ) : (
                                <span className="text-slate-400 tabular-nums w-4">{i + 1}.</span>
                              )}
                              {c.name}
                            </span>
                            <span className="text-muted-foreground tabular-nums">{pct}%</span>
                          </div>
                          <div className="h-[3px] rounded-full bg-slate-100 overflow-hidden">
                            <div
                              role="progressbar"
                              aria-valuenow={pct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${c.name}: ${pct}%`}
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${pct}%`,
                                background: isTop
                                  ? "oklch(0.49 0.21 255)"
                                  : "oklch(0 0 0 / 0.12)",
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
