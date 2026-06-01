"use client"

import { forwardRef, useImperativeHandle } from "react"
import dynamic from "next/dynamic"
import type { LucideIcon } from "lucide-react"
import { Clock, Key, MapPin, Phone, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { GeoConfig } from "@/components/geo/geo-fencing-card"

export type { GeoConfig }

// Dynamically import the Mapbox component so mapbox-gl never loads on the server
const GeoFencingCard = dynamic(
  () =>
    import("@/components/geo/geo-fencing-card").then((m) => ({
      default: m.GeoFencingCard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-xl bg-muted animate-pulse" />
    ),
  }
)

export interface AccessControlData {
  mode: "open" | "restricted"
  geoEnabled: boolean
  timeWindowEnabled: boolean
  onePerPhone: boolean
  otpRequired: boolean
  inviteOnly: boolean
}

export interface Step3Ref {
  submit: () => void
}

interface Props {
  value: AccessControlData
  onChange: (v: AccessControlData) => void
  geoConfig: GeoConfig | null
  onGeoConfigChange: (v: GeoConfig | null) => void
  onBack: () => void
  onContinue: () => void
  onSaveDraft: () => void
}

export const Step3Access = forwardRef<Step3Ref, Props>(function Step3Access({
  value,
  onChange,
  geoConfig,
  onGeoConfigChange,
  onBack,
  onContinue,
  onSaveDraft,
}, ref) {
  const update = (patch: Partial<AccessControlData>) =>
    onChange({ ...value, ...patch })
  const isRestricted = value.mode === "restricted"

  useImperativeHandle(ref, () => ({ submit: onContinue }))

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Control who can access and cast a ballot in your event.
          </p>

          {/* Open / Restricted mode picker */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update({ mode: "open" })}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                !isRestricted
                  ? "border-primary bg-primary/5"
                  : "border-border text-muted-foreground hover:bg-accent/50"
              )}
            >
              <p className="font-medium text-sm">Open</p>
              <p className="text-xs mt-0.5 text-muted-foreground">
                Anyone with the link can vote
              </p>
            </button>
            <button
              type="button"
              onClick={() => update({ mode: "restricted" })}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                isRestricted
                  ? "border-primary bg-primary/5"
                  : "border-border text-muted-foreground hover:bg-accent/50"
              )}
            >
              <p className="font-medium text-sm">Restricted</p>
              <p className="text-xs mt-0.5 text-muted-foreground">
                Add access controls below
              </p>
            </button>
          </div>

          {/* Restriction toggles */}
          {isRestricted && (
            <div className="space-y-4 pt-2 border-t border-border">
              <AccessToggle
                icon={MapPin}
                label="Geo-fencing"
                description="Voters must be within a set distance of the venue"
                checked={value.geoEnabled}
                onChange={(v) => update({ geoEnabled: v })}
              />

              {/* Inline Mapbox geo-fencing configurator */}
              {value.geoEnabled && (
                <div className="ml-11">
                  <GeoFencingCard value={geoConfig} onChange={onGeoConfigChange} />
                </div>
              )}

              <AccessToggle
                icon={Clock}
                label="Time Window"
                description="Voting only allowed between the start and end times set in step 1"
                checked={value.timeWindowEnabled}
                onChange={(v) => update({ timeWindowEnabled: v })}
              />

              <AccessToggle
                icon={Phone}
                label="One Vote Per Phone"
                description="Each phone number can only submit once"
                checked={value.onePerPhone}
                onChange={(v) => update({ onePerPhone: v })}
              />

              <AccessToggle
                icon={Key}
                label="OTP Verification"
                description="Voters must verify their phone number via SMS before voting"
                checked={value.otpRequired}
                onChange={(v) => update({ otpRequired: v })}
              />

              <AccessToggle
                icon={Users}
                label="Invite Only"
                description="Only contacts on the invite list (phone or email) can vote"
                checked={value.inviteOnly}
                onChange={(v) => update({ inviteOnly: v })}
              />
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
})

function AccessToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
