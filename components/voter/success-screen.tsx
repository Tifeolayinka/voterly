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
    <div className="min-h-screen flex flex-col items-center px-5 pt-16 pb-12">
      {/* Celebration mark */}
      <div className="flex flex-col items-center text-center gap-4 mb-10">
        <div className="relative">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full animate-ring-pulse" />
          {/* Outer ring */}
          <div className="size-24 rounded-full ring-1 ring-primary/20 flex items-center justify-center">
            {/* Inner circle */}
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 mt-2">
          <h1 className="text-3xl font-black tracking-tight">You voted!</h1>
          <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
            Your ballot for{" "}
            <span className="font-semibold text-foreground">{vote.title}</span>{" "}
            has been recorded.
          </p>
        </div>
      </div>

      {/* Live results */}
      {vote.showResultsToVoters && (
        <div className="w-full max-w-lg space-y-4">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Live results
            </p>
          </div>

          {liveResults === undefined ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            liveResults.map(({ position, candidates }) => {
              const total = candidates.reduce((sum, c) => sum + c.votes, 0)
              return (
                <div
                  key={position._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                >
                  <div className="px-4 pt-4 pb-3 border-b border-white/8">
                    <h3 className="font-bold text-sm">{position.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
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
                            <span className="flex items-center gap-2 font-medium">
                              {isTop && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                                  #1
                                </span>
                              )}
                              {!isTop && (
                                <span className="text-muted-foreground/60 tabular-nums">{i + 1}.</span>
                              )}
                              {c.name}
                            </span>
                            <span className="text-muted-foreground tabular-nums">
                              {pct}%
                            </span>
                          </div>
                          <div className="h-[3px] rounded-full bg-white/8 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${pct}%`,
                                background: isTop
                                  ? "oklch(0.48 0.26 293)"
                                  : "oklch(1 0 0 / 0.35)",
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
