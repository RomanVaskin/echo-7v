'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export type HeroVideoSource = { src: string; type: string }

/**
 * - `scrub`: the video position follows the scroll (desktop, fine pointer).
 * - `loop`: muted autoplay with parallax — touch devices, or when seeking proves too slow.
 * - `still`: poster only — no video file, reduced motion or data saver.
 */
type Mode = 'scrub' | 'loop' | 'still'

const SLOW_SEEK_MS = 350
const SLOW_SEEKS_BEFORE_FALLBACK = 3

function pickMode(hasVideo: boolean): Mode {
  if (!hasVideo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'still'
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return 'still'
  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) return 'loop'
  return 'scrub'
}

export function HeroScene({
  sources,
  poster,
  posterAlt,
  children,
}: {
  sources: HeroVideoSource[]
  poster: string
  posterAlt: string
  children: React.ReactNode
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<Mode>('still')

  useEffect(() => {
    setMode(pickMode(sources.length > 0))
  }, [sources.length])

  // Scroll progress drives a CSS variable (and, in `scrub` mode, the video time) without React re-renders.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let target = 0
    let current = 0
    let frame = 0
    let seekStartedAt = 0
    let slowSeeks = 0

    const tick = () => {
      frame = 0
      current += (target - current) * 0.12
      if (Math.abs(target - current) < 0.0005) current = target
      section.style.setProperty('--hero-p', current.toFixed(4))

      const video = videoRef.current
      if (video && mode === 'scrub' && video.duration && !video.seeking) {
        const time = current * Math.max(video.duration - 0.05, 0)
        if (Math.abs(time - video.currentTime) > 1 / 60) {
          seekStartedAt = performance.now()
          video.currentTime = time
        }
      }
      if (video && mode === 'loop') {
        if (current >= 0.999) video.pause()
        else if (video.paused) video.play().catch(() => {})
      }

      if (current !== target || (mode === 'scrub' && video?.seeking)) frame = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      target = Math.min(Math.max(window.scrollY / (section.offsetHeight || 1), 0), 1)
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const video = videoRef.current
    const onSeeked = () => {
      if (performance.now() - seekStartedAt > SLOW_SEEK_MS && ++slowSeeks >= SLOW_SEEKS_BEFORE_FALLBACK) setMode('loop')
    }
    const onReady = () => {
      if (video) video.dataset.ready = 'true'
      onScroll()
    }
    const onError = () => setMode('still')

    video?.addEventListener('seeked', onSeeked)
    video?.addEventListener('loadeddata', onReady)
    video?.addEventListener('error', onError)
    if (video && video.readyState >= 2) onReady()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      video?.removeEventListener('seeked', onSeeked)
      video?.removeEventListener('loadeddata', onReady)
      video?.removeEventListener('error', onError)
    }
  }, [mode])

  return (
    <section ref={sectionRef} className="relative flex h-svh min-h-[560px] flex-col overflow-hidden">
      <div className="hero-media absolute inset-0">
        <Image src={poster} alt={posterAlt} fill priority sizes="100vw" className="object-cover" />
        {mode !== 'still' && (
          <video
            key={mode}
            ref={videoRef}
            className="hero-video absolute inset-0 size-full object-cover"
            poster={poster}
            muted
            playsInline
            preload="auto"
            autoPlay={mode === 'loop'}
            loop={mode === 'loop'}
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
          >
            {sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background" />
      {children}
    </section>
  )
}
