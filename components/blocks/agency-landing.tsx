"use client";

import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  Layers,
  Rocket,
  TrendingUp,
  Users,
  Workflow,
  Sparkles,
  MapPin,
  Plus,
  Minus,
} from 'lucide-react';
import { InteractiveHeroSection } from './interactive-hero-section';
import { NavbarModernBlock } from './navbar-modern';
import { GsapScrollProvider } from '@/components/animations/gsap-scroll-provider';
import { MarqueeTicker } from '@/components/animations/marquee-ticker';
import { WhatWeDoSection } from './services-scroll-section';
import { Footer as SiteFooter } from './site-footer';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────
   MISSION STATEMENT — bridges the hero into What We Do
──────────────────────────────────────────────────────────────── */
function MissionSection() {
  return (
    <section className="reveal-section relative overflow-hidden border-t border-line bg-paper py-14 md:py-20">
      <div className="container mx-auto max-w-5xl px-4 relative z-10 md:px-8">
        <div className="reveal-stagger grid gap-4 md:grid-cols-5 items-stretch">
          <div className="bg-surface border border-ink/10 rounded-2xl p-6 sm:p-8 md:p-9 md:col-span-3 flex flex-col sm:flex-row gap-6 backdrop-blur-xl shadow-[0_12px_32px_-18px_rgba(11,26,43,0.24)]">
            <div className="w-full h-44 sm:w-44 sm:h-auto md:w-52 shrink-0 rounded-xl overflow-hidden border border-ink/10 relative shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=85&auto=format&fit=crop"
                alt="The PUSHWebb creative and engineering team"
                loading="lazy"
                className="w-full h-full object-cover scale-105 transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-ink/[0.06] px-3 py-0.5 text-[11px] font-medium text-ink w-fit mb-3">
                <Sparkles className="h-3 w-3 text-ink" />
                <span>MISSION</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-ink mb-3">
                We Turn Content Into Scalable Business Growth
              </h3>
              <p className="text-ink-soft text-xs sm:text-sm leading-relaxed mb-3">
                PUSHWebb is a creative and AI-powered marketing agency helping brands and creators grow through YouTube, short-form content, performance campaigns, and intelligent automation.
              </p>
              <p className="text-ink-muted text-xs leading-relaxed">
                From strategy and production to distribution and optimization, we build content systems designed to perform and scale.
              </p>
            </div>
          </div>

          <div className="relative bg-ink rounded-2xl p-6 sm:p-8 flex flex-col justify-center gap-3.5 overflow-hidden md:col-span-2 shadow-[0_12px_32px_-18px_rgba(11,26,43,0.24)]">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <span className="font-display text-xs font-medium tracking-widest text-paper/60 uppercase mb-1">
              Ready to Expand?
            </span>
            <h4 className="font-display text-xl font-medium text-paper leading-tight mb-2">
              Let&apos;s Architect Your Content Engine.
            </h4>
            <a
              href="/contact"
              className="group relative z-10 inline-flex items-center justify-center gap-2 bg-paper hover:bg-white text-ink font-semibold py-3.5 px-5 rounded-xl text-xs font-display transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Book a Brainstorming Call</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#services"
              className="group relative z-10 inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-paper font-semibold py-3 px-5 rounded-xl text-xs font-display transition-colors duration-200 hover:bg-white/20 active:scale-[0.98]"
            >
              <span>Explore Our Disciplines</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   4-STEP GROWTH FRAMEWORK
──────────────────────────────────────────────────────────────── */
const FRAMEWORK_STEPS = [
  {
    icon: Compass,
    step: '01',
    title: 'Discovery',
    tag: 'We Listen Before We Build.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80&auto=format&fit=crop',
    description:
      'Every strong strategy comes with understanding the brand behind it. We analyze goals, workflows, and audience dynamics to pinpoint the strongest growth opportunities.',
  },
  {
    icon: Layers,
    step: '02',
    title: 'Strategy & Blueprint',
    tag: 'Clarity Before Creativity.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&auto=format&fit=crop',
    description:
      'We turn research into a comprehensive growth plan across content platforms, scripting frameworks, publishing rhythms, and scalable paid acquisition funnels.',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Execution',
    tag: 'Ideas Engineered Into Impact.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80&auto=format&fit=crop',
    description:
      'From studio video production and fast-paced microcontent editing to multi-channel ad campaign launches, every deliverable is executed with relentless precision.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Optimization & Scale',
    tag: 'Growth is Never One-and-Done.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
    description:
      'We continuously analyze retention curves, conversion metrics, and algorithmic trends to scale winning creative formats and maximize ROAS over time.',
  },
];

function FrameworkSection() {
  return (
    <section id="framework" className="reveal-section relative py-16 md:py-28 overflow-hidden border-t border-line bg-paper">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-ink/[0.06] px-4 py-1 text-xs font-medium text-ink backdrop-blur-md mb-3 shadow-[inset_0_1px_0_rgba(11,26,43,0.15)]">
            <Sparkles className="h-3.5 w-3.5 text-ink" />
            <span>HOW WE WORK · 4-STEP FRAMEWORK</span>
          </div>
          <h2 className="split-h2 font-display text-3xl sm:text-4xl md:text-5xl font-medium text-ink leading-[1.08] tracking-[-1.5px] mb-4">
            AI is Changing Marketing.<br />We Help You Use It to Scale.
          </h2>
          <p className="text-ink-soft text-sm md:text-base max-w-lg mx-auto">
            A battle-tested 4-step framework engineered for consistent, compounding growth.
          </p>
        </div>

        <div className="framework-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FRAMEWORK_STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="framework-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink/10 bg-surface p-5 sm:p-6 shadow-[0_12px_32px_-18px_rgba(11,26,43,0.24)] transition-all duration-300 hover:border-ink/30 hover:bg-surface-hover"
              >
                {/* Draws across the card head as the step lands */}
                <span aria-hidden className="framework-rule absolute inset-x-0 top-0 h-px origin-left bg-accent/50" />

                <div>
                  {/* Top Step Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="framework-icon flex h-9 w-9 items-center justify-center rounded-xl border border-ink/20 bg-ink/10 text-ink">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="framework-step font-display text-2xl font-bold tracking-tight text-ink/20 group-hover:text-ink/40 transition-colors">
                      {s.step}
                    </span>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative mb-4 h-32 w-full overflow-hidden rounded-xl border border-ink/10 bg-paper-alt shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={s.title}
                      loading="lazy"
                      className="framework-thumb h-full w-full object-cover scale-105 transition-transform duration-700 ease-out group-hover:scale-115"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent opacity-60" />
                  </div>

                  <h3 className="framework-copy font-display text-lg font-medium text-ink mb-1">{s.title}</h3>
                  <p className="framework-copy text-ink/80 text-[11px] font-semibold tracking-wide uppercase mb-2">{s.tag}</p>
                </div>

                <p className="text-ink-soft text-xs leading-relaxed mt-2 pt-3 border-t border-ink/[0.08]">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrustStripSection() {
  return (
    <section className="reveal-section relative py-10 md:py-14 bg-paper border-t border-line">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <p className="anim-eyebrow eyebrow text-center mb-8">Trusted Across Brands, Creators &amp; Businesses</p>
        <div className="reveal-stagger flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pushwebb-assets/logos/client-logos-strip-flattened.png"
            alt="Brands and creators PUSHWebb has worked with"
            className="max-w-full h-auto opacity-90"
          />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   STATS — Good Work Gets Seen. Great Work Performs.
──────────────────────────────────────────────────────────────── */
const STATS = [
  { count: 50, suffix: 'M+', label: 'Views Generated' },
  { count: 40, suffix: '+', label: 'Brands & Creators Worked With' },
  { count: 5, suffix: 'K+', label: 'Content Assets Delivered' },
  { count: 120, suffix: '+', label: 'Projects Completed' },
];

function StatsSection() {
  return (
    <section className="reveal-section relative py-16 md:py-28 border-t border-line overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10">
        <div className="text-center mb-12">
          <p className="anim-eyebrow eyebrow mb-3">By The Numbers</p>
          <h2 className="split-h2 text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.05] tracking-[-1.5px] mb-4">
            Good Work Gets Seen.<br />Great Work Performs.
          </h2>
          <p className="text-ink-soft text-sm md:text-base max-w-md mx-auto">
            Great content should do more than just look good; it should perform. Our numbers show our work and performance clearly.
          </p>
        </div>

        <div className="reveal-stagger grid grid-cols-2 lg:grid-cols-4 lg:auto-rows-[170px] gap-3">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                'stat-card relative bg-surface hover:bg-surface-hover border border-line rounded-lg p-6 flex flex-col items-center justify-center text-center overflow-hidden transition-colors duration-200',
                i === 0 && 'lg:col-span-2 lg:row-span-2',
                i === 1 && 'lg:col-span-2',
              )}
            >
              <div
                className={cn(
                  'stat-number relative font-display text-ink tracking-[-1px] leading-none mb-2',
                  i === 0 ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl',
                )}
                data-count={String(s.count)}
                data-suffix={s.suffix}
              >
                {s.count}{s.suffix}
              </div>
              <p className="relative text-ink-soft text-xs leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   WHY PUSHWEBB
──────────────────────────────────────────────────────────────── */
const WHY_ITEMS = [
  {
    icon: Users,
    title: 'Audience-led content',
    description: 'Every idea starts with understanding what will make people see, click, and engage with it.',
  },
  {
    icon: Workflow,
    title: 'Strategy Meets Execution',
    description: 'The strategy behind the content stays connected to the team actually creating and delivering it.',
  },
  {
    icon: TrendingUp,
    title: 'Designed for Growth',
    description: 'Repeatable workflows help increase output while maintaining consistency and creative quality.',
  },
  {
    icon: Sparkles,
    title: 'AI that brings value',
    description: 'We use insights and AI-driven workflows to improve decisions, streamline execution, and keep evolving what works.',
  },
];

function WhyPushWebbSection() {
  return (
    <section className="reveal-section relative py-16 md:py-32 border-t border-line overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="anim-eyebrow eyebrow mb-3">Why PUSHWebb</p>
            <h2 className="split-h2 text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.05] tracking-[-1.5px] max-w-xl">
              More Than Content. A System Built to Grow.
            </h2>
          </div>
          <p className="text-ink-soft text-sm max-w-sm">
            We bring strategy, production, performance, and technology together so your content works as one connected growth system, not a collection of disconnected deliverables.
          </p>
        </div>

        <div className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[190px] gap-3 mb-8">
          {WHY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            const big = i === 0;
            const wide = i === 1;
            return (
              <div
                key={item.title}
                className={cn(
                  'bg-surface hover:bg-surface-hover border border-line rounded-lg p-6 flex flex-col transition-colors duration-200',
                  big && 'lg:col-span-2 lg:row-span-2 lg:justify-center',
                  wide && 'lg:col-span-2',
                )}
              >
                <div
                  className={cn(
                    'rounded-lg bg-surface border border-line flex items-center justify-center mb-4',
                    big ? 'w-12 h-12' : 'w-9 h-9',
                  )}
                >
                  <Icon className={cn(big ? 'w-5 h-5' : 'w-4 h-4', 'text-ink')} />
                </div>
                <h3 className={cn('font-display text-ink font-medium mb-2', big ? 'text-lg' : 'text-sm')}>
                  {item.title}
                </h3>
                <p className={cn('text-ink-soft leading-relaxed', big ? 'text-sm' : 'text-xs')}>{item.description}</p>
              </div>
            );
          })}
        </div>

        <a
          href="/contact"
          className="group inline-flex items-center gap-2 font-display text-ink-muted hover:text-ink text-sm font-medium transition-colors duration-200"
        >
          Know more
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   STORIES OF TRUST AND GROWTH (case study proof)
──────────────────────────────────────────────────────────────── */
function ProofSection() {
  return (
    <section id="case-studies" className="reveal-section relative py-16 md:py-32 bg-paper border-t border-line overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10">
        <div className="reveal-stagger grid md:grid-cols-5 gap-3">
          <div className="md:col-span-2 bg-surface border border-line rounded-lg p-6 sm:p-8 md:p-10 flex flex-col justify-center">
            <p className="anim-eyebrow eyebrow mb-3">Case Study</p>
            <h2 className="split-h2 text-3xl sm:text-4xl text-ink leading-[1.05] tracking-[-1.5px]">
              Stories of Trust and Growth
            </h2>
          </div>
          <div className="md:col-span-3 bg-surface border border-line rounded-lg p-6 sm:p-8 md:p-10 flex items-center">
            <p className="text-ink-soft text-sm md:text-base leading-relaxed">
              We&apos;ve worked with creators, brands, and businesses that expect more than content and marketing. We deliver what actually matters in the market. Their experiences reflect the trust and consistency that we have built with every partnership.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   ABOUT US
──────────────────────────────────────────────────────────────── */
function AboutSection() {
  const stats = [
    {
      value: '06',
      label: 'Growth disciplines under one roof',
      detail: 'Strategy · Production · Performance · AI',
      count: 6,
      suffix: '',
    },
    {
      value: '04',
      label: 'Step scaling & execution framework',
      detail: 'Discover · Architect · Scale · Automate',
      count: 4,
      suffix: '',
    },
    {
      value: '24h',
      label: 'Strategy response & turnaround SLA',
      detail: 'Direct access to senior creative leads',
      count: 24,
      suffix: 'h',
    },
  ];

  return (
    <section id="about" className="relative py-16 md:py-24 overflow-hidden border-t border-line bg-paper">
      {/* Ambient background glow aura */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[600px] rounded-full bg-ink/[0.02] blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-6xl">
        
        {/* Section Header */}
        <div className="mb-10 sm:mb-14">
          <div className="about-badge inline-flex items-center gap-2 rounded-full border border-ink/15 bg-ink/[0.06] px-4 py-1 text-xs font-medium text-ink mb-4">
            <Sparkles className="h-3.5 w-3.5 text-ink" />
            <span>ABOUT PUSHWEBB · WHO WE ARE</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-1.5px] text-ink leading-[1.08] max-w-3xl">
            We Don&apos;t Just Produce Content. We Build Growth Systems.
          </h2>
        </div>

        {/* 2-Column Minimalist Grid */}
        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 items-stretch">

          {/* Left Column: Narrative Card */}
          <div
            id="about-main-card"
            className="lg:col-span-3 flex flex-col justify-between rounded-3xl border border-ink/10 bg-surface p-7 sm:p-9 shadow-[0_18px_50px_-24px_rgba(11,26,43,0.30)] backdrop-blur-2xl transition-all duration-300 hover:border-ink/20"
          >
            <div className="space-y-4">
              <p className="font-display text-lg sm:text-xl text-ink font-medium leading-relaxed">
                PUSHWebb is a creative, AI-powered marketing agency providing structured and predictable growth to creators, brands, and enterprise teams.
              </p>

              <p className="text-ink-soft text-sm sm:text-[15px] leading-relaxed">
                We bridge the gap between creative storytelling, high-velocity production, and performance media. Rather than isolated deliverables, we engineer flexible content engines that link strategy, video, paid acquisition, and automated workflows into one cohesive growth machine.
              </p>

              <p className="text-ink-muted text-xs sm:text-sm leading-relaxed">
                From YouTube and Instagram to paid ad campaigns and intelligent AI automation, we help teams create with purpose, test faster, and make every piece of content compound into measurable business revenue.
              </p>
            </div>

            {/* Bottom Founder / Team Trust & Action Row */}
            <div className="mt-8 pt-6 border-t border-ink/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="about-avatars flex -space-x-2.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-paper shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/pushwebb-assets/images/team-photo-bts.png" alt="PUSHWebb team" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-paper shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/pushwebb-assets/images/testimonial-headshot-professional.webp" alt="PUSHWebb team member" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <p className="text-ink text-xs font-semibold">The People Behind PUSHWebb</p>
                  <p className="text-ink-muted text-[11px]">Creators, strategists & engineers</p>
                </div>
              </div>

              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-display text-xs font-semibold text-paper no-underline shadow-[0_8px_20px_-12px_rgba(11,26,43,0.26)] transition-all duration-200 hover:bg-ink/95 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Know More About Us</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Minimal Glass Stat Tiles */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="stat-card group relative flex-1 flex flex-col justify-center rounded-2xl border border-ink/10 bg-surface p-6 shadow-[0_12px_32px_-18px_rgba(11,26,43,0.24)] backdrop-blur-xl transition-all duration-300 hover:border-ink/25 hover:bg-surface-hover"
              >
                <div className="flex items-baseline justify-between mb-1.5">
                  <div
                    className="stat-number font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink"
                    data-count={String(s.count)}
                    data-suffix={s.suffix}
                  >
                    {s.value}
                  </div>
                  <span className="font-display text-[11px] font-medium text-ink/40 group-hover:text-ink/70 transition-colors uppercase tracking-widest">
                    KPI
                  </span>
                </div>

                <p className="text-ink text-sm font-medium mb-1">{s.label}</p>
                <p className="text-ink-muted text-xs">{s.detail}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   LOCATIONS
──────────────────────────────────────────────────────────────── */
function LocationsSection() {
  return (
    <section id="locations" className="reveal-section relative py-16 md:py-28 bg-paper border-t border-line overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-ink/[0.06] px-4 py-1 text-xs font-medium text-ink backdrop-blur-md mb-3 shadow-[inset_0_1px_0_rgba(11,26,43,0.15)]">
            <MapPin className="h-3.5 w-3.5 text-ink" />
            <span>GLOBAL FOOTPRINT · WHERE WE OPERATE</span>
          </div>
          <h2 className="split-h2 font-display text-3xl sm:text-4xl md:text-5xl font-medium text-ink leading-[1.08] tracking-[-1.5px] mb-4 max-w-2xl mx-auto">
            Serving Brands Across India, Dubai &amp; Beyond
          </h2>
          <p className="text-ink-soft text-sm md:text-base max-w-md mx-auto">
            PUSHWebb works with brands, creators, and marketing teams across India and the UAE, combining strategy, creative execution, production, and performance-driven content systems.
          </p>
        </div>

        <div className="reveal-stagger grid md:grid-cols-5 gap-6 mb-10">
          <div className="group relative md:col-span-3 min-h-[360px] sm:min-h-[380px] rounded-3xl border border-ink/15 overflow-hidden shadow-[0_18px_50px_-24px_rgba(11,26,43,0.30)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=85&auto=format&fit=crop"
              alt="Mumbai skyline, India"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A141A] via-[#0A141A]/70 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-7 sm:p-9">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center mb-5">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="inline-block font-display text-[10px] tracking-widest uppercase text-white bg-white/15 border border-white/25 backdrop-blur-md rounded-full px-3 py-1 mb-3 w-fit">
                Headquarters · Studio
              </span>
              <h3 className="font-display text-white font-medium text-2xl mb-2">India</h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-md">
                Creative production, content pipelines, and full-funnel marketing systems built for ambitious brands and creators.
              </p>
            </div>
          </div>

          <div className="group relative md:col-span-2 min-h-[360px] sm:min-h-[380px] rounded-3xl border border-ink/15 overflow-hidden shadow-[0_18px_50px_-24px_rgba(11,26,43,0.30)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85&auto=format&fit=crop"
              alt="Dubai skyline, UAE"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover scale-100 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A141A] via-[#0A141A]/70 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-7 sm:p-9">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center mb-5">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="inline-block font-display text-[10px] tracking-widest uppercase text-white bg-white/15 border border-white/25 backdrop-blur-md rounded-full px-3 py-1 mb-3 w-fit">
                Growing Regional Hub
              </span>
              <h3 className="font-display text-white font-medium text-2xl mb-2">Dubai, UAE</h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Strategic brand storytelling, creator management, and paid media scaling for businesses across the Middle East.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 font-display text-ink/80 hover:text-ink text-sm font-medium transition-colors duration-200"
          >
            <span>Start a Global Conversation</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   FINAL CTA
──────────────────────────────────────────────────────────────── */
function FinalCTASection() {
  return (
    <section className="reveal-section relative py-16 md:py-36 overflow-hidden border-t border-line">
      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-3xl text-center">
        <p className="anim-eyebrow eyebrow mb-5">Let&apos;s Talk</p>
        <h2 className="split-h2 text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.08] tracking-[-1.5px] mb-5">
          Ready to Build a Better Growth System?
        </h2>
        <p className="text-ink-soft text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-8">
          The goal is not to post more. It is to take better decisions for what to create, how to reach the right audience, and how to improve what works. PUSHWebb helps turn your content into a better growth system.
        </p>
        <a
          href="/contact"
          className="group inline-flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-paper font-semibold py-3.5 px-8 rounded-lg text-sm transition-all duration-200 active:scale-[0.98]"
        >
          <span>Book a Strategy Call</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   FAQ
──────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'What kind of clients does PUSHWebb work with?',
    a: 'We work with creators, personal brands, businesses, and marketing teams that need stronger content systems, more consistent execution, or additional creative and performance support.',
  },
  {
    q: 'Can PUSHWebb manage our social media end-to-end?',
    a: 'Yes. Depending on the scope, we can handle strategy, content planning, creative execution, captions, publishing, and ongoing performance monitoring across social platforms.',
  },
  {
    q: 'Do you work on both organic content and paid campaigns?',
    a: 'Yes. PUSHWebb works across organic content and paid marketing, helping brands connect creative, distribution, and performance instead of treating them as separate functions.',
  },
  {
    q: 'Do you handle content repurposing?',
    a: 'Yes. We can turn suitable long-form content, podcasts, and existing video assets into short-form content designed for platforms such as Instagram Reels and YouTube Shorts.',
  },
  {
    q: 'Does PUSHWebb provide video production and editing?',
    a: 'Yes. Production and post-production are part of our content capabilities and can be included depending on the service and project scope.',
  },
  {
    q: 'How do you decide what content to create?',
    a: 'We start by understanding your audience, goals, brand positioning, current content, and what you are trying to achieve. From there, we build a content direction around what makes sense for your brand and platform.',
  },
  {
    q: 'Do you provide reporting and performance insights?',
    a: 'Yes. Depending on the engagement, we review relevant performance data to understand what is working, what needs improvement, and what should inform the next phase of content or campaigns.',
  },
  {
    q: 'Can PUSHWebb help us increase content output without building a larger internal team?',
    a: 'Yes. Our workflows are designed to support consistent content execution and help brands manage higher output without having to build every capability in-house.',
  },
  {
    q: 'Can we hire PUSHWebb for a specific campaign or project?',
    a: 'Yes. Alongside ongoing engagements, we can work on focused projects where the scope fits our capabilities.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line py-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-ink font-medium text-sm sm:text-base">{q}</span>
        <span className="shrink-0 w-6 h-6 rounded-lg bg-surface border border-line flex items-center justify-center text-ink-soft">
          {open ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </button>
      {open && (
        <p className="text-ink-soft text-sm leading-relaxed mt-3 pr-8">{a}</p>
      )}
    </div>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="reveal-section relative py-16 md:py-32 border-t border-line">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <p className="anim-eyebrow eyebrow mb-3">FAQs</p>
          <h2 className="split-h2 text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.05] tracking-[-1.5px]">
            Questions, Answered
          </h2>
        </div>
        <div className="reveal-stagger">
          {FAQS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   FOOTER
──────────────────────────────────────────────────────────────── */
// The site footer lives in its own module now (it owns the gradient band).
// Re-exported here so existing imports from this file keep working.
export { Footer } from './site-footer';

export function AgencyLanding() {
  return (
    <div className="bg-paper">
      {/* Central GSAP animation engine — renders cursor glow, runs all scroll animations */}
      <GsapScrollProvider />

      <div className="sticky top-0 z-[100] -mb-[72px] sm:-mb-[84px] pointer-events-auto">
        <NavbarModernBlock />
      </div>
      {/* Stage — black room the robot is lit in, carried through the ticker */}
      <div className="on-dark bg-paper">
        <InteractiveHeroSection />
        <MarqueeTicker />
      </div>

      {/* Paper — the deck's light body */}
      <MissionSection />
      <WhatWeDoSection />
      <AboutSection />
      <FrameworkSection />
      <TrustStripSection />

      {/* Proof band — numbers and method read louder against navy */}
      <div className="on-dark dark-zone">
        <StatsSection />
        <WhyPushWebbSection />
      </div>

      <ProofSection />
      <LocationsSection />

      {/* Close — back to the dark room the page opened in */}
      <div className="on-dark dark-zone">
        <FinalCTASection />
        <FAQSection />
        <SiteFooter />
      </div>
    </div>
  );
}
