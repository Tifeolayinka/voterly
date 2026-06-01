"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { BallotShell, type BallotPosition } from "./ballot-shell"
import { GeoGate } from "./geo-gate"
import { Lock, Loader2 } from "lucide-react"
import type { Doc } from "@/convex/_generated/dataModel"

interface Props {
  vote: Doc<"votes">
  positions: BallotPosition[]
}

export function InviteGate({ vote, positions }: Props) {
  const [input, setInput] = useState("")
  const [submittedContact, setSubmittedContact] = useState<string | null>(null)
  const [inputError, setInputError] = useState("")

  const accessResult = useQuery(
    api.voter.checkInviteAccess,
    submittedContact
      ? { voteId: vote._id, contact: submittedContact }
      : "skip"
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = input.trim()
    if (!val) {
      setInputError("Please enter your phone number or email address.")
      return
    }
    setInputError("")
    setSubmittedContact(val.toLowerCase())
  }

  // Checking access
  if (submittedContact && accessResult === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-6 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Checking access…</p>
        </div>
      </div>
    )
  }

  // Not on the list
  if (submittedContact && accessResult && !accessResult.allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-5">
        <div className="size-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <Lock className="size-7 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">Not on the list</h1>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            <span className="font-semibold text-foreground">{submittedContact}</span>{" "}
            is not on the invite list for this vote. Contact the organiser if you
            believe this is a mistake.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSubmittedContact(null)
            setInput("")
          }}
          className="h-11 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all font-semibold text-sm text-slate-700 shadow-sm"
        >
          Try a different contact
        </button>
      </div>
    )
  }

  // Access granted — hand off to geo gate or ballot directly
  if (submittedContact && accessResult?.allowed) {
    if (vote.accessControl.geoEnabled) {
      return (
        <GeoGate vote={vote} positions={positions} contact={submittedContact} />
      )
    }
    return (
      <BallotShell vote={vote} positions={positions} contact={submittedContact} />
    )
  }

  // Invite form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Invite-only vote
            </p>
            <h1 className="text-2xl font-black tracking-tight">{vote.title}</h1>
            {vote.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
                {vote.description}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="contact-input"
              className="text-sm font-medium text-foreground"
            >
              Your phone or email
            </label>
            <input
              id="contact-input"
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="e.g. you@example.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            {inputError && (
              <p className="text-xs text-red-500">{inputError}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/88 active:scale-[0.98] transition-all flex items-center justify-center font-semibold text-white text-sm"
          >
            Check access
          </button>
        </form>
      </div>
    </div>
  )
}
