import { Button } from "@/components/ui/button"
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-white/8 px-4 py-3.5">
        <div className="max-w-lg mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {vote.title}
          </p>
          <p className="text-sm font-bold mt-0.5">Review your ballot</p>
        </div>
      </div>

      {/* Scroll area */}
      <div className="flex-1 px-4 py-7 pb-28 max-w-lg mx-auto w-full space-y-5">
        {errorMsg && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {positions.map((position) => {
          const sel = selections[position._id] ?? []
          const candidateMap = Object.fromEntries(position.candidates.map((c) => [c._id, c]))

          return (
            <div
              key={position._id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
            >
              {/* Position header */}
              <div className="px-4 pt-4 pb-3 border-b border-white/8">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">
                  {position.votingType === "ranked"
                    ? "Ranked"
                    : position.votingType === "multiple"
                      ? "Multiple choice"
                      : "Single choice"}
                </span>
                <h3 className="font-bold text-sm mt-0.5">{position.title}</h3>
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
                        <span className="size-6 flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-black">
                          {idx + 1}
                        </span>
                      )}
                      {photo ? (
                        <img
                          src={photo}
                          alt={c.name}
                          className="size-10 rounded-xl object-cover object-top shrink-0"
                        />
                      ) : (
                        <div className="size-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-black text-primary/60">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-semibold flex-1 truncate">{c.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Disclaimer */}
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-4">
          Once submitted, your ballot cannot be changed.
        </p>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-white/8 px-4 py-3">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="size-12 rounded-xl flex items-center justify-center border border-white/12 bg-white/6 transition-all disabled:opacity-30 hover:bg-white/10 active:scale-95"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-semibold text-primary-foreground text-sm disabled:opacity-60 disabled:pointer-events-none shadow-[0_0_20px_oklch(0.48_0.26_293_/_0.35)]"
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
