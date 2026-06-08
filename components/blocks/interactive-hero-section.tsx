'use client';

import React from 'react';
import { SplineSceneLazy } from '@/components/ui/splite';
import { ExpandButton } from '@/components/ui/expand-button';
import { ArrowRight, ChevronDown } from 'lucide-react';

export function InteractiveHeroSection() {
  const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

  return (
    <section className="noise-overlay relative w-full h-[100svh] max-h-[960px] overflow-hidden bg-black">

      {/* Robot */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: 'translateY(-12%) scale(1.12)', transformOrigin: 'top center' }}
      >
        <SplineSceneLazy
          scene={ROBOT_SCENE_URL}
          className="absolute inset-0 w-full h-full"
          unmountWhenHidden
          loadDelay={process.env.NODE_ENV === 'development' ? 1500 : 0}
        />
      </div>

      {/* Gradient sandwich */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: '30%', background: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.75) 55%, transparent 100%)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: '55%', background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.92) 50%, transparent 100%)' }}
      />

      <div className="hero-scan-line absolute inset-x-0 z-10 pointer-events-none" />

      {/* HUD corners */}
      {[
        'M2 14 L2 2 L14 2',
        'M26 14 L26 2 L14 2',
        'M2 14 L2 26 L14 26',
        'M26 14 L26 26 L14 26',
      ].map((d, i) => (
        <div
          key={i}
          className={`absolute z-20 pointer-events-none opacity-30 ${
            i === 0 ? 'top-4 left-4' :
            i === 1 ? 'top-4 right-4' :
            i === 2 ? 'bottom-4 left-4' :
                      'bottom-4 right-4'
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d={d} stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ))}

      <div className="absolute top-5 left-14 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 opacity-35">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[8px] font-body tracking-[0.3em] uppercase text-white/50">Live</span>
      </div>

      <div className="absolute bottom-0 right-0 w-36 h-10 bg-black z-30" />

      <div className="absolute top-6 inset-x-0 z-20 flex justify-center pointer-events-none px-4">
        <p id="hero-tagline" className="eyebrow text-center">
          BellOps &mdash; Digital Growth Agency
        </p>
      </div>

      <div className="absolute bottom-6 sm:bottom-8 inset-x-0 z-20 flex flex-col items-center px-4 text-center">

        <h1
          id="hero-headline"
          className="font-display font-bold text-white text-glow leading-[0.95] tracking-[-0.04em] max-w-2xl mx-auto mb-2 text-[clamp(2.5rem,6.5vw,5rem)]"
        >
          We grow businesses
        </h1>

        <p
          id="hero-services"
          className="font-body text-white/45 max-w-xs sm:max-w-sm mx-auto mb-7 tracking-[0.2em] uppercase text-[clamp(0.65rem,1.4vw,0.78rem)] font-medium"
        >
          Social &nbsp;·&nbsp; Web &nbsp;·&nbsp; SEO &nbsp;·&nbsp; Design &nbsp;·&nbsp; Video
        </p>

        {/* CTA row — no magnetic pull */}
        <div id="hero-cta" className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6">

          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2.5 h-[54px] px-8 rounded-full no-underline select-none font-semibold text-sm text-black transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.35)] active:scale-[0.97]"
            style={{
              background: '#ffffff',
              boxShadow: '0 8px 32px rgba(255,255,255,0.12)',
            }}
          >
            Start Your Project
            <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
          </a>

          <ExpandButton href="#work" label="See Our Work" />

        </div>

        <div id="hero-scroll" className="flex flex-col items-center gap-1 pointer-events-none">
          <p className="text-white/20 text-[9px] tracking-[0.35em] uppercase font-medium">
            Scroll to explore
          </p>
          <ChevronDown className="w-3 h-3 text-white/20 animate-bounce" />
        </div>

      </div>
    </section>
  );
}
