'use client'

import { useState } from 'react'
import { VoteDrawerContext } from './vote-drawer-context'
import { CreateVoteDrawer } from './create-vote-drawer'

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <VoteDrawerContext.Provider value={{ openDrawer: () => setOpen(true) }}>
      {children}
      <CreateVoteDrawer open={open} onClose={() => setOpen(false)} />
    </VoteDrawerContext.Provider>
  )
}
