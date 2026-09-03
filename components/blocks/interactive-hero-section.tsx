'use client';

import React from 'react';
import { SplineSceneLazy } from '@/components/ui/splite';
import { ExpandButton } from '@/components/ui/expand-button';
import { ArrowRight } from 'lucide-react';

const ROBOT_SCENE_URL = 'https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode';

export function InteractiveHeroSection() {
  return (
    <section className="on-dark relative w-full min-h-[100svh] overflow-hidden bg-black">

      {/* Robot — the scene's own lighting, rotated into blue */}
      <div
        className="robot-tint absolute inset-0 z-10 pointer-events-auto"
        style={{ transform: 'translateY(-12%) scale(1.15)', transformOrigin: 'top center' }}
      >
        <SplineSceneLazy
          scene={ROBOT_SCENE_URL}
          className="absolute inset-0 w-full h-full"
          unmountWhenHidden
          loadDelay={process.env.NODE_ENV === 'development' ? 1500 : 0}
        />

        {/* Rides with the canvas, so it stays over the badge at any height */}
        <div aria-hidden className="spline-badge-cover absolute bottom-0 right-0 z-50 h-20 w-60" />
      </div>

      {/* Corner blobs, painted ABOVE the canvas. Their centres sit outside the
          frame so no bright core lands on screen, and running them over the top
          means the badge patch below picks up the identical wash — the patch
          can't read as a black rectangle against its own background. Nothing
          lands behind the figure: the middle of this layer is transparent. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            'radial-gradient(58% 48% at -6% -8%, rgba(30, 64, 150, 0.42) 0%, transparent 70%), radial-gradient(58% 48% at 106% -8%, rgba(26, 56, 132, 0.34) 0%, transparent 70%), radial-gradient(60% 48% at -6% 108%, rgba(22, 48, 116, 0.30) 0%, transparent 72%), radial-gradient(60% 48% at 106% 108%, rgba(26, 56, 132, 0.32) 0%, transparent 72%)',
        }}
      />

      {/* Content */}
      <div className="relative z-30 flex min-h-[100svh] flex-col justify-between px-6 pb-10 pt-24 sm:px-12 sm:pb-14 sm:pt-28">

        {/* Top rail */}
        <div className="flex items-start justify-between gap-4">
          <p id="hero-tagline" className="eyebrow max-w-[14rem] sm:max-w-none">
            PUSHWebb &mdash; Content. Creative. Performance. AI.
          </p>
          <div className="hidden text-right sm:block">
            <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">Operating from</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">India &middot; Dubai</p>
          </div>
        </div>

        {/* Bottom stack — pointer events off so the robot stays draggable behind it */}
        <div className="pointer-events-none flex flex-col items-center text-center">
          <h1
            id="hero-headline"
            className="mx-auto mb-6 max-w-4xl text-[clamp(2.1rem,6.4vw,4.6rem)] leading-[0.92] tracking-[-0.02em] text-ink"
          >
            We Turn Content<br className="hidden sm:block" /> Into Business Growth.
          </h1>

          <div id="hero-cta" className="pointer-events-auto flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="/contact"
              className="inline-flex h-[54px] select-none items-center justify-center gap-2.5 rounded-lg bg-ink px-8 text-sm font-semibold text-paper no-underline transition-all duration-200 hover:bg-accent hover:text-paper active:scale-[0.97]"
            >
              Book a Brainstorming Call
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </a>

            <ExpandButton href="#case-studies" label="Explore Our Work" />
          </div>
        </div>
      </div>
    </section>
  );
}
