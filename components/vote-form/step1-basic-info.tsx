"use client"

import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageIcon, Loader2, X } from "lucide-react"

export interface Step1Data {
  title: string
  description: string
  bannerStorageId: string | null
  bannerPreview: string | null
  startAt: string
  endAt: string
}

export interface Step1Ref {
  submit: () => Promise<void>
  isLoading: () => boolean
}

interface Props {
  voteId: Id<"votes"> | null
  data: Step1Data
  onDataChange: (data: Step1Data) => void
  onComplete: (voteId: Id<"votes">) => void
  onSaveDraft: () => void
}

export const Step1BasicInfo = forwardRef<Step1Ref, Props>(function Step1BasicInfo(
  { voteId, data, onDataChange, onComplete },
  ref
) {
  const fileRef      = useRef<HTMLInputElement>(null)
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState("")

  const createVote        = useMutation(api.votes.createVote)
  const updateVote        = useMutation(api.votes.updateVote)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  const update = (patch: Partial<Step1Data>) => onDataChange({ ...data, ...patch })

  async function handleBannerSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    update({ bannerPreview: URL.createObjectURL(file), bannerStorageId: null })
    setUploading(true)
    try {
      const uploadUrl = await generateUploadUrl()
      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file })
      if (!res.ok) throw new Error("Upload failed")
      const { storageId } = await res.json()
      update({ bannerStorageId: storageId })
    } catch {
      update({ bannerPreview: null, bannerStorageId: null })
      setError("Banner upload failed. Please try again.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleContinue() {
    if (!data.title.trim()) { setError("Title is required."); return }
    setError("")
    setSubmitting(true)
    try {
      const args = {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        bannerUrl: data.bannerStorageId ?? undefined,
        startAt: data.startAt ? new Date(data.startAt).getTime() : undefined,
        endAt: data.endAt   ? new Date(data.endAt).getTime()   : undefined,
      }
      if (voteId) {
        await updateVote({ voteId, ...args })
        onComplete(voteId)
      } else {
        const id = await createVote(args)
        onComplete(id)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  useImperativeHandle(ref, () => ({
    submit: handleContinue,
    isLoading: () => submitting || uploading,
  }))

  return (
    <div className="space-y-5">
      <h3 className="text-[15px] font-semibold text-foreground">Basic Details</h3>

      <div className="space-y-1.5">
        <Label htmlFor="s1-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="s1-title"
          placeholder="e.g. Annual Awards 2025"
          value={data.title}
          onChange={(e) => update({ title: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="s1-desc">Description</Label>
        <Textarea
          id="s1-desc"
          placeholder="Tell voters what this is about (optional)"
          value={data.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Banner Image</Label>
        {data.bannerPreview ? (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img src={data.bannerPreview} alt="Banner preview" className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={() => update({ bannerPreview: null, bannerStorageId: null })}
              className="absolute top-2 right-2 rounded-full bg-background/80 p-1 hover:bg-background transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
          >
            <ImageIcon className="h-6 w-6" />
            <span>Click to upload banner (optional)</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBannerSelect} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="s1-start">Start Date & Time</Label>
          <Input id="s1-start" type="datetime-local" value={data.startAt} onChange={(e) => update({ startAt: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s1-end">End Date & Time</Label>
          <Input id="s1-end" type="datetime-local" value={data.endAt} onChange={(e) => update({ endAt: e.target.value })} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
})
