'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle2, Clock, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Doc } from '@/convex/_generated/dataModel'

const STATUS_CONFIG: Record<
  Doc<'votes'>['status'],
  { label: string; dot: string; text: string }
> = {
  draft:  { label: 'Draft',  dot: 'bg-slate-300',   text: 'text-slate-500' },
  active: { label: 'Active', dot: 'bg-emerald-500',  text: 'text-emerald-600' },
  closed: { label: 'Closed', dot: 'bg-slate-300',    text: 'text-slate-400' },
}

function groupByStatus(votes: Doc<'votes'>[]) {
  return {
    active: votes.filter((v) => v.status === 'active'),
    draft:  votes.filter((v) => v.status === 'draft'),
    closed: votes.filter((v) => v.status === 'closed'),
  }
}

export default function DashboardPage() {
  const votes = useQuery(api.votes.getVotesByOrganiser)
  const isLoading = votes === undefined

  if (isLoading) {
    return (
      <div className="p-8 md:p-10 space-y-6 max-w-3xl">
        <DashboardHeader />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (votes.length === 0) {
    return (
      <div className="p-8 md:p-10 max-w-3xl">
        <DashboardHeader />
        <EmptyState />
      </div>
    )
  }

  const { active, draft, closed } = groupByStatus(votes)

  return (
    <div className="p-8 md:p-10 space-y-8 max-w-3xl">
      <DashboardHeader />
      {active.length > 0 && <VoteSection title="Active" votes={active} />}
      {draft.length > 0  && <VoteSection title="Drafts" votes={draft}  />}
      {closed.length > 0 && <VoteSection title="Closed" votes={closed} />}
    </div>
  )
}

function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Votes</h1>
        <p className="text-slate-400 text-sm mt-0.5">Create and manage your voting events.</p>
      </div>
      <Button
        render={<Link href="/dashboard/create" />}
        nativeButton={false}
        className="gap-1.5 rounded-lg font-semibold shadow-sm"
      >
        <Plus className="h-4 w-4" />
        New Vote
      </Button>
    </div>
  )
}

function VoteSection({ title, votes }: { title: string; votes: Doc<'votes'>[] }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">
        {title}
      </h2>
      <div className="space-y-1.5">
        {votes.map((vote) => (
          <VoteRow key={vote._id} vote={vote} />
        ))}
      </div>
    </section>
  )
}

function VoteRow({ vote }: { vote: Doc<'votes'> }) {
  const cfg = STATUS_CONFIG[vote.status]
  return (
    <Link
      href={`/dashboard/votes/${vote._id}`}
      className="group flex items-center justify-between px-4 py-3.5 rounded-xl border border-slate-100 bg-white hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={cn('size-2 rounded-full shrink-0', cfg.dot)} />
        <span className="font-medium text-slate-800 truncate">{vote.title}</span>
        <span className={cn('text-xs font-medium hidden sm:block', cfg.text)}>{cfg.label}</span>
      </div>
      <div className="flex items-center gap-4 shrink-0 ml-4">
        <span className="text-sm text-slate-400">
          {vote.submissionCount} vote{vote.submissionCount !== 1 ? 's' : ''}
        </span>
        <span className="text-xs font-medium text-slate-400 group-hover:text-primary transition-colors">
          View →
        </span>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center gap-5">
      <div className="size-14 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
        <FileText className="h-6 w-6 text-slate-300" />
      </div>
      <div>
        <h2 className="font-semibold text-slate-800">No votes yet</h2>
        <p className="text-slate-400 text-sm mt-1">Create your first voting event to get started.</p>
      </div>
      <Button
        render={<Link href="/dashboard/create" />}
        nativeButton={false}
        className="gap-1.5 rounded-lg font-semibold shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Create your first vote
      </Button>
    </div>
  )
}
