"use client"

import { useState, useEffect } from "react"

const WORDS = ["churches", "schools", "live events", "communities", "organisations"]

export function HeroCyclingWord() {
  const [index, setIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % WORDS.length)
      setAnimKey(k => k + 1)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <span key={animKey} className="hero-word-enter italic">
      {WORDS[index]}
    </span>
  )
}
