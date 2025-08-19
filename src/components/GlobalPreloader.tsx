"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import LoadingSpinner from './LoadingSpinner'
import { getNetworkCount, onNetworkChange } from '@/lib/networkActivity'

export default function GlobalPreloader() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [netCount, setNetCount] = useState(0)

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleStop = () => setLoading(false)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)
    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router.events])
  useEffect(() => {
    setNetCount(getNetworkCount())
    const unsub = onNetworkChange((c) => setNetCount(c))
    return () => { unsub() }
  }, [])

  if (!loading && netCount === 0) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="text-xl font-semibold tracking-wide">ProtekAuto</div>
        <LoadingSpinner size="lg" text="" />
      </div>
    </div>
  )
}
