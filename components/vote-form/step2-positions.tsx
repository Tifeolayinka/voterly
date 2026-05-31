"use client"

import { useRef, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Check,
  GripVertical,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

type PositionWithCandidates = Doc<"positions"> & { candidates: Doc<"candidates">[] }
type VotingType = "single" | "multiple" | "ranked"

interface PositionForm {
  title: string
  votingType: VotingType
  maxSelections: string
}

interface CandidateForm {
  name: string
  bio: string
  photoStorageIds: string[]
  photoPreviews: string[]
}

const DEFAULT_POSITION_FORM: PositionForm = {
  title: "",
  votingType: "single",
  maxSelections: "2",
}
const DEFAULT_CANDIDATE_FORM: CandidateForm = {
  name: "",
  bio: "",
  photoStorageIds: [],
  photoPreviews: [],
}

const VOTING_TYPE_LABELS: Record<VotingType, string> = {
  single: "Single Choice",
  multiple: "Multiple Choice",
  ranked: "Ranked Choice",
}

// ---------- SortableCandidateRow ----------

interface SortableCandidateRowProps {
  candidate: Doc<"candidates">
  isEditing: boolean
  editForm: CandidateForm
  uploadingPhoto: boolean
  onEditFormChange: (f: CandidateForm) => void
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
  onPhotoUpload: (file: File) => void
  onRemovePhoto: (idx: number) => void
}

function SortableCandidateRow({
  candidate,
  isEditing,
  editForm,
  uploadingPhoto,
  onEditFormChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onPhotoUpload,
  onRemovePhoto,
}: SortableCandidateRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: candidate._id })
  const photoRef = useRef<HTMLInputElement>(null)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 py-1">
      <button
        type="button"
        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {isEditing ? (
        <div className="flex-1 space-y-2">
          {/* Photo strip */}
          <div className="flex items-center gap-2 flex-wrap">
            {editForm.photoPreviews.map((preview, i) => (
              <div key={i} className="relative shrink-0">
                <img src={preview} alt="" className="h-10 w-10 rounded-lg object-cover object-top" />
                <button
                  type="button"
                  onClick={() => onRemovePhoto(i)}
                  className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-white flex items-center justify-center text-[10px] leading-none"
                >
                  ×
                </button>
              </div>
            ))}
            {/* Show existing photo count for saved photos (no preview available) */}
            {editForm.photoStorageIds.length > editForm.photoPreviews.length && (
              <span className="text-xs text-muted-foreground">
                +{editForm.photoStorageIds.length - editForm.photoPreviews.length} saved
              </span>
            )}
            {editForm.photoStorageIds.length < 5 && (
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="h-10 w-10 shrink-0 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors relative"
              >
                {uploadingPhoto ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onPhotoUpload(f)
                e.target.value = ""
              }}
            />
          </div>
          <Input
            placeholder="Name *"
            value={editForm.name}
            onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
            autoFocus
          />
          <Input
            placeholder="Bio (optional)"
            value={editForm.bio}
            onChange={(e) => onEditFormChange({ ...editForm, bio: e.target.value })}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSaveEdit} disabled={uploadingPhoto}>
              <Check className="h-3 w-3" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="h-7 w-7 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center mt-0.5">
            {candidate.photoUrl ? (
              <img src={candidate.photoUrl} alt="" className="w-full h-full object-cover object-top" />
            ) : (
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{candidate.name}</p>
            {candidate.bio && (
              <p className="text-xs text-muted-foreground truncate">{candidate.bio}</p>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={onStartEdit}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1 rounded hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ---------- PositionCard ----------

interface PositionCardProps {
  position: PositionWithCandidates
  dragListeners: ReturnType<typeof useSortable>["listeners"]
  dragAttributes: ReturnType<typeof useSortable>["attributes"]
  onDelete: () => void
}

function PositionCard({
  position,
  dragListeners,
  dragAttributes,
  onDelete,
}: PositionCardProps) {
  const [isEditingPosition, setIsEditingPosition] = useState(false)
  const [positionForm, setPositionForm] = useState<PositionForm>({
    title: position.title,
    votingType: position.votingType,
    maxSelections: String(position.maxSelections ?? 2),
  })
  const [positionFormErr, setPositionFormErr] = useState("")

  const [addingCandidate, setAddingCandidate] = useState(false)
  const [candidateForm, setCandidateForm] = useState<CandidateForm>(DEFAULT_CANDIDATE_FORM)
  const [candidateFormErr, setCandidateFormErr] = useState("")
  const [candidateSubmitting, setCandidateSubmitting] = useState(false)

  const [editingCandidateId, setEditingCandidateId] = useState<Id<"candidates"> | null>(null)
  const [editCandidateForm, setEditCandidateForm] = useState<CandidateForm>(DEFAULT_CANDIDATE_FORM)

  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  const candidateSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const newCandidatePhotoRef = useRef<HTMLInputElement>(null)

  const updatePosition = useMutation(api.positions.updatePosition)
  const addCandidate = useMutation(api.candidates.addCandidate)
  const updateCandidate = useMutation(api.candidates.updateCandidate)
  const deleteCandidate = useMutation(api.candidates.deleteCandidate)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  async function handleCandidateDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = position.candidates.map((c) => c._id)
    const oldIdx = ids.indexOf(active.id as Id<"candidates">)
    const newIdx = ids.indexOf(over.id as Id<"candidates">)
    if (oldIdx === -1 || newIdx === -1) return
    const reordered = arrayMove([...position.candidates], oldIdx, newIdx)
    await Promise.all(
      reordered.map((c, i) => {
        if (c.order !== i) return updateCandidate({ candidateId: c._id, order: i })
        return Promise.resolve()
      })
    )
  }

  async function handleSavePositionEdit() {
    if (!positionForm.title.trim()) {
      setPositionFormErr("Title is required.")
      return
    }
    setPositionFormErr("")
    try {
      await updatePosition({
        positionId: position._id,
        title: positionForm.title.trim(),
        votingType: positionForm.votingType,
        maxSelections:
          positionForm.votingType === "multiple"
            ? parseInt(positionForm.maxSelections) || 2
            : undefined,
      })
      setIsEditingPosition(false)
    } catch {
      setPositionFormErr("Failed to save.")
    }
  }

  async function handlePhotoUpload(file: File, target: string) {
    setUploadingFor(target)
    try {
      const uploadUrl = await generateUploadUrl()
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!res.ok) throw new Error()
      const { storageId } = await res.json()
      const preview = URL.createObjectURL(file)
      if (target === "new") {
        setCandidateForm((f) => ({
          ...f,
          photoStorageIds: [...f.photoStorageIds, storageId],
          photoPreviews: [...f.photoPreviews, preview],
        }))
      } else {
        setEditCandidateForm((f) => ({
          ...f,
          photoStorageIds: [...f.photoStorageIds, storageId],
          photoPreviews: [...f.photoPreviews, preview],
        }))
      }
    } catch {
      /* silent */
    } finally {
      setUploadingFor(null)
    }
  }

  async function handleAddCandidate() {
    if (!candidateForm.name.trim()) {
      setCandidateFormErr("Name is required.")
      return
    }
    setCandidateFormErr("")
    setCandidateSubmitting(true)
    try {
      await addCandidate({
        positionId: position._id,
        name: candidateForm.name.trim(),
        bio: candidateForm.bio.trim() || undefined,
        photoUrl: candidateForm.photoStorageIds[0] ?? undefined,
        photoUrls: candidateForm.photoStorageIds.length > 0
          ? candidateForm.photoStorageIds
          : undefined,
        order: position.candidates.length,
      })
      setCandidateForm(DEFAULT_CANDIDATE_FORM)
      setAddingCandidate(false)
    } catch {
      setCandidateFormErr("Failed to add candidate.")
    } finally {
      setCandidateSubmitting(false)
    }
  }

  async function handleSaveCandidateEdit() {
    if (!editingCandidateId || !editCandidateForm.name.trim()) return
    try {
      const allIds = editCandidateForm.photoStorageIds
      await updateCandidate({
        candidateId: editingCandidateId,
        name: editCandidateForm.name.trim(),
        bio: editCandidateForm.bio.trim() || undefined,
        photoUrl: allIds[0] ?? undefined,
        photoUrls: allIds.length > 0 ? allIds : undefined,
      })
      setEditingCandidateId(null)
    } catch {
      /* silent */
    }
  }

  const shortfall = 2 - position.candidates.length

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Position header */}
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            {...dragListeners}
            {...dragAttributes}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {isEditingPosition ? (
            <div className="flex-1 space-y-3">
              <Input
                value={positionForm.title}
                onChange={(e) =>
                  setPositionForm((f) => ({ ...f, title: e.target.value }))
                }
                autoFocus
              />
              <select
                value={positionForm.votingType}
                onChange={(e) =>
                  setPositionForm((f) => ({
                    ...f,
                    votingType: e.target.value as VotingType,
                  }))
                }
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
                <option value="ranked">Ranked Choice</option>
              </select>
              {positionForm.votingType === "multiple" && (
                <div className="space-y-1">
                  <Label className="text-xs">Max Selections</Label>
                  <Input
                    type="number"
                    min={2}
                    value={positionForm.maxSelections}
                    onChange={(e) =>
                      setPositionForm((f) => ({ ...f, maxSelections: e.target.value }))
                    }
                  />
                </div>
              )}
              {positionFormErr && (
                <p className="text-xs text-destructive">{positionFormErr}</p>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSavePositionEdit}>
                  <Check className="h-3 w-3" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingPosition(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{position.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {VOTING_TYPE_LABELS[position.votingType]}
                  {position.votingType === "multiple" && position.maxSelections
                    ? ` · max ${position.maxSelections}`
                    : ""}
                  {" · "}
                  {position.candidates.length} candidate
                  {position.candidates.length !== 1 ? "s" : ""}
                  {shortfall > 0 && (
                    <span className="text-destructive">
                      {" "}
                      (need {shortfall} more)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPositionForm({
                      title: position.title,
                      votingType: position.votingType,
                      maxSelections: String(position.maxSelections ?? 2),
                    })
                    setIsEditingPosition(true)
                  }}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors group"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Candidates */}
        {!isEditingPosition && (
          <div className="pl-7 space-y-1">
            <DndContext
              sensors={candidateSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleCandidateDragEnd}
            >
              <SortableContext
                items={position.candidates.map((c) => c._id)}
                strategy={verticalListSortingStrategy}
              >
                {position.candidates.map((candidate) => (
                  <SortableCandidateRow
                    key={candidate._id}
                    candidate={candidate}
                    isEditing={editingCandidateId === candidate._id}
                    editForm={editCandidateForm}
                    uploadingPhoto={uploadingFor === candidate._id}
                    onEditFormChange={setEditCandidateForm}
                    onRemovePhoto={(idx) =>
                      setEditCandidateForm((f) => ({
                        ...f,
                        photoStorageIds: f.photoStorageIds.filter((_, i) => i !== idx),
                        photoPreviews: f.photoPreviews.filter((_, i) => i !== idx),
                      }))
                    }
                    onStartEdit={() => {
                      setEditingCandidateId(candidate._id)
                      // Reconstruct the ordered storageId list (primary + extras, deduplicated)
                      const existingIds = [
                        ...(candidate.photoUrl ? [candidate.photoUrl] : []),
                        ...(candidate.photoUrls ?? []),
                      ].filter((id, i, arr) => arr.indexOf(id) === i)
                      setEditCandidateForm({
                        name: candidate.name,
                        bio: candidate.bio ?? "",
                        photoStorageIds: existingIds,
                        photoPreviews: [],
                      })
                    }}
                    onSaveEdit={handleSaveCandidateEdit}
                    onCancelEdit={() => setEditingCandidateId(null)}
                    onDelete={() => deleteCandidate({ candidateId: candidate._id })}
                    onPhotoUpload={(file) => handlePhotoUpload(file, candidate._id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Add candidate form */}
            {addingCandidate ? (
              <div className="mt-2 rounded-lg border border-border p-3 space-y-2">
                {/* Photo strip */}
                <div className="flex items-center gap-2 flex-wrap">
                  {candidateForm.photoPreviews.map((preview, i) => (
                    <div key={i} className="relative shrink-0">
                      <img src={preview} alt="" className="h-10 w-10 rounded-lg object-cover object-top" />
                      <button
                        type="button"
                        onClick={() =>
                          setCandidateForm((f) => ({
                            ...f,
                            photoStorageIds: f.photoStorageIds.filter((_, j) => j !== i),
                            photoPreviews: f.photoPreviews.filter((_, j) => j !== i),
                          }))
                        }
                        className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-white flex items-center justify-center text-[10px] leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {candidateForm.photoStorageIds.length < 5 && (
                    <button
                      type="button"
                      onClick={() => newCandidatePhotoRef.current?.click()}
                      className="h-10 w-10 shrink-0 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors"
                    >
                      {uploadingFor === "new" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                  <input
                    ref={newCandidatePhotoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handlePhotoUpload(f, "new")
                      e.target.value = ""
                    }}
                  />
                </div>
                <Input
                  placeholder="Candidate name *"
                  value={candidateForm.name}
                  onChange={(e) =>
                    setCandidateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  autoFocus
                />
                <Input
                  placeholder="Short bio (optional)"
                  value={candidateForm.bio}
                  onChange={(e) =>
                    setCandidateForm((f) => ({ ...f, bio: e.target.value }))
                  }
                />
                {candidateFormErr && (
                  <p className="text-xs text-destructive">{candidateFormErr}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddCandidate}
                    disabled={candidateSubmitting || uploadingFor === "new"}
                  >
                    {candidateSubmitting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddingCandidate(false)
                      setCandidateForm(DEFAULT_CANDIDATE_FORM)
                      setCandidateFormErr("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAddingCandidate(true)
                  setCandidateForm(DEFAULT_CANDIDATE_FORM)
                  setCandidateFormErr("")
                }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 mt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Candidate
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- SortablePositionCard wrapper ----------

function SortablePositionCard({
  position,
  onDelete,
}: {
  position: PositionWithCandidates
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: position._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <PositionCard
        position={position}
        dragListeners={listeners}
        dragAttributes={attributes}
        onDelete={onDelete}
      />
    </div>
  )
}

// ---------- Step2Positions ----------

interface Props {
  voteId: Id<"votes">
  onBack: () => void
  onContinue: () => void
  onSaveDraft: () => void
}

export function Step2Positions({ voteId, onBack, onContinue, onSaveDraft }: Props) {
  const positions = useQuery(api.positions.getPositionsWithCandidates, { voteId })
  const [showAddPosition, setShowAddPosition] = useState(false)
  const [positionForm, setPositionForm] = useState<PositionForm>(DEFAULT_POSITION_FORM)
  const [addingPositionErr, setAddingPositionErr] = useState("")
  const [positionSubmitting, setPositionSubmitting] = useState(false)
  const [continueError, setContinueError] = useState("")

  const addPosition = useMutation(api.positions.addPosition)
  const updatePosition = useMutation(api.positions.updatePosition)
  const deletePosition = useMutation(api.positions.deletePosition)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handlePositionDragEnd(event: DragEndEvent) {
    if (!positions) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = positions.map((p) => p._id)
    const oldIdx = ids.indexOf(active.id as Id<"positions">)
    const newIdx = ids.indexOf(over.id as Id<"positions">)
    if (oldIdx === -1 || newIdx === -1) return
    const reordered = arrayMove([...positions], oldIdx, newIdx)
    await Promise.all(
      reordered.map((p, i) => {
        if (p.order !== i) return updatePosition({ positionId: p._id, order: i })
        return Promise.resolve()
      })
    )
  }

  async function handleAddPosition() {
    if (!positionForm.title.trim()) {
      setAddingPositionErr("Position title is required.")
      return
    }
    setAddingPositionErr("")
    setPositionSubmitting(true)
    try {
      await addPosition({
        voteId,
        title: positionForm.title.trim(),
        votingType: positionForm.votingType,
        maxSelections:
          positionForm.votingType === "multiple"
            ? parseInt(positionForm.maxSelections) || 2
            : undefined,
        order: positions?.length ?? 0,
      })
      setPositionForm(DEFAULT_POSITION_FORM)
      setShowAddPosition(false)
    } catch {
      setAddingPositionErr("Failed to add position.")
    } finally {
      setPositionSubmitting(false)
    }
  }

  function handleContinue() {
    if (!positions || positions.length === 0) {
      setContinueError("Add at least one position.")
      return
    }
    const underStaffed = positions.find((p) => p.candidates.length < 2)
    if (underStaffed) {
      setContinueError(
        `"${underStaffed.title}" needs at least 2 candidates.`
      )
      return
    }
    setContinueError("")
    onContinue()
  }

  if (positions === undefined) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Add positions (e.g. &quot;Best Dressed Male&quot;) and at least 2 candidates per position.
      </p>

      {/* Positions list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handlePositionDragEnd}
      >
        <SortableContext
          items={positions.map((p) => p._id)}
          strategy={verticalListSortingStrategy}
        >
          {positions.map((position) => (
            <SortablePositionCard
              key={position._id}
              position={position}
              onDelete={() => deletePosition({ positionId: position._id })}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add position form / button */}
      {showAddPosition ? (
        <Card>
          <CardContent className="space-y-3 pt-2">
            <p className="text-sm font-medium">New Position</p>
            <div className="space-y-1.5">
              <Label>
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. Best Dressed Female"
                value={positionForm.title}
                onChange={(e) =>
                  setPositionForm((f) => ({ ...f, title: e.target.value }))
                }
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Voting Type</Label>
              <select
                value={positionForm.votingType}
                onChange={(e) =>
                  setPositionForm((f) => ({
                    ...f,
                    votingType: e.target.value as VotingType,
                  }))
                }
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
                <option value="ranked">Ranked Choice</option>
              </select>
            </div>
            {positionForm.votingType === "multiple" && (
              <div className="space-y-1.5">
                <Label>Max Selections</Label>
                <Input
                  type="number"
                  min={2}
                  value={positionForm.maxSelections}
                  onChange={(e) =>
                    setPositionForm((f) => ({
                      ...f,
                      maxSelections: e.target.value,
                    }))
                  }
                />
              </div>
            )}
            {addingPositionErr && (
              <p className="text-sm text-destructive">{addingPositionErr}</p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddPosition}
                disabled={positionSubmitting}
              >
                {positionSubmitting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                Add Position
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddPosition(false)
                  setAddingPositionErr("")
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => {
            setShowAddPosition(true)
            setPositionForm(DEFAULT_POSITION_FORM)
          }}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground hover:bg-accent/50 transition-colors",
            positions.length === 0 && "border-destructive/50 text-destructive/70"
          )}
        >
          <Plus className="h-4 w-4" />
          Add Position
        </button>
      )}

      {continueError && (
        <p className="text-sm text-destructive">{continueError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleContinue}>Continue</Button>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="ghost" onClick={onSaveDraft} className="ml-auto">
          Save as Draft
        </Button>
      </div>
    </div>
  )
}
