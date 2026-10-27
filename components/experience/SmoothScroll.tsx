"use client";

import { useEffect } from "react";
import "./lenis.css";
import { usePrefersReducedMotion } from "@/components/three/utils/usePrefersReducedMotion";
import { setLenis } from "./scroll-control";

/* Tweakable: how heavy the smooth scroll feels. Lower = smoother and slower to settle. */
const SCROLL_LERP = 0.085;

/**
 * Inertial page scrolling, kept in sync with GSAP ScrollTrigger. Off for
 * visitors who prefer reduced motion; touch screens keep native scrolling
 * (Lenis only smooths mouse-wheel scrolling by default). Lenis and GSAP load
 * in their own chunk after the page has rendered, so they never weigh on its
 * first load; until then the page scrolls natively.
 */
export function SmoothScroll() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void Promise.all([
      import("lenis"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: Lenis }, { default: gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const instance = new Lenis({ lerp: SCROLL_LERP, wheelMultiplier: 0.9 });
      setLenis(instance);
      instance.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanup = () => {
        gsap.ticker.remove(tick);
        instance.destroy();
        setLenis(null);
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reducedMotion]);

  return null;
}
