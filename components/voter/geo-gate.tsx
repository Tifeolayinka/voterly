"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { BallotShell, type BallotPosition } from "./ballot-shell"
import { Loader2, MapPin, ShieldOff, WifiOff } from "lucide-react"
import type { Doc } from "@/convex/_generated/dataModel"

type GeoStatus =
  | "requesting"   // waiting on browser permission prompt
  | "denied"       // user denied permission
  | "unavailable"  // POSITION_UNAVAILABLE (code 2) or no geolocation support
  | "timeout"      // TIMEOUT (code 3) — worth retrying
  | "server_check" // coords obtained, waiting on Convex
  | "inside"       // server confirmed: within radius
  | "outside"      // server confirmed: outside radius

interface Props {
  vote: Doc<"votes">
  positions: BallotPosition[]
  contact?: string // forwarded from InviteGate when both invite-only + geo are enabled
}

function Screen({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5">
      <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{body}</p>
      </div>
      {action}
    </div>
  )
}

export function GeoGate({ vote, positions, contact }: Props) {
  const [status, setStatus] = useState<GeoStatus>("requesting")
  const [slowHint, setSlowHint] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [outsideInfo, setOutsideInfo] = useState<{
    distanceMetres: number
    radiusMetres: number
    venueName: string | null
  } | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const slowHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (safetyTimerRef.current !== null) {
      clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = null
    }
    if (slowHintTimerRef.current !== null) {
      clearTimeout(slowHintTimerRef.current)
      slowHintTimerRef.current = null
    }
  }, [])

  const requestLocation = useCallback(() => {
    stopWatch()
    setStatus("requesting")
    setSlowHint(false)

    if (!window.isSecureContext || !navigator?.geolocation) {
      setStatus("unavailable")
      return
    }

    // After 6 s still requesting, show a hint about system-level settings
    slowHintTimerRef.current = setTimeout(() => setSlowHint(true), 6_000)

    // Hard ceiling — 20 s gives CoreLocation enough time while not hanging forever
    safetyTimerRef.current = setTimeout(() => {
      stopWatch()
      setStatus((s) => (s === "requesting" ? "timeout" : s))
    }, 20_000)

    // watchPosition retries automatically on transient kCLErrorLocationUnknown failures.
    // getCurrentPosition gives up on the first one; watchPosition keeps trying.
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        stopWatch()
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus("server_check")
      },
      (err) => {
        console.error("[GeoGate] geolocation error", { code: err.code, message: err.message })
        if (err.code === err.PERMISSION_DENIED) {
          stopWatch()
          setStatus("denied")
        }
        // POSITION_UNAVAILABLE (kCLErrorLocationUnknown on macOS) is transient — keep watching
      },
      { maximumAge: 60_000 }
    )
  }, [stopWatch])

  useEffect(() => {
    requestLocation()
    return stopWatch
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const serverCheck = useQuery(
    api.geo.checkGeoAccess,
    coords ? { voteId: vote._id, lat: coords.lat, lng: coords.lng } : "skip"
  )

  useEffect(() => {
    if (!coords || serverCheck === undefined) return
    if (serverCheck.allowed) {
      setStatus("inside")
    } else {
      setOutsideInfo({
        distanceMetres: serverCheck.distanceMetres ?? 0,
        radiusMetres: serverCheck.radiusMetres ?? 0,
        venueName: serverCheck.venueName ?? null,
      })
      setStatus("outside")
    }
  }, [serverCheck, coords])

  if (status === "requesting" || status === "server_check") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
        {/* Vote details */}
        <div className="text-center space-y-2 max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            You're invited to vote
          </p>
          <h1 className="text-3xl font-black tracking-tight">{vote.title}</h1>
          {vote.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{vote.description}</p>
          )}
        </div>

        {/* Location check strip */}
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="size-5 text-primary animate-spin" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold">
              {status === "server_check" ? "Verifying your location…" : "Checking your location"}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              {status === "server_check"
                ? "Almost there…"
                : slowHint
                ? "Taking longer than usual. On Mac: System Settings → Privacy & Security → Location Services → enable your browser."
                : "Allow location access when prompted to continue."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "denied") {
    return (
      <Screen
        icon={<ShieldOff className="size-7 text-primary" />}
        title="Location access required"
        body={`"${vote.title}" is restricted to attendees at the venue. Enable location in your browser settings and reload the page.`}
        action={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-1 h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all font-semibold text-primary-foreground text-sm"
          >
            Reload page
          </button>
        }
      />
    )
  }

  const retryButton = (
    <button
      type="button"
      onClick={requestLocation}
      className="mt-1 h-11 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all font-semibold text-sm text-slate-700 shadow-sm"
    >
      Try again
    </button>
  )

  if (status === "timeout") {
    return (
      <Screen
        icon={<WifiOff className="size-7 text-slate-400" />}
        title="Location timed out"
        body="Couldn't get a location fix in time. On Mac, make sure Wi-Fi is on (it's used for location even without a network). On mobile, step outside or to an area with better signal."
        action={retryButton}
      />
    )
  }

  if (status === "unavailable") {
    return (
      <Screen
        icon={<WifiOff className="size-7 text-slate-400" />}
        title="Couldn't verify location"
        body="Your device can't determine your location. Check that location is enabled for your browser in your device's system settings (not just the browser prompt), then try again."
        action={retryButton}
      />
    )
  }

  if (status === "outside") {
    const info = outsideInfo
    const overBy = info ? Math.round(info.distanceMetres - info.radiusMetres) : null

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5">
        <div className="size-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <MapPin className="size-7 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">You're not at the venue</h1>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            {info?.venueName ? (
              <>
                This vote is restricted to attendees at{" "}
                <span className="font-semibold text-foreground">{info.venueName}</span>.
              </>
            ) : (
              "This vote is restricted to attendees at the event venue."
            )}
            {overBy != null && overBy > 0 && (
              <> You're currently about {overBy < 1000 ? `${overBy}m` : `${(overBy / 1000).toFixed(1)}km`} outside the zone.</>
            )}
          </p>
        </div>
      </div>
    )
  }

  // status === "inside" — render the ballot
  return (
    <BallotShell
      vote={vote}
      positions={positions}
      voterLat={coords!.lat}
      voterLng={coords!.lng}
      contact={contact}
    />
  )
}
