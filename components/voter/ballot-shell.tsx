"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { SingleChoice } from "./single-choice"
import { MultipleChoice } from "./multiple-choice"
import { RankedChoice } from "./ranked-choice"
import { ConfirmationStep } from "./confirmation-step"
import { SuccessScreen } from "./success-screen"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import type { BallotCandidate } from "./candidate-card"

export type BallotPosition = {
  _id: Id<"positions">
  voteId: Id<"votes">
  title: string
  votingType: "single" | "multiple" | "ranked"
  maxSelections?: number
  order: number
  candidates: BallotCandidate[]
}

type Selections = Record<string, string[]>
type BallotState = "voting" | "confirming" | "submitting" | "success" | "already_voted"

function buildInitialSelections(positions: BallotPosition[]): Selections {
  const init: Selections = {}
  for (const pos of positions) {
    if (pos.votingType === "ranked") {
      init[pos._id] = pos.candidates.map((c) => c._id)
    }
  }
  return init
}

function isComplete(position: BallotPosition, selections: Selections): boolean {
  const sel = selections[position._id] ?? []
  if (position.votingType === "single") return sel.length === 1
  if (position.votingType === "multiple") return sel.length >= 1
  if (position.votingType === "ranked") return sel.length === position.candidates.length
  return false
}

function getFingerprint(): string {
  const key = "votely_fp"
  let fp = sessionStorage.getItem(key)
  if (!fp) {
    fp = crypto.randomUUID()
    sessionStorage.setItem(key, fp)
  }
  return fp
}

const TYPE_LABEL: Record<string, string> = {
  single: "Choose one",
  multiple: "Choose up to",
  ranked: "Rank all",
}

interface Props {
  vote: Doc<"votes">
  positions: BallotPosition[]
  voterLat?: number
  voterLng?: number
}

export function BallotShell({ vote, positions, voterLat, voterLng }: Props) {
  const [state, setState] = useState<BallotState>("voting")
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selections, setSelections] = useState<Selections>(() =>
    buildInitialSelections(positions)
  )
  const [submissionId, setSubmissionId] = useState<Id<"submissions"> | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  const submitBallot = useMutation(api.submissions.submitBallot)

  const current = positions[currentIdx]
  const completedCount = positions.filter((p) => isComplete(p, selections)).length
  const allComplete = completedCount === positions.length

  function setSelection(positionId: string, ids: string[]) {
    setSelections((prev) => ({ ...prev, [positionId]: ids }))
  }

  async function handleSubmit() {
    setState("submitting")
    setErrorMsg("")
    try {
      const id = await submitBallot({
        voteId: vote._id,
        fingerprint: getFingerprint(),
        ipAddress: "unknown",
        voterLat,
        voterLng,
        choices: Object.entries(selections).map(([positionId, candidateIds]) => ({
          positionId: positionId as Id<"positions">,
          candidateIds: candidateIds as Id<"candidates">[],
        })),
      })
      setSubmissionId(id)
      setState("success")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again."
      if (msg.toLowerCase().includes("already voted")) {
        setState("already_voted")
      } else {
        setErrorMsg(msg)
        setState("confirming")
      }
    }
  }

  if (state === "success") {
    return <SuccessScreen vote={vote} submissionId={submissionId} />
  }

  if (state === "already_voted") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Check className="size-7 text-primary" strokeWidth={2.5} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">Already voted</h1>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Your vote has already been recorded for this election.
          </p>
        </div>
      </div>
    )
  }

  if (state === "confirming" || state === "submitting") {
    return (
      <ConfirmationStep
        vote={vote}
        positions={positions}
        selections={selections}
        errorMsg={errorMsg}
        isSubmitting={state === "submitting"}
        onBack={() => setState("voting")}
        onConfirm={handleSubmit}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Sticky header ─── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-white/8 px-4 pt-3 pb-3">
        <div className="max-w-lg mx-auto space-y-2.5">
          {/* Vote title */}
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
            {vote.title}
          </p>

          {/* Story-style segment bars */}
          <div className="flex items-center gap-1.5">
            <div className="flex flex-1 gap-1">
              {positions.map((pos, i) => (
                <button
                  key={pos._id}
                  type="button"
                  onClick={() => setCurrentIdx(i)}
                  className={cn(
                    "flex-1 h-[3px] rounded-full transition-all duration-300",
                    i < currentIdx
                      ? "bg-white"
                      : i === currentIdx
                        ? "bg-primary"
                        : "bg-white/20"
                  )}
                />
              ))}
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-muted-foreground tabular-nums ml-1">
              {currentIdx + 1}/{positions.length}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Position content ─── */}
      <div className="flex-1 px-4 pt-7 pb-28">
        <div className="max-w-lg mx-auto space-y-6">
          {current && (
            <>
              {/* Position header */}
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight leading-tight">
                  {current.title}
                </h2>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-white/10">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {current.votingType === "single" && "Single choice"}
                    {current.votingType === "multiple" &&
                      `Choose up to ${current.maxSelections ?? current.candidates.length}`}
                    {current.votingType === "ranked" && "Drag to rank all"}
                  </span>
                </div>
              </div>

              {current.votingType === "single" && (
                <SingleChoice
                  candidates={current.candidates}
                  selected={selections[current._id]?.[0] ?? null}
                  onChange={(id) => setSelection(current._id, [id])}
                />
              )}

              {current.votingType === "multiple" && (
                <MultipleChoice
                  candidates={current.candidates}
                  selected={selections[current._id] ?? []}
                  maxSelections={current.maxSelections ?? current.candidates.length}
                  onChange={(ids) => setSelection(current._id, ids)}
                />
              )}

              {current.votingType === "ranked" && (
                <RankedChoice
                  candidates={current.candidates}
                  ranked={selections[current._id] ?? []}
                  onChange={(ids) => setSelection(current._id, ids)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── Sticky footer nav ─── */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-white/8 px-4 py-3 safe-area-pb">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* Back */}
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
            className={cn(
              "size-12 rounded-xl flex items-center justify-center border border-white/12 bg-white/6 transition-all",
              "disabled:opacity-30 disabled:pointer-events-none",
              "hover:bg-white/10 active:scale-95"
            )}
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Primary CTA */}
          {currentIdx < positions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-semibold text-primary-foreground text-sm"
            >
              Next position
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!allComplete}
              onClick={() => setState("confirming")}
              className={cn(
                "flex-1 h-12 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold text-sm",
                allComplete
                  ? "bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground shadow-[0_0_20px_oklch(0.48_0.26_293_/_0.4)]"
                  : "bg-white/8 text-muted-foreground pointer-events-none"
              )}
            >
              {allComplete ? "Review & submit" : `${completedCount}/${positions.length} complete`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
