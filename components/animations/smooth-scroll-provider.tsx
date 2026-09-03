'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, useLenis } from 'lenis/react';
// Required by Lenis: resets the html/body height and scroll-behavior its
// virtual scrolling depends on. Nothing was importing it.
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Mounts the single, app-wide Lenis instance once in the root layout, so it
 * survives client-side navigation instead of being torn down and rebuilt per
 * page. Lenis drives native window scrolling (no wrapper/content divs) and
 * defers its rAF loop to GSAP's ticker — see LenisGsapBridge below.
 *
 * The app renders as `children` of this provider: everything that calls
 * `useLenis()` has to sit inside it.
 */
export function SmoothScrollProvider({ children }: { children?: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        anchors: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <LenisGsapBridge />
      <RouteChangeScrollReset />
      {children}
    </ReactLenis>
  );
}

/**
 * Lenis runs with `autoRaf: false`, so something has to call `lenis.raf()`
 * every frame or the page stops scrolling outright. That job belongs here,
 * next to the instance, rather than in a page-level animation component —
 * otherwise any route that doesn't mount that component freezes the page.
 * Feeding Lenis's scroll events into ScrollTrigger keeps triggers reading the
 * already-smoothed position.
 */
function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const syncScrollTrigger = () => ScrollTrigger.update();
    lenis.on('scroll', syncScrollTrigger);

    const driveLenis = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(driveLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', syncScrollTrigger);
      gsap.ticker.remove(driveLenis);
    };
  }, [lenis]);

  return null;
}

/** Keeps Lenis's virtual scroll state in sync when a client-side route change resets the page to the top. */
function RouteChangeScrollReset() {
  const lenis = useLenis();
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  return null;
}
