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
  const hasPhoto = images.length > 0
  const hasMultiple = images.length > 1

  function prev(e: React.MouseEvent) {
    e.stopPropagation()
    setImgIdx((i) => (i - 1 + images.length) % images.length)
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation()
    setImgIdx((i) => (i + 1) % images.length)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!hasMultiple) return
    if (e.key === "ArrowLeft") { e.preventDefault(); setImgIdx((i) => (i - 1 + images.length) % images.length) }
    if (e.key === "ArrowRight") { e.preventDefault(); setImgIdx((i) => (i + 1) % images.length) }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-pressed={selected}
      aria-label={`${candidate.name}${hasMultiple ? `, photo ${imgIdx + 1} of ${images.length}, use arrow keys to browse` : ""}`}
      style={{ touchAction: "manipulation" }}
      className={cn(
        "relative block w-full aspect-[3/4] rounded-2xl overflow-hidden",
        "transition-all duration-200 outline-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "ring-2 ring-primary shadow-[0_0_12px_oklch(0.49_0.21_255_/_0.22)]"
          : "ring-1 ring-black/8 hover:ring-black/16",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      {/* Photo or muted fallback */}
      {hasPhoto ? (
        <img
          src={images[imgIdx]}
          alt={candidate.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <span className="text-6xl font-black text-primary/35 select-none leading-none">
            {candidate.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Scrim — only rendered when there's a photo */}
      {hasPhoto && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      )}

      {/* Story-style image count dots */}
      {hasMultiple && (
        <div className="absolute top-2.5 inset-x-2.5 flex gap-1 z-20 pointer-events-none">
          {images.map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-[3px] rounded-full transition-all duration-200",
                i === imgIdx ? "bg-white" : "bg-white/35"
              )}
            />
          ))}
        </div>
      )}

      {/* Invisible tap zones for multi-image navigation */}
      {hasMultiple && (
        <>
          <div aria-hidden="true" onClick={prev} className="absolute inset-y-0 left-0 w-2/5 z-10" />
          <div aria-hidden="true" onClick={next} className="absolute inset-y-0 right-0 w-2/5 z-10" />
        </>
      )}

      {/* Selection badge */}
      {selected && (
        <div aria-hidden="true" className="absolute top-3 right-3 size-7 rounded-full bg-primary flex items-center justify-center shadow-sm z-20">
          <Check className="size-3.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Name + bio — on photo: overlaid on scrim; no photo: below center */}
      {hasPhoto ? (
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8 z-20">
          <p className="text-white font-semibold text-sm leading-snug">{candidate.name}</p>
          {candidate.bio && (
            <p className="text-white/65 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
              {candidate.bio}
            </p>
          )}
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 z-20">
          <p className="text-slate-800 font-semibold text-sm leading-snug text-center">
            {candidate.name}
          </p>
          {candidate.bio && (
            <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2 leading-relaxed text-center">
              {candidate.bio}
            </p>
          )}
        </div>
      )}
    </button>
  )
}
