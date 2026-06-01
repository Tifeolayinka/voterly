'use client'

import { createContext, useContext } from 'react'

interface VoteDrawerCtx {
  openDrawer: () => void
}

export const VoteDrawerContext = createContext<VoteDrawerCtx>({ openDrawer: () => {} })

export function useVoteDrawer() {
  return useContext(VoteDrawerContext)
}
