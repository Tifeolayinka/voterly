import { cn } from "@/lib/utils"
import { CandidateCard, type BallotCandidate } from "./candidate-card"

interface Props {
  candidates: BallotCandidate[]
  selected: string[]
  maxSelections: number
  onChange: (ids: string[]) => void
}

export function MultipleChoice({ candidates, selected, maxSelections, onChange }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else if (selected.length < maxSelections) {
      onChange([...selected, id])
    }
  }

  const atMax = selected.length >= maxSelections

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border",
            selected.length > 0
              ? "bg-primary/8 border-primary/20 text-primary"
              : "bg-muted border-border text-muted-foreground"
          )}
        >
          <span className="tabular-nums">{selected.length} / {maxSelections}</span>
          <span>selected</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {candidates.map((candidate) => {
          const isSelected = selected.includes(candidate._id)
          return (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              selected={isSelected}
              disabled={atMax && !isSelected}
              onClick={() => toggle(candidate._id)}
            />
          )
        })}
      </div>
    </div>
  )
}

