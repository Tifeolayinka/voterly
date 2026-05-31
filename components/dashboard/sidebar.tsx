'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, Plus, Vote } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'My Votes', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/create', label: 'Create Vote', icon: Plus, exact: false },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Vote className="h-5 w-5 text-primary" />
        <span className="font-bold text-base tracking-tight">Votely</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-border flex items-center gap-3">
        <UserButton  />
        <span className="text-sm text-muted-foreground truncate">Account</span>
      </div>
    </aside>
  )
}

export function MobileTopBar() {
  const pathname = usePathname()

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Vote className="h-5 w-5 text-primary" />
        <span className="font-bold text-base tracking-tight">Votely</span>
      </Link>
      <div className="flex items-center gap-3">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'p-2 rounded-md transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
              aria-label={item.label}
            >
              <item.icon className="h-4 w-4" />
            </Link>
          )
        })}
        <UserButton  />
      </div>
    </header>
  )
}
