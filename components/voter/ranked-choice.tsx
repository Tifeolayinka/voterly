"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BallotCandidate } from "./candidate-card"

interface SortableItemProps {
  candidate: BallotCandidate
  rank: number
}

function SortableItem({ candidate, rank }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: candidate._id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-white p-2.5 transition-all",
        isDragging
          ? "border-primary/40 bg-slate-50 scale-[1.02] shadow-md z-10"
          : "border-border shadow-[0_1px_2px_oklch(0_0_0_/_0.04)]"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-1 -ml-0.5 shrink-0"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${candidate.name}`}
      >
        <GripVertical className="size-5" />
      </button>

      {/* Rank badge */}
      <span aria-hidden="true" className="size-7 flex shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
        {rank}
      </span>

      {/* Photo or initial */}
      {candidate.photoUrls.length > 0 ? (
        <img
          src={candidate.photoUrls[0]}
          alt={candidate.name}
          className="size-12 rounded-lg object-cover object-top shrink-0"
        />
      ) : (
        <div className="size-12 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
          <span className="text-base font-bold text-primary/40 select-none">
            {candidate.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{candidate.name}</p>
        {candidate.bio && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{candidate.bio}</p>
        )}
      </div>
    </div>
  )
}

interface Props {
  candidates: BallotCandidate[]
  ranked: string[]
  onChange: (ids: string[]) => void
}

export function RankedChoice({ candidates, ranked, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const orderedIds =
    ranked.length === candidates.length ? ranked : candidates.map((c) => c._id)
  const orderedCandidates = orderedIds
    .map((id) => candidates.find((c) => c._id === id))
    .filter(Boolean) as BallotCandidate[]

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = orderedIds.indexOf(active.id as string)
    const newIndex = orderedIds.indexOf(over.id as string)
    onChange(arrayMove(orderedIds, oldIndex, newIndex))
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground px-0.5">
        Hold and drag to reorder
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {orderedCandidates.map((candidate, i) => (
              <SortableItem key={candidate._id} candidate={candidate} rank={i + 1} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
