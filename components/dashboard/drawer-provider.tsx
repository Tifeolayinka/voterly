'use client'

import { useState } from 'react'
import { VoteDrawerContext } from './vote-drawer-context'
import { CreateVoteDrawer } from './create-vote-drawer'
import type { Id } from '@/convex/_generated/dataModel'

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen]               = useState(false)
  const [editVoteId, setEditVoteId]   = useState<Id<'votes'> | null>(null)

  function openDrawer(voteId?: Id<'votes'>) {
    setEditVoteId(voteId ?? null)
    setOpen(true)
  }

  return (
    <VoteDrawerContext.Provider value={{ openDrawer }}>
      {children}
      <CreateVoteDrawer
        open={open}
        onClose={() => setOpen(false)}
        editVoteId={editVoteId}
      />
    </VoteDrawerContext.Provider>
  )
}
