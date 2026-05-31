'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Vote } from 'lucide-react'
import type { Doc } from '@/convex/_generated/dataModel'

const STATUS_LABELS: Record<Doc<'votes'>['status'], string> = {
  draft: 'Draft',
  active: 'Active',
  closed: 'Closed',
}

const STATUS_VARIANTS: Record<
  Doc<'votes'>['status'],
  'secondary' | 'default' | 'outline'
> = {
  draft: 'secondary',
  active: 'default',
  closed: 'outline',
}

function groupByStatus(votes: Doc<'votes'>[]) {
  return {
    active: votes.filter((v) => v.status === 'active'),
    draft: votes.filter((v) => v.status === 'draft'),
    closed: votes.filter((v) => v.status === 'closed'),
  }
}

export default function DashboardPage() {
  const votes = useQuery(api.votes.getVotesByOrganiser)
  const isLoading = votes === undefined

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 space-y-6">
        <DashboardHeader />
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (votes.length === 0) {
    return (
      <div className="p-6 md:p-10 space-y-6">
        <DashboardHeader />
        <EmptyState />
      </div>
    )
  }

  const { active, draft, closed } = groupByStatus(votes)

  return (
    <div className="p-6 md:p-10 space-y-8">
      <DashboardHeader />
      {active.length > 0 && <VoteSection title="Active" votes={active} />}
      {draft.length > 0 && <VoteSection title="Draft" votes={draft} />}
      {closed.length > 0 && <VoteSection title="Closed" votes={closed} />}
    </div>
  )
}

function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Votes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create and manage your voting events.
        </p>
      </div>
      <Button render={<Link href="/dashboard/create" />} nativeButton={false}>
        <Plus className="h-4 w-4" />
        Create Vote
      </Button>
    </div>
  )
}

function VoteSection({
  title,
  votes,
}: {
  title: string
  votes: Doc<'votes'>[]
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid gap-2">
        {votes.map((vote) => (
          <VoteRow key={vote._id} vote={vote} />
        ))}
      </div>
    </section>
  )
}

function VoteRow({ vote }: { vote: Doc<'votes'> }) {
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          <Badge variant={STATUS_VARIANTS[vote.status]}>
            {STATUS_LABELS[vote.status]}
          </Badge>
          <span className="font-medium truncate">{vote.title}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <span className="text-sm text-muted-foreground">
            {vote.submissionCount} vote{vote.submissionCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href={`/dashboard/votes/${vote._id}`} />}
            nativeButton={false}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="rounded-full bg-muted p-4">
        <Vote className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h2 className="font-semibold text-lg">No votes yet</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Create your first vote to get started.
        </p>
      </div>
      <Button render={<Link href="/dashboard/create" />} nativeButton={false}>
        <Plus className="h-4 w-4" />
        Create Vote
      </Button>
    </div>
  )
}
