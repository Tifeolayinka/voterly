'use client'

import { useRef, useState, useEffect } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { StepIndicator } from '@/components/vote-form/step-indicator'
import { Step1BasicInfo, type Step1Data, type Step1Ref } from '@/components/vote-form/step1-basic-info'
import { Step2Positions, type Step2Ref } from '@/components/vote-form/step2-positions'
import { Step3Access, type AccessControlData, type GeoConfig, type Step3Ref } from '@/components/vote-form/step3-access'
import { Step4Publish, type Step4Ref } from '@/components/vote-form/step4-publish'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDatetimeLocal(ts?: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_STEP1: Step1Data = {
  title: '',
  description: '',
  bannerStorageId: null,
  bannerPreview: null,
  startAt: '',
  endAt: '',
}

const DEFAULT_ACCESS: AccessControlData = {
  mode: 'open',
  geoEnabled: false,
  timeWindowEnabled: false,
  onePerPhone: true,
  otpRequired: false,
  inviteOnly: false,
}

// ─── Step meta ───────────────────────────────────────────────────────────────

const CREATE_META: Record<number, { title: string; description: string }> = {
  1: { title: 'New Vote',  description: 'Set up your voting event step by step.' },
  2: { title: 'Positions', description: 'Add the positions and candidates voters will choose from.' },
  3: { title: 'Access',    description: 'Control who can access this vote and how.' },
  4: { title: 'Publish',   description: 'Review your vote and go live.' },
}

const EDIT_META: Record<number, { title: string; description: string }> = {
  1: { title: 'Edit Vote', description: 'Update the basic details for this vote.' },
  2: { title: 'Positions', description: 'Edit positions and candidates.' },
  3: { title: 'Access',    description: 'Update who can access this vote.' },
  4: { title: 'Review',    description: 'Review your changes before saving.' },
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  editVoteId?: Id<'votes'> | null
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateVoteDrawer({ open, onClose, editVoteId }: Props) {
  const isEditMode = !!editVoteId

  // ── Form state ──────────────────────────────────────────────────────────
  const [step,                setStep]                = useState(1)
  const [voteId,              setVoteId]              = useState<Id<'votes'> | null>(null)
  const [step1Data,           setStep1Data]           = useState<Step1Data>(DEFAULT_STEP1)
  const [accessControl,       setAccessControl]       = useState<AccessControlData>(DEFAULT_ACCESS)
  const [geoConfig,           setGeoConfig]           = useState<GeoConfig | null>(null)
  const [showResultsToVoters, setShowResultsToVoters] = useState(false)
  const [isSubmitting,        setIsSubmitting]        = useState(false)
  const [publishedSlug,       setPublishedSlug]       = useState<string | null>(null)
  const [initialized,         setInitialized]         = useState(false)

  // ── Step refs ────────────────────────────────────────────────────────────
  const step1Ref = useRef<Step1Ref | null>(null)
  const step2Ref = useRef<Step2Ref | null>(null)
  const step3Ref = useRef<Step3Ref | null>(null)
  const step4Ref = useRef<Step4Ref | null>(null)

  // ── Load existing vote for edit mode ─────────────────────────────────────
  const existingVote = useQuery(
    api.votes.getVoteById,
    editVoteId ? { voteId: editVoteId } : 'skip'
  )
  const existingGeoConfig = useQuery(
    api.geo.getGeoConfig,
    editVoteId ? { voteId: editVoteId } : 'skip'
  )
  const bannerUrl = useQuery(
    api.files.getFileUrl,
    existingVote?.bannerUrl
      ? { storageId: existingVote.bannerUrl as Id<'_storage'> }
      : 'skip'
  )

  // ── Pre-populate form state once edit data is loaded ─────────────────────
  useEffect(() => {
    if (!isEditMode || initialized) return
    if (existingVote === undefined || existingGeoConfig === undefined) return
    if (!existingVote) return // unauthorized

    setVoteId(existingVote._id)
    setStep1Data({
      title: existingVote.title,
      description: existingVote.description ?? '',
      bannerStorageId: existingVote.bannerUrl ?? null,
      bannerPreview: null, // resolved separately below
      startAt: toDatetimeLocal(existingVote.startAt),
      endAt: toDatetimeLocal(existingVote.endAt),
    })
    setAccessControl(existingVote.accessControl)
    setShowResultsToVoters(existingVote.showResultsToVoters)
    if (existingGeoConfig) {
      setGeoConfig({
        lat: existingGeoConfig.lat,
        lng: existingGeoConfig.lng,
        radiusMetres: existingGeoConfig.radiusMetres,
        venueName: existingGeoConfig.venueName ?? '',
      })
    }
    setInitialized(true)
  }, [isEditMode, existingVote, existingGeoConfig, initialized])

  // Patch banner preview once the storage URL resolves
  useEffect(() => {
    if (typeof bannerUrl === 'string') {
      setStep1Data((d) => ({ ...d, bannerPreview: bannerUrl }))
    }
  }, [bannerUrl])

  // ── Reset all state after close animation ─────────────────────────────────
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(1)
        setVoteId(null)
        setStep1Data(DEFAULT_STEP1)
        setAccessControl(DEFAULT_ACCESS)
        setGeoConfig(null)
        setShowResultsToVoters(false)
        setIsSubmitting(false)
        setPublishedSlug(null)
        setInitialized(false)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [open])

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handlePrimary() {
    setIsSubmitting(true)
    try {
      if (step === 1) await step1Ref.current?.submit()
      if (step === 2) step2Ref.current?.submit()
      if (step === 3) step3Ref.current?.submit()
      if (step === 4) await step4Ref.current?.submit()
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1)
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  const meta = isEditMode ? EDIT_META[step] : CREATE_META[step]

  const primaryLabel = (() => {
    if (step < 4) return 'Continue'
    if (!isEditMode) return 'Publish Vote'
    const status = existingVote?.status
    return status === 'active' || status === 'closed' ? 'Save Changes' : 'Publish Vote'
  })()

  const isPublished   = !!publishedSlug
  const isLoadingEdit = isEditMode && !initialized

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex flex-col gap-0 p-0 sm:max-w-[560px] w-full"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-[16px] font-semibold tracking-tight">
            {meta.title}
          </SheetTitle>
          <SheetDescription className="text-[12.5px]">
            {meta.description}
          </SheetDescription>
        </SheetHeader>

        {/* Step indicator */}
        <div className="px-6 pt-4 pb-3 shrink-0">
          <StepIndicator current={step} />
        </div>

        {/* Scrollable step content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-1">
          {isLoadingEdit ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {step === 1 && (
                <Step1BasicInfo
                  ref={step1Ref}
                  voteId={voteId}
                  data={step1Data}
                  onDataChange={setStep1Data}
                  onComplete={(id) => { setVoteId(id); setStep(2) }}
                  onSaveDraft={onClose}
                />
              )}
              {step === 2 && voteId && (
                <Step2Positions
                  ref={step2Ref}
                  voteId={voteId}
                  onBack={handleBack}
                  onContinue={() => setStep(3)}
                  onSaveDraft={onClose}
                />
              )}
              {step === 3 && (
                <Step3Access
                  ref={step3Ref}
                  value={accessControl}
                  onChange={setAccessControl}
                  geoConfig={geoConfig}
                  onGeoConfigChange={setGeoConfig}
                  onBack={handleBack}
                  onContinue={() => setStep(4)}
                  onSaveDraft={onClose}
                />
              )}
              {step === 4 && voteId && (
                <Step4Publish
                  ref={step4Ref}
                  voteId={voteId}
                  voteStatus={existingVote?.status}
                  accessControl={accessControl}
                  geoConfig={geoConfig}
                  showResultsToVoters={showResultsToVoters}
                  onShowResultsChange={setShowResultsToVoters}
                  onBack={handleBack}
                  onComplete={onClose}
                  onPublish={(slug) => setPublishedSlug(slug)}
                />
              )}
            </>
          )}
        </div>

        {/* Pinned footer */}
        <SheetFooter className="px-6 py-4 border-t border-border shrink-0 flex-row gap-3">
          {isPublished ? (
            <Button onClick={onClose} className="flex-1 h-11 font-semibold">
              Done
            </Button>
          ) : (
            <>
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting || isLoadingEdit}
                  className="h-11 px-4"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="h-11 text-muted-foreground"
                >
                  {isEditMode ? 'Cancel' : 'Save Draft'}
                </Button>
              )}
              <Button
                onClick={handlePrimary}
                disabled={isSubmitting || isLoadingEdit}
                className="flex-1 h-11 font-semibold"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {primaryLabel}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
