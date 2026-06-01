'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import {
  Plus,
  FileText,
  MapPin,
  Clock,
  Phone,
  Lock,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Doc } from '@/convex/_generated/dataModel'
import { useVoteDrawer } from '@/components/dashboard/vote-drawer-context'

const STATUS_CONFIG: Record<
  Doc<'votes'>['status'],
  { label: string; dot: string; chipCn: string }
> = {
  draft:  { label: 'Draft',  dot: 'bg-slate-400',  chipCn: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  active: { label: 'Active', dot: 'bg-emerald-500', chipCn: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  closed: { label: 'Closed', dot: 'bg-slate-300',  chipCn: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
}

function groupByStatus(votes: Doc<'votes'>[]) {
  return {
    active: votes.filter((v) => v.status === 'active'),
    draft:  votes.filter((v) => v.status === 'draft'),
    closed: votes.filter((v) => v.status === 'closed'),
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const votes = useQuery(api.votes.getVotesByOrganiser)
  const isLoading = votes === undefined

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <DashboardHeader />
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 divide-x divide-border">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-5 py-4 space-y-2">
                <div className="h-6 w-10 bg-muted rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (votes.length === 0) {
    return (
      <div className="p-6 md:p-8">
        <DashboardHeader />
        <EmptyState />
      </div>
    )
  }

  const { active, draft, closed } = groupByStatus(votes)
  const totalSubmissions = votes.reduce((sum, v) => sum + v.submissionCount, 0)

  return (
    <div className="p-6 md:p-8 space-y-7">
      <DashboardHeader />

      {/* Stats row */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <StatCell label="Total" value={votes.length} />
          <StatCell label="Active" value={active.length} accent={active.length > 0} />
          <StatCell label="Submissions" value={totalSubmissions} />
          <StatCell label="Drafts" value={draft.length} />
        </div>
      </div>

      {/* Vote card groups */}
      {active.length > 0 && <VoteSection title="Active" votes={active} />}
      {draft.length  > 0 && <VoteSection title="Drafts" votes={draft}  />}
      {closed.length > 0 && <VoteSection title="Closed" votes={closed} />}
    </div>
  )
}

function DashboardHeader() {
  const { openDrawer } = useVoteDrawer()
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">My Votes</h1>
        <p className="text-[13.5px] text-muted-foreground mt-0.5">Create and manage your voting events.</p>
      </div>
      <Button onClick={() => openDrawer()} className="gap-1.5 rounded-lg font-semibold shrink-0">
        <Plus data-icon="inline-start" />
        New Vote
      </Button>
    </div>
  )
}

function StatCell({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="px-5 py-4">
      <p className={cn(
        'text-[24px] font-bold tabular-nums tracking-tight leading-none',
        accent ? 'text-emerald-500' : 'text-foreground'
      )}>
        {value}
      </p>
      <p className="text-[11.5px] font-medium text-muted-foreground mt-1.5 uppercase tracking-wide">
        {label}
      </p>
    </div>
  )
}

function VoteSection({ title, votes }: { title: string; votes: Doc<'votes'>[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-semibold text-muted-foreground">{title}</span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground/60 tabular-nums">{votes.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {votes.map((vote) => (
          <VoteCard key={vote._id} vote={vote} />
        ))}
      </div>
    </section>
  )
}

function VoteCard({ vote }: { vote: Doc<'votes'> }) {
  const cfg = STATUS_CONFIG[vote.status]
  const ac  = vote.accessControl

  const accessBadges = [
    ac.geoEnabled       && { icon: MapPin, label: 'Geo-fenced' },
    ac.timeWindowEnabled && { icon: Clock,  label: 'Timed' },
    ac.otpRequired      && { icon: Phone,  label: 'OTP' },
    ac.inviteOnly       && { icon: Lock,   label: 'Invite only' },
  ].filter(Boolean) as { icon: React.ElementType; label: string }[]

  return (
    <Link
      href={`/dashboard/votes/${vote._id}`}
      className="group flex flex-col bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-[0_2px_8px_oklch(0_0_0/0.08)] transition-all duration-150 min-h-[160px]"
    >
      {/* Top row: status chip + access badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={cn(
          'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full',
          cfg.chipCn
        )}>
          <span className={cn('size-1.5 rounded-full', cfg.dot)} />
          {cfg.label}
        </span>
        <div className="flex items-center gap-1 flex-wrap">
          {accessBadges.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 text-[10.5px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
            >
              <Icon className="h-2.5 w-2.5" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Title + description */}
      <div className="mt-3 flex-1">
        <p className="text-[15px] font-semibold text-foreground leading-snug line-clamp-2">
          {vote.title}
        </p>
        {vote.description && (
          <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2 leading-snug">
            {vote.description}
          </p>
        )}
      </div>

      {/* Bottom: stats + arrow */}
      <div className="mt-4 pt-3.5 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[15px] font-bold text-foreground tabular-nums leading-none">
              {vote.submissionCount}
            </p>
            <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-none">
              {vote.submissionCount === 1 ? 'ballot' : 'ballots'}
            </p>
          </div>
          <p className="text-[11.5px] text-muted-foreground">
            {formatDate(vote._creationTime)}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
      </div>
    </Link>
  )
}

function EmptyState() {
  const { openDrawer } = useVoteDrawer()
  return (
    <div className="mt-20 flex flex-col items-center text-center gap-5">
      <div className="size-14 rounded-2xl border border-dashed border-border flex items-center justify-center">
        <FileText className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <div className="space-y-1">
        <h2 className="text-[15px] font-semibold text-foreground">No votes yet</h2>
        <p className="text-[13.5px] text-muted-foreground max-w-[260px]">
          Create your first voting event and share a ballot link with attendees.
        </p>
      </div>
      <Button onClick={() => openDrawer()} className="gap-1.5 rounded-lg font-semibold">
        <Plus data-icon="inline-start" />
        Create your first vote
      </Button>
    </div>
  )
}
