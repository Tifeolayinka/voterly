'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, Plus, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'My Votes', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/create', label: 'New Vote', icon: Plus, exact: false },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-slate-100 bg-white shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-[15px] tracking-tight text-slate-900">Votely</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/8 text-primary font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-100 flex items-center gap-3">
        <UserButton />
        <span className="text-sm text-slate-400 truncate">Account</span>
      </div>
    </aside>
  )
}

export function MobileTopBar() {
  const pathname = usePathname()

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-[15px] tracking-tight text-slate-900">Votely</span>
      </Link>
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'p-2 rounded-lg transition-colors',
                active
                  ? 'bg-primary/8 text-primary'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              )}
              aria-label={item.label}
            >
              <item.icon className="h-4 w-4" />
            </Link>
          )
        })}
        <UserButton />
      </div>
    </header>
  )
}
