'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { LayoutDashboard, Plus, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVoteDrawer } from './vote-drawer-context'

export function DashboardSidebar() {
  const pathname      = usePathname()
  const { user }      = useUser()
  const { openDrawer } = useVoteDrawer()
  const votes         = useQuery(api.votes.getVotesByOrganiser)

  const counts = {
    active: votes?.filter((v) => v.status === 'active').length ?? 0,
    draft:  votes?.filter((v) => v.status === 'draft').length  ?? 0,
    closed: votes?.filter((v) => v.status === 'closed').length ?? 0,
  }

  const isOnDashboard = pathname === '/dashboard'

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-slate-100 bg-[oklch(0.985_0.005_255)] shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-slate-100 shrink-0">
        <div className="size-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-[15px] tracking-tight text-slate-900">Votely</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* Votes section */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 px-3 pb-1.5">Votes</p>

          <Link
            href="/dashboard"
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors',
              isOnDashboard
                ? 'bg-primary/[0.08] text-primary'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            )}
          >
            <span className="flex items-center gap-2.5">
              <LayoutDashboard className="h-[15px] w-[15px] shrink-0" />
              My Votes
            </span>
            {votes !== undefined && (
              <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                {votes.length}
              </span>
            )}
          </Link>

          {/* Status sub-items */}
          <div className="mt-0.5 pl-[18px] space-y-px">
            {([
              { label: 'Active', count: counts.active, dot: 'bg-emerald-500' },
              { label: 'Draft',  count: counts.draft,  dot: 'bg-slate-300' },
              { label: 'Closed', count: counts.closed, dot: 'bg-slate-200' },
            ] as const).map(({ label, count, dot }) => (
              <div
                key={label}
                className="flex items-center justify-between px-3 py-[5px] rounded-md"
              >
                <span className="flex items-center gap-2">
                  <span className={cn('size-[6px] rounded-full shrink-0', dot)} />
                  <span className="text-[12.5px] text-slate-500">{label}</span>
                </span>
                <span className={cn(
                  'text-[11px] tabular-nums font-medium',
                  count > 0 ? 'text-slate-500' : 'text-slate-300'
                )}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions section */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 px-3 pb-1.5">Actions</p>
          <button
            onClick={openDrawer}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors text-left"
          >
            <Plus className="h-[15px] w-[15px] shrink-0" />
            New Vote
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-3.5 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <UserButton />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.firstName ?? 'Account'}
            </p>
            <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
              {user?.primaryEmailAddress?.emailAddress ?? ''}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function MobileTopBar() {
  const pathname       = usePathname()
  const { openDrawer } = useVoteDrawer()
  const isOnDashboard  = pathname === '/dashboard'

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white h-14 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-[15px] tracking-tight text-slate-900">Votely</span>
      </Link>
      <div className="flex items-center gap-1.5">
        <Link
          href="/dashboard"
          className={cn(
            'p-2 rounded-lg transition-colors',
            isOnDashboard
              ? 'bg-primary/[0.08] text-primary'
              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
          )}
          aria-label="My Votes"
        >
          <LayoutDashboard className="h-4 w-4" />
        </Link>
        <button
          onClick={openDrawer}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          aria-label="New Vote"
        >
          <Plus className="h-4 w-4" />
        </button>
        <UserButton />
      </div>
    </header>
  )
}
