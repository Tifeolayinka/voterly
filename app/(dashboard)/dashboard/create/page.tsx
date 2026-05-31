"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Id } from "@/convex/_generated/dataModel"
import { StepIndicator } from "@/components/vote-form/step-indicator"
import { Step1BasicInfo, type Step1Data } from "@/components/vote-form/step1-basic-info"
import { Step2Positions } from "@/components/vote-form/step2-positions"
import { Step3Access, type AccessControlData, type GeoConfig } from "@/components/vote-form/step3-access"
import { Step4Publish } from "@/components/vote-form/step4-publish"

const DEFAULT_STEP1: Step1Data = {
  title: "",
  description: "",
  bannerStorageId: null,
  bannerPreview: null,
  startAt: "",
  endAt: "",
}

const DEFAULT_ACCESS: AccessControlData = {
  mode: "open",
  geoEnabled: false,
  timeWindowEnabled: false,
  onePerPhone: true,
  otpRequired: false,
  inviteOnly: false,
}

export default function CreateVotePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [voteId, setVoteId] = useState<Id<"votes"> | null>(null)
  const [step1Data, setStep1Data] = useState<Step1Data>(DEFAULT_STEP1)
  const [accessControl, setAccessControl] = useState<AccessControlData>(DEFAULT_ACCESS)
  const [geoConfig, setGeoConfig] = useState<GeoConfig | null>(null)
  const [showResultsToVoters, setShowResultsToVoters] = useState(false)

  const goToDashboard = () => router.push("/dashboard")

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Vote</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set up your voting event step by step.
          </p>
        </div>

        <StepIndicator current={step} />

        {step === 1 && (
          <Step1BasicInfo
            voteId={voteId}
            data={step1Data}
            onDataChange={setStep1Data}
            onComplete={(id) => {
              setVoteId(id)
              setStep(2)
            }}
            onSaveDraft={goToDashboard}
          />
        )}

        {step === 2 && voteId && (
          <Step2Positions
            voteId={voteId}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
            onSaveDraft={goToDashboard}
          />
        )}

        {step === 3 && (
          <Step3Access
            value={accessControl}
            onChange={setAccessControl}
            geoConfig={geoConfig}
            onGeoConfigChange={setGeoConfig}
            onBack={() => setStep(2)}
            onContinue={() => setStep(4)}
            onSaveDraft={goToDashboard}
          />
        )}

        {step === 4 && voteId && (
          <Step4Publish
            voteId={voteId}
            accessControl={accessControl}
            geoConfig={geoConfig}
            showResultsToVoters={showResultsToVoters}
            onShowResultsChange={setShowResultsToVoters}
            onBack={() => setStep(3)}
            onComplete={goToDashboard}
          />
        )}
      </div>
    </div>
  )
}
