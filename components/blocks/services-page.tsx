'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { NavbarModernBlock } from './navbar-modern';
import { Footer } from './agency-landing';
import { GsapScrollProvider } from '@/components/animations/gsap-scroll-provider';
import { MarqueeTicker } from '@/components/animations/marquee-ticker';
import { ServicesChannelList } from './services-channels';
import { ExpandButton } from '@/components/ui/expand-button';

const TICKER_ITEMS = [
  'YAAS: YOUTUBE AS A SERVICE',
  'MICROCONTENT MASTERY',
  'ROI-DRIVEN AD CAMPAIGNS',
  'AI AUTOMATION',
  'SOCIAL MEDIA MARKETING',
  'PERFORMANCE MARKETING',
];

function ServicesHero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper pb-14 pt-12 md:pb-20 md:pt-16">
      {/* Faint scanline texture — broadcast/monitor atmosphere, kept subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #0B1A2B 0px, #0B1A2B 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className="container relative z-10 mx-auto max-w-5xl px-4 text-center md:px-8">
        <p id="hero-tagline" className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-muted">
          PUSHWebb / Services
        </p>
        <h1
          id="hero-headline"
          className="mx-auto max-w-3xl font-display font-medium leading-[1.03] tracking-[-1.5px] text-ink text-[clamp(2.25rem,6vw,4.25rem)]"
        >
          Services Built Around How Brands Grow Today
        </h1>
        <div id="hero-services" className="mx-auto mt-6 max-w-xl space-y-3">
          <p className="text-sm leading-relaxed text-ink-soft md:text-base">
            From YouTube and microcontent to social media and AI-powered workflows, PUSHWebb brings strategy,
            execution, and performance together under one roof.
          </p>
          <p className="text-sm leading-relaxed text-ink-soft md:text-base">
            Whether you need one focused service or a connected marketing system, we work around your vision.
          </p>
        </div>
        <div id="hero-cta" className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="/contact"
            className="inline-flex h-[54px] select-none items-center justify-center gap-2.5 rounded-lg bg-ink hover:bg-ink/90 px-8 text-sm font-semibold text-paper no-underline transition-all duration-200 active:scale-[0.97]"
          >
            Book a Strategy Call
            <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
          </a>
          <ExpandButton href="#services" label="Explore Our Work" />
        </div>
      </div>
    </section>
  );
}

function ServicesIntro() {
  return (
    <section id="services" className="reveal-section relative bg-paper py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4 text-center md:px-8">
        <p className="anim-eyebrow eyebrow mb-3">What We Do</p>
        <h2 className="split-h2 mb-6 font-display text-3xl leading-[1.08] tracking-[-1.5px] text-ink sm:text-4xl md:text-5xl">
          Different Services, Only One Goal: Growth.
        </h2>
        <div className="reveal-stagger space-y-4">
          <p className="text-sm leading-relaxed text-ink-soft md:text-base">
            Every brand has different challenges. Some need stronger content. Some need better distribution.
            Others need more structure behind the way their marketing operates.
          </p>
          <p className="text-sm leading-relaxed text-ink-soft md:text-base">
            Our services are designed to solve those challenges without adding unnecessary complexity.
          </p>
        </div>
      </div>
    </section>
  );
}

function ServicesFinalCTA() {
  return (
    <section className="reveal-section relative overflow-hidden border-t border-line bg-paper py-16 md:py-36">
      <div className="container relative z-10 mx-auto max-w-3xl px-4 text-center md:px-8">
        <p className="anim-eyebrow eyebrow mb-5">Ready to Build Something Together?</p>
        <h2 className="split-h2 mb-8 font-display text-3xl leading-[1.08] tracking-[-1.5px] text-ink sm:text-4xl md:text-5xl">
          Pick the Right Services. We&apos;ll Make Them Work as One.
        </h2>
        <a
          href="/contact"
          className="group inline-flex items-center justify-center gap-2 rounded-lg bg-ink hover:bg-ink/90 px-8 py-3.5 text-sm font-semibold text-paper no-underline transition-all duration-200 active:scale-[0.98]"
        >
          <span>Book a Strategy Call</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}

export function ServicesPage() {
  return (
    <div className="bg-paper">
      <GsapScrollProvider />
      <NavbarModernBlock />
      <ServicesHero />
      <MarqueeTicker items={TICKER_ITEMS} />
      <ServicesIntro />
      <ServicesChannelList />
      <ServicesFinalCTA />
      <Footer />
    </div>
  );
}
