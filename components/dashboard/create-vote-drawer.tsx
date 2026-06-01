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
import type { Id } from '@/convex/_generated/dataModel'

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

const STEP_LABELS: Record<number, { primary: string; title: string; description: string }> = {
  1: { primary: 'Continue',     title: 'New Vote',    description: 'Set up your voting event step by step.' },
  2: { primary: 'Continue',     title: 'Positions',   description: 'Add the positions and candidates voters will choose from.' },
  3: { primary: 'Continue',     title: 'Access',      description: 'Control who can access this vote and how.' },
  4: { primary: 'Publish Vote', title: 'Publish',     description: 'Review your vote and go live.' },
}

interface Props {
  open: boolean
  onClose: () => void
}

export function CreateVoteDrawer({ open, onClose }: Props) {
  const [step, setStep]                               = useState(1)
  const [voteId, setVoteId]                           = useState<Id<'votes'> | null>(null)
  const [step1Data, setStep1Data]                     = useState<Step1Data>(DEFAULT_STEP1)
  const [accessControl, setAccessControl]             = useState<AccessControlData>(DEFAULT_ACCESS)
  const [geoConfig, setGeoConfig]                     = useState<GeoConfig | null>(null)
  const [showResultsToVoters, setShowResultsToVoters] = useState(false)
  const [isSubmitting, setIsSubmitting]               = useState(false)
  const [publishedSlug, setPublishedSlug]             = useState<string | null>(null)

  const step1Ref = useRef<Step1Ref | null>(null)
  const step2Ref = useRef<Step2Ref | null>(null)
  const step3Ref = useRef<Step3Ref | null>(null)
  const step4Ref = useRef<Step4Ref | null>(null)

  // Reset state after close animation
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(1); setVoteId(null); setStep1Data(DEFAULT_STEP1)
        setAccessControl(DEFAULT_ACCESS); setGeoConfig(null)
        setShowResultsToVoters(false); setIsSubmitting(false); setPublishedSlug(null)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [open])

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
    if (step > 1) setStep(s => s - 1)
  }

  const meta      = STEP_LABELS[step]
  const isPublished = !!publishedSlug

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={true}
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
              accessControl={accessControl}
              geoConfig={geoConfig}
              showResultsToVoters={showResultsToVoters}
              onShowResultsChange={setShowResultsToVoters}
              onBack={handleBack}
              onComplete={onClose}
              onPublish={(slug) => setPublishedSlug(slug)}
            />
          )}
        </div>

        {/* Pinned footer — Ender style */}
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
                  disabled={isSubmitting}
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
                  Save Draft
                </Button>
              )}
              <Button
                onClick={handlePrimary}
                disabled={isSubmitting}
                className="flex-1 h-11 font-semibold"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {meta.primary}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
