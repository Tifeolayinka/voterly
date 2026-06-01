"use client"

import { forwardRef, useImperativeHandle, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { AccessControlData, GeoConfig } from "./step3-access"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Check, Copy, Globe, Loader2, Lock, MapPin } from "lucide-react"

export interface Step4Ref {
  submit: () => Promise<void>
  isPublished: () => boolean
}

interface Props {
  voteId: Id<"votes">
  accessControl: AccessControlData
  geoConfig: GeoConfig | null
  showResultsToVoters: boolean
  onShowResultsChange: (v: boolean) => void
  onBack: () => void
  onComplete: () => void
  onPublish?: (slug: string) => void
}

export const Step4Publish = forwardRef<Step4Ref, Props>(function Step4Publish({
  voteId,
  accessControl,
  geoConfig,
  showResultsToVoters,
  onShowResultsChange,
  onBack,
  onComplete,
  onPublish,
}, ref) {
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState("")
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const publishVote = useMutation(api.votes.publishVote)
  const saveGeoConfig = useMutation(api.geo.saveGeoConfig)
  const positions = useQuery(api.positions.getPositionsWithCandidates, { voteId })

  const totalCandidates =
    positions?.reduce((sum, p) => sum + p.candidates.length, 0) ?? 0

  async function handlePublish() {
    setError("")
    setPublishing(true)
    try {
      const slug = await publishVote({ voteId, showResultsToVoters, accessControl })
      if (accessControl.geoEnabled && geoConfig) {
        await saveGeoConfig({
          voteId,
          lat: geoConfig.lat,
          lng: geoConfig.lng,
          radiusMetres: geoConfig.radiusMetres,
          venueName: geoConfig.venueName || undefined,
        })
      }
      setPublishedSlug(slug)
      onPublish?.(slug)
    } catch {
      setError("Failed to publish. Please try again.")
    } finally {
      setPublishing(false)
    }
  }

  useImperativeHandle(ref, () => ({
    submit: handlePublish,
    isPublished: () => !!publishedSlug,
  }))

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (publishedSlug) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://votely.app"
    const voteUrl = `${origin}/vote/${publishedSlug}`
    return (
      <div className="py-8 flex flex-col items-center gap-5 text-center">
        <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-foreground">Vote Published!</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Your vote is live and accepting submissions.
          </p>
        </div>
        <div className="w-full rounded-xl bg-muted p-3 text-sm font-mono break-all text-left">
          {voteUrl}
        </div>
        <Button variant="outline" onClick={() => handleCopy(voteUrl)} className="w-full">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>
    )
  }

  const enabledRestrictions = [
    accessControl.geoEnabled && "Geo-fencing",
    accessControl.timeWindowEnabled && "Time Window",
    accessControl.onePerPhone && "One Vote per Phone",
    accessControl.otpRequired && "OTP Verification",
    accessControl.inviteOnly && "Invite Only",
  ].filter(Boolean) as string[]

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <Card>
        <CardContent className="space-y-5 pt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Review
          </p>

          <div className="space-y-1">
            <p className="text-sm font-medium">Positions & Candidates</p>
            {positions === undefined ? (
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {positions.length} position{positions.length !== 1 ? "s" : ""},{" "}
                  {totalCandidates} candidate{totalCandidates !== 1 ? "s" : ""} total
                </p>
                <ul className="mt-1 space-y-0.5">
                  {positions.map((p) => (
                    <li key={p._id} className="text-xs text-muted-foreground ml-3">
                      • {p.title} — {p.candidates.length} candidates (
                      {p.votingType})
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1.5">
              {accessControl.mode === "open" ? (
                <Globe className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              Access
            </p>
            {accessControl.mode === "open" ? (
              <p className="text-sm text-muted-foreground">
                Open — anyone with the link can vote
              </p>
            ) : enabledRestrictions.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {enabledRestrictions.map((r) => (
                    <Badge key={r} variant="secondary" className="text-xs">
                      {r}
                    </Badge>
                  ))}
                </div>
                {accessControl.geoEnabled && (
                  geoConfig ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {geoConfig.venueName || `${geoConfig.lat.toFixed(5)}, ${geoConfig.lng.toFixed(5)}`}
                      {" · "}{geoConfig.radiusMetres}m radius
                    </p>
                  ) : (
                    <p className="text-xs text-amber-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      No venue set — all voters will pass the geo check until one is configured
                    </p>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Restricted (no specific controls enabled)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Show results toggle */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="pr-4">
            <p className="text-sm font-medium">Show live results to voters</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              After submitting, voters can see live results for this vote
            </p>
          </div>
          <Switch
            checked={showResultsToVoters}
            onCheckedChange={onShowResultsChange}
          />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
})
