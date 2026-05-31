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

  return (
    <div className="space-y-4">
      {/* Selection counter pill */}
      <div className="flex items-center">
        <div
          className={
            selected.length > 0
              ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-[11px] font-semibold text-primary"
              : "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/6 border border-white/10 text-[11px] font-semibold text-muted-foreground"
          }
        >
          <span className="tabular-nums">
            {selected.length} / {maxSelections}
          </span>
          <span>selected</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {candidates.map((candidate) => {
          const isSelected = selected.includes(candidate._id)
          const atMax = selected.length >= maxSelections && !isSelected
          return (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              selected={isSelected}
              disabled={atMax}
              onClick={() => toggle(candidate._id)}
            />
          )
        })}
      </div>
    </div>
  )
}
