'use client'

import { Suspense, lazy, useEffect, useRef, useState } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-black">
          <span className="loader" />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}

interface SplineSceneLazyProps extends SplineSceneProps {
  /** Unmount WebGL when scrolled out of view to free GPU memory */
  unmountWhenHidden?: boolean
  /** Delay before first load (ms) — spreads startup work in dev */
  loadDelay?: number
}

/**
 * Loads Spline only when the section is near the viewport.
 * Unmounts when scrolled away so only one WebGL context runs at a time.
 */
export function SplineSceneLazy({
  scene,
  className,
  unmountWhenHidden = true,
  loadDelay = 0,
}: SplineSceneLazyProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(loadDelay === 0)

  useEffect(() => {
    if (loadDelay <= 0) return
    const timer = window.setTimeout(() => setReady(true), loadDelay)
    return () => window.clearTimeout(timer)
  }, [loadDelay])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        } else if (unmountWhenHidden) {
          setVisible(false)
        }
      },
      { rootMargin: '120px', threshold: 0.05 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [unmountWhenHidden])

  const shouldRender = ready && visible

  return (
    <div ref={ref} className={className ?? 'w-full h-full'}>
      {shouldRender ? (
        <SplineScene scene={scene} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <span className="loader" />
        </div>
      )}
    </div>
  )
}
