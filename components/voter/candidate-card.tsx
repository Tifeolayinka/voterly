"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type BallotCandidate = {
  _id: string
  name: string
  bio?: string
  photoUrls: string[]
}

interface CandidateCardProps {
  candidate: BallotCandidate
  selected: boolean
  onClick?: () => void
  disabled?: boolean
}

export function CandidateCard({ candidate, selected, onClick, disabled }: CandidateCardProps) {
  const [imgIdx, setImgIdx] = useState(0)
  const images = candidate.photoUrls
  const hasMultiple = images.length > 1

  function goTo(i: number, e: React.MouseEvent) {
    e.stopPropagation()
    setImgIdx(i)
  }

  function prev(e: React.MouseEvent) {
    e.stopPropagation()
    setImgIdx((i) => (i - 1 + images.length) % images.length)
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation()
    setImgIdx((i) => (i + 1) % images.length)
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{ touchAction: "manipulation" }}
      className={cn(
        "relative block w-full aspect-[3/4] rounded-2xl overflow-hidden",
        "transition-all duration-200 outline-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "ring-2 ring-primary shadow-[0_0_28px_oklch(0.48_0.26_293_/_0.45)]"
          : "ring-1 ring-white/10 hover:ring-white/25",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      {/* Photo */}
      {images.length > 0 ? (
        <img
          src={images[imgIdx]}
          alt={candidate.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent flex items-center justify-center">
          <span className="text-6xl font-black text-primary/50 select-none">
            {candidate.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Full-card dark gradient scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />

      {/* Story-style image count dots */}
      {hasMultiple && (
        <div className="absolute top-2.5 inset-x-2.5 flex gap-1 z-20 pointer-events-none">
          {images.map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-[3px] rounded-full transition-all duration-200",
                i < imgIdx
                  ? "bg-white"
                  : i === imgIdx
                    ? "bg-white"
                    : "bg-white/30"
              )}
            />
          ))}
        </div>
      )}

      {/* Invisible tap zones for multi-image navigation */}
      {hasMultiple && (
        <>
          <div
            onClick={prev}
            className="absolute inset-y-0 left-0 w-2/5 z-10"
          />
          <div
            onClick={next}
            className="absolute inset-y-0 right-0 w-2/5 z-10"
          />
        </>
      )}

      {/* Selection badge */}
      {selected && (
        <div className="absolute top-3 right-3 size-7 rounded-full bg-primary flex items-center justify-center shadow-lg z-20">
          <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />
        </div>
      )}

      {/* Name + bio overlaid on scrim */}
      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8 z-20">
        <p className="text-white font-bold text-sm leading-snug">{candidate.name}</p>
        {candidate.bio && (
          <p className="text-white/60 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
            {candidate.bio}
          </p>
        )}
      </div>
    </button>
  )
}
