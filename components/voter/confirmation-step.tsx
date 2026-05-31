"use client"

import { ChevronLeft, Loader2, AlertCircle } from "lucide-react"
import type { Doc } from "@/convex/_generated/dataModel"
import type { BallotPosition } from "./ballot-shell"

interface Props {
  vote: Doc<"votes">
  positions: BallotPosition[]
  selections: Record<string, string[]>
  errorMsg: string
  isSubmitting: boolean
  onBack: () => void
  onConfirm: () => void
}

export function ConfirmationStep({
  vote,
  positions,
  selections,
  errorMsg,
  isSubmitting,
  onBack,
  onConfirm,
}: Props) {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3.5">
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-muted-foreground">{vote.title}</p>
          <p className="text-sm font-semibold mt-0.5 text-foreground">Review your ballot</p>
        </div>
      </div>

      {/* Scroll area */}
      <div className="flex-1 px-4 py-6 pb-28 max-w-lg mx-auto w-full space-y-4">
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="size-4 mt-0.5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {positions.map((position) => {
          const sel = selections[position._id] ?? []
          const candidateMap = Object.fromEntries(position.candidates.map((c) => [c._id, c]))
          const typeLabel =
            position.votingType === "ranked"
              ? "Ranked choice"
              : position.votingType === "multiple"
                ? "Multiple choice"
                : "Single choice"

          return (
            <div
              key={position._id}
              className="rounded-xl border border-border bg-white overflow-hidden"
            >
              {/* Position header */}
              <div className="px-4 pt-3.5 pb-3 border-b border-border bg-slate-50/60">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {typeLabel}
                </p>
                <h3 className="font-semibold text-sm mt-0.5 text-foreground">{position.title}</h3>
              </div>

              {/* Selections */}
              <div className="px-4 py-3 space-y-2.5">
                {sel.map((id, idx) => {
                  const c = candidateMap[id]
                  if (!c) return null
                  const photo = c.photoUrls[0]
                  return (
                    <div key={id} className="flex items-center gap-3">
                      {position.votingType === "ranked" && (
                        <span className="size-6 flex shrink-0 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">
                          {idx + 1}
                        </span>
                      )}
                      {photo ? (
                        <img
                          src={photo}
                          alt={c.name}
                          className="size-10 rounded-lg object-cover object-top shrink-0"
                        />
                      ) : (
                        <div className="size-10 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary/40 select-none">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium flex-1 truncate text-foreground">
                        {c.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <p className="text-xs text-muted-foreground text-center leading-relaxed px-4">
          Once submitted, your ballot cannot be changed.
        </p>
      </div>

      {/* Footer */}
      <div
        className="fixed bottom-0 inset-x-0 bg-background/90 backdrop-blur-sm border-t border-border px-4"
        style={{ paddingTop: "12px", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            aria-label="Go back to ballot"
            className="size-12 rounded-xl flex items-center justify-center border border-border bg-background transition-all disabled:opacity-30 hover:bg-muted active:scale-[0.97]"
          >
            <ChevronLeft className="size-5 text-foreground" />
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/88 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-semibold text-white text-sm disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Confirm & submit"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
