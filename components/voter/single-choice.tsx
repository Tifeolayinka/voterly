import { CandidateCard, type BallotCandidate } from "./candidate-card"

interface Props {
  candidates: BallotCandidate[]
  selected: string | null
  onChange: (id: string) => void
}

export function SingleChoice({ candidates, selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate._id}
          candidate={candidate}
          selected={selected === candidate._id}
          onClick={() => onChange(candidate._id)}
        />
      ))}
    </div>
  )
}
