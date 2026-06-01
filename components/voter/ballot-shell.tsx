"use client"

import { useState, useEffect, useRef } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ChevronLeft, ChevronRight, Check, Info, Loader2 } from "lucide-react"
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

interface Props {
  vote: Doc<"votes">
  positions: BallotPosition[]
  voterLat?: number
  voterLng?: number
  contact?: string // forwarded from InviteGate for invite-only votes
}

export function BallotShell({ vote, positions, voterLat, voterLng, contact }: Props) {
  const [state, setState] = useState<BallotState>("voting")
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selections, setSelections] = useState<Selections>(() =>
    buildInitialSelections(positions)
  )
  const [submissionId, setSubmissionId] = useState<Id<"submissions"> | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const ipRef = useRef<string>("unknown")

  useEffect(() => {
    import("@fingerprintjs/fingerprintjs")
      .then((FP) => FP.default.load())
      .then((fp) => fp.get())
      .then((result) => setFingerprint(result.visitorId))
      .catch(() => setFingerprint(crypto.randomUUID()))

    fetch("/api/ip")
      .then((r) => r.json())
      .then((d: { ip?: string }) => { if (d.ip) ipRef.current = d.ip })
      .catch(() => {})
  }, [])

  const submitBallot   = useMutation(api.submissions.submitBallot)
  const upsertPresence = useMutation(api.presence.upsertPresence)

  const hasVoted = useQuery(
    api.voter.checkHasVoted,
    fingerprint ? { voteId: vote._id, fingerprint } : "skip"
  )

  // As soon as the server confirms this fingerprint already voted, surface it
  useEffect(() => {
    if (hasVoted === true) setState("already_voted")
  }, [hasVoted])

  // Presence heartbeat — keeps the "X on ballot now" counter live
  useEffect(() => {
    let sid = sessionStorage.getItem("votely_session")
    if (!sid) {
      sid = crypto.randomUUID()
      sessionStorage.setItem("votely_session", sid)
    }
    const sessionId = sid
    void upsertPresence({ voteId: vote._id, sessionId })
    const id = setInterval(() => void upsertPresence({ voteId: vote._id, sessionId }), 20_000)
    return () => clearInterval(id)
  }, [vote._id, upsertPresence])

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
      const fp = fingerprint ?? crypto.randomUUID()
      const id = await submitBallot({
        voteId: vote._id,
        fingerprint: fp,
        ipAddress: ipRef.current,
        contact,
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
      // ConvexError.data carries the user-facing message; fall back to err.message
      const msg: string =
        typeof (err as { data?: unknown })?.data === "string"
          ? (err as { data: string }).data
          : err instanceof Error
            ? err.message
            : "Submission failed. Please try again."
      if (msg.toLowerCase().includes("already voted")) {
        setState("already_voted")
      } else {
        setErrorMsg(msg)
        setState("confirming")
      }
    }
  }

  // Block ballot render until we know for certain this device hasn't already voted
  if (fingerprint === null || hasVoted === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (state === "success") {
    return <SuccessScreen vote={vote} submissionId={submissionId} />
  }

  if (state === "already_voted") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-5">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Check className="size-7 text-primary" strokeWidth={2.5} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Already voted</h1>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Your vote has already been recorded for <span className="font-medium text-foreground">{vote.title}</span>.
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
    <div className="min-h-dvh flex flex-col">
      {/* ─── Sticky header ─── */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border px-4 pt-3 pb-3">
        <div className="max-w-lg mx-auto space-y-2.5">
          {/* Vote title */}
          <p className="text-xs font-semibold text-muted-foreground truncate">{vote.title}</p>

          {/* Progress segment bars */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {positions.map((pos, i) => (
                <button
                  key={pos._id}
                  type="button"
                  onClick={() => setCurrentIdx(i)}
                  aria-label={`Go to position ${i + 1}: ${pos.title}`}
                  className={cn(
                    "flex-1 h-[3px] rounded-full transition-all duration-300",
                    i < currentIdx
                      ? "bg-primary/50"
                      : i === currentIdx
                        ? "bg-primary"
                        : "bg-slate-200"
                  )}
                />
              ))}
            </div>
            <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
              {currentIdx + 1}/{positions.length}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Position content ─── */}
      <div className="flex-1 px-4 pt-7 pb-28">
        <div className="max-w-lg mx-auto space-y-5">
          {current && (
            <>
              {/* Position header */}
              <div className="space-y-2">
                <h2
                  className="text-2xl font-bold tracking-tight leading-tight"
                  style={{ textWrap: "balance" } as React.CSSProperties}
                >
                  {current.title}
                </h2>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground">
                  {current.votingType === "single" && "Choose one"}
                  {current.votingType === "multiple" &&
                    `Choose up to ${current.maxSelections ?? current.candidates.length}`}
                  {current.votingType === "ranked" && "Drag to rank all"}
                </span>
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
      <div
        className="fixed bottom-0 inset-x-0 bg-background/90 backdrop-blur-sm border-t border-border px-4"
        style={{ paddingTop: "12px", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-lg mx-auto space-y-2">
          <div className="flex items-center gap-3">
            {/* Back */}
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
              aria-label="Previous position"
              className={cn(
                "size-12 rounded-xl flex items-center justify-center border border-border bg-background transition-all",
                "disabled:opacity-30 disabled:pointer-events-none",
                "hover:bg-muted active:scale-[0.97]"
              )}
            >
              <ChevronLeft className="size-5 text-foreground" />
            </button>

            {/* Primary CTA */}
            {currentIdx < positions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => i + 1)}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/88 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-semibold text-white text-sm"
              >
                Next
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
                    ? "bg-primary hover:bg-primary/88 active:scale-[0.98] text-white"
                    : "bg-muted text-muted-foreground pointer-events-none"
                )}
              >
                {allComplete
                  ? "Review & submit"
                  : `${completedCount} of ${positions.length} complete`}
              </button>
            )}
          </div>

          {/* Fingerprinting disclaimer — shown only on the last step */}
          {currentIdx === positions.length - 1 && (
            <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground leading-relaxed">
              <Info className="size-3 shrink-0 mt-[1px]" />
              One vote per device is enforced via browser fingerprinting. Fingerprints
              may not prevent submissions from different devices or browsers.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
