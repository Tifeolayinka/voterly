"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { BallotShell } from "@/components/voter/ballot-shell"
import { GeoGate } from "@/components/voter/geo-gate"
import { InviteGate } from "@/components/voter/invite-gate"
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"
import type { Doc } from "@/convex/_generated/dataModel"

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading ballot…</p>
      </div>
    </div>
  )
}

function NotFoundScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5">
      <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <AlertCircle className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight">Vote not found</h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          This link is invalid or the vote has been removed by the organiser.
        </p>
      </div>
    </div>
  )
}

function ClosedScreen({ vote }: { vote: Doc<"votes"> }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5">
      <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <CheckCircle2 className="size-7 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight">Voting is closed</h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          <span className="font-semibold text-foreground">{vote.title}</span> has ended and
          is no longer accepting votes.
        </p>
      </div>
    </div>
  )
}

function NotStartedScreen({ vote }: { vote: Doc<"votes"> }) {
  const startLabel = vote.startAt
    ? new Date(vote.startAt).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "soon"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5">
      <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Clock className="size-7 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight">Not open yet</h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          <span className="font-semibold text-foreground">{vote.title}</span> opens on{" "}
          <span className="font-semibold text-foreground">{startLabel}</span>. Come back
          then.
        </p>
      </div>
    </div>
  )
}

export default function VotePage() {
  const { slug } = useParams<{ slug: string }>()

  const vote = useQuery(api.votes.getVoteBySlug, { slug })
  const positions = useQuery(
    api.voter.getVoteBallot,
    vote ? { voteId: vote._id } : "skip"
  )

  if (vote === undefined || (vote !== null && positions === undefined)) {
    return <LoadingScreen />
  }

  if (vote === null || vote.status === "draft") {
    return <NotFoundScreen />
  }

  if (vote.status === "closed") {
    return <ClosedScreen vote={vote} />
  }

  const now = Date.now()
  if (vote.accessControl.timeWindowEnabled && vote.startAt && vote.startAt > now) {
    return <NotStartedScreen vote={vote} />
  }

  // Invite-only: collect and verify contact before showing ballot
  if (vote.accessControl.inviteOnly) {
    return <InviteGate vote={vote} positions={positions ?? []} />
  }

  // Geo-restricted: verify location before showing ballot
  if (vote.accessControl.geoEnabled) {
    return <GeoGate vote={vote} positions={positions ?? []} />
  }

  return <BallotShell vote={vote} positions={positions ?? []} />
}
