'use client'

import { createContext, useContext } from 'react'
import type { Id } from '@/convex/_generated/dataModel'

interface VoteDrawerCtx {
  openDrawer: (editVoteId?: Id<'votes'>) => void
}

export const VoteDrawerContext = createContext<VoteDrawerCtx>({ openDrawer: () => {} })

export function useVoteDrawer() {
  return useContext(VoteDrawerContext)
}
