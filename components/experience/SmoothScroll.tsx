"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/components/three/utils/usePrefersReducedMotion";

/* Tweakable: how heavy the smooth scroll feels. Lower = smoother and slower to settle. */
const SCROLL_LERP = 0.085;

let lenis: Lenis | null = null;

/**
 * Scrolls to a section by id, smoothly when Lenis is running, instantly
 * otherwise (reduced motion).
 */
export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  if (lenis) lenis.scrollTo(element, { duration: 1.8 });
  else element.scrollIntoView();
}

/**
 * Inertial page scrolling, kept in sync with GSAP ScrollTrigger. Off for
 * visitors who prefer reduced motion; touch screens keep native scrolling
 * (Lenis only smooths mouse-wheel scrolling by default).
 */
export function SmoothScroll() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reducedMotion) return;

    const instance = new Lenis({ lerp: SCROLL_LERP, wheelMultiplier: 0.9 });
    lenis = instance;
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, [reducedMotion]);

  return null;
}
