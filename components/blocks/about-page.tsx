'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Workflow, TrendingUp, Compass, Sparkles, Layers, MapPin, Plus, Minus, ArrowDown } from 'lucide-react';
import type { COBEOptions } from 'cobe';
import { NavbarModernBlock } from './navbar-modern';
import { Footer } from './site-footer';
import { AboutMotion } from '@/components/animations/about-motion';
import { Globe } from '@/components/ui/globe-feature-section';

const MARQUEE_ITEMS = [
  'Strategy',
  'Production',
  'Post-Production',
  'Social Media',
  'YouTube',
  'AI Content',
  'Performance',
];

const UNSPLASH = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?w=${w}&q=85&auto=format&fit=crop`;

/**
 * Every frame animates the same way: the frame wipes open while the image
 * inside settles out of an over-scale. `img-parallax` additionally drifts the
 * image against the scroll. Both hooks are read by AboutMotion.
 */
function Frame({
  src,
  alt,
  className = '',
  imgClassName = '',
  parallax = false,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  parallax?: boolean;
  priority?: boolean;
}) {
  return (
    <div
      data-anim="img-frame"
      className={`relative overflow-hidden rounded-2xl border border-line bg-paper-alt ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        data-anim={parallax ? 'img-parallax' : 'img-scale'}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   01 — HERO
──────────────────────────────────────────────────────────────── */
function AboutHero() {
  return (
    <section
      data-anim="hero"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-paper px-6 pb-10 pt-28 sm:px-10 md:pb-14 md:pt-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 10% 0%, rgba(11,26,43,0.06) 0%, transparent 70%), radial-gradient(50% 42% at 94% 96%, rgba(30,47,168,0.07) 0%, transparent 72%)',
        }}
      />

      <div data-anim="hero-inner" className="relative z-10 flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-6 border-b border-line pb-6">
          <p data-anim="hero-meta" className="eyebrow">About PUSHWebb</p>
          <p data-anim="hero-meta" className="text-[10px] uppercase tracking-[0.24em] text-ink-muted">
            India &middot; Dubai
          </p>
        </div>

        {/* Statement, with a portrait frame riding alongside it */}
        <div className="grid items-end gap-8 py-10 md:grid-cols-12 md:py-14">
          <h1
            data-anim="hero-title"
            className="max-w-[16ch] text-[clamp(2.4rem,7.6vw,6.6rem)] leading-[0.86] tracking-[-0.035em] text-ink opacity-0 md:col-span-8"
          >
            We Build Systems That Help Brands Grow.
          </h1>

          <Frame
            src="/pushwebb-assets/images/team-photo-bts.png"
            alt="The PUSHWebb team on set, behind the scenes"
            className="hidden aspect-[4/5] md:col-span-4 md:block"
            priority
          />
        </div>

        <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-12">
          <p data-anim="hero-meta" className="text-sm leading-relaxed text-ink-soft md:col-span-5 md:text-[15px]">
            PUSHWebb is a creative and AI-driven marketing agency built for brands, creators, and
            businesses that don&apos;t just want content but growth. We don&apos;t just produce content;
            we build it around a clear purpose while bringing together strategy, storytelling,
            production, performance, and technology.
          </p>

          <div className="flex flex-col gap-4 md:col-span-4 md:col-start-9 md:items-end">
            <div data-anim="hero-cta" className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#case-studies"
                className="group inline-flex h-[54px] items-center justify-center gap-2.5 rounded-lg border border-line bg-surface px-7 text-sm font-semibold text-ink no-underline transition-colors duration-200 hover:bg-surface-hover"
              >
                Explore Our Work
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                data-anim="magnetic"
                className="group inline-flex h-[54px] items-center justify-center gap-2.5 rounded-lg bg-ink px-8 text-sm font-semibold text-paper no-underline transition-colors duration-200 hover:bg-accent"
              >
                Book a Strategy Call
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </Link>
            </div>

            <span className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-ink-muted md:inline-flex">
              Scroll <ArrowDown className="h-3 w-3 animate-bounce" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   FULL-BLEED PHOTO BAND — staggered heights, parallax interiors
──────────────────────────────────────────────────────────────── */
const BAND = [
  { src: UNSPLASH('photo-1598899134739-24c46f58b8c0'), alt: 'Video production on a studio floor', h: 'h-[280px] md:h-[420px]' },
  { src: UNSPLASH('photo-1551836022-d5d88e9218df'), alt: 'Editor grading footage in post-production', h: 'h-[280px] md:h-[520px] md:-mt-14' },
  { src: UNSPLASH('photo-1522071820081-009f0129c71c'), alt: 'The team reviewing a content plan together', h: 'h-[280px] md:h-[380px] md:mt-10' },
];

function PhotoBand() {
  return (
    <section className="relative bg-paper px-6 py-16 sm:px-10 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-3">
        {BAND.map((photo) => (
          <Frame key={photo.src} src={photo.src} alt={photo.alt} className={photo.h} parallax />
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   VELOCITY MARQUEE — loop speed and skew follow scroll velocity
──────────────────────────────────────────────────────────────── */
function VelocityMarquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-line bg-paper py-5">
      <div data-anim="marquee-track" className="flex w-max will-change-transform">
        {items.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8 px-8">
            <span className="font-display text-2xl font-semibold uppercase tracking-[-0.02em] text-ink sm:text-4xl">
              {item}
            </span>
            <span className="text-accent">&#10033;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   02 — THE APPROACH (scroll-scrubbed word fill + editorial pair)
──────────────────────────────────────────────────────────────── */
function ApproachSection() {
  return (
    <section className="relative bg-paper px-6 py-24 sm:px-10 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-baseline justify-between gap-6 border-b border-line pb-5">
          <p className="eyebrow">The Approach</p>
          <span className="font-display text-xs font-semibold tracking-[0.2em] text-ink-muted">02</span>
        </div>

        <p
          data-anim="fill"
          className="text-[clamp(1.25rem,3vw,2.1rem)] font-medium leading-[1.35] tracking-[-0.02em] text-ink"
        >
          Our focus is on creating flexible content systems that link ideas, execution, data, and
          AI-driven workflows into one process, going beyond isolated deliverables. From YouTube and
          Instagram to podcasts, social media, and paid campaigns, we help teams plan better, create
          more consistently, and make every piece of content work harder across all platforms.
        </p>

        <div className="my-14 grid gap-5 md:grid-cols-12">
          <Frame
            src="/pushwebb-assets/images/service-yaas-youtube.jpg"
            alt="A YouTube episode being set up in the studio"
            className="aspect-[16/10] md:col-span-8"
            parallax
          />
          <Frame
            src={UNSPLASH('photo-1618005182384-a83a8bd57fbe', 800)}
            alt="AI-assisted workflow visualised on screen"
            className="aspect-[3/4] md:col-span-4"
            parallax
          />
        </div>

        <p
          data-anim="fill"
          className="max-w-3xl text-[clamp(1rem,2vw,1.35rem)] leading-[1.5] text-ink-soft"
        >
          Your content needs to grow along with your brand; that&apos;s where we organise clearer
          workflows, smarter execution, and systems for your brand that are easier to manage. The aim
          is to help you build a smart content engine that scales with time without losing quality,
          creativity, or consistency.
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   03 / 04 — VISION & MISSION (dark)
──────────────────────────────────────────────────────────────── */
const PILLARS = [
  {
    index: '03',
    label: 'Our Vision',
    title: 'You Ask. We Answer.',
    lead: 'We believe the brands that grow consistently are the ones that bring together strong creative thinking with clear systems behind it.',
    image: UNSPLASH('photo-1552664730-d307ca884978'),
    imageAlt: 'A strategy session mapping a content system',
    body: [
      'Our vision is to help brands get away from scattered execution, unorganised teams, and one-off content. Instead, we want to build structured ecosystems where strategy, creative, performance, and technology work together with a clear goal.',
      'This helps teams create with more purpose, understand what is working, improve what is not, and build repeatable processes around the ideas that perform best.',
      'The goal is not simply to produce more content. It is to create better, learn faster, work smarter, and build systems that can grow with the brand over time.',
    ],
  },
  {
    index: '04',
    label: 'Our Mission',
    title: 'Create Better. Grow Smarter.',
    lead: 'Our mission is to remove unnecessary complexity from content and marketing so brands can work with more clarity, consistency, and purpose.',
    image: UNSPLASH('photo-1574717024653-61fd2cf4d44d'),
    imageAlt: 'Camera operator filming a brand shoot',
    body: [
      'We help bring structure to the process, from planning and creative execution to publishing, performance, and ongoing processes. We build clearer workflows, stronger creative systems, and more efficient ways of working across platforms.',
      'The aim is to help teams spend less time managing disconnected processes and more time creating work that makes the brand grow.',
      'By combining creativity with data, technology, and AI-powered processes, we make execution faster and more informed without losing the judgment, storytelling, and strategic thinking that strong content depends on.',
    ],
  },
];

function PillarsSection() {
  return (
    <div className="on-dark dark-zone">
      {PILLARS.map((pillar, i) => (
        <section
          key={pillar.label}
          className={`relative px-6 py-24 sm:px-10 md:py-32 ${i > 0 ? 'border-t border-line' : ''}`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-baseline justify-between gap-6 border-b border-line pb-5">
              <p className="eyebrow">{pillar.label}</p>
              <span className="font-display text-xs font-semibold tracking-[0.2em] text-ink-muted">
                {pillar.index}
              </span>
            </div>

            <div className="grid gap-10 md:grid-cols-12 md:gap-14">
              <div className={i % 2 === 0 ? 'md:col-span-6' : 'md:col-span-6 md:order-2'}>
                <h2
                  data-anim="statement"
                  className="mb-8 text-[clamp(2.1rem,5.6vw,4.4rem)] leading-[0.94] tracking-[-0.03em] text-ink opacity-0"
                >
                  {pillar.title}
                </h2>
                <Frame
                  src={pillar.image}
                  alt={pillar.imageAlt}
                  className="aspect-[5/4]"
                  parallax
                />
              </div>

              <div className={i % 2 === 0 ? 'md:col-span-6' : 'md:col-span-6 md:order-1'}>
                <p className="mb-7 border-l-2 border-accent pl-5 text-lg leading-relaxed text-ink md:text-xl">
                  {pillar.lead}
                </p>
                <div data-anim="rise" className="space-y-4">
                  {pillar.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-relaxed text-ink-soft md:text-[15px]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   05 — WHY WE ARE DIFFERENT (stacking cards, each with a photo)
──────────────────────────────────────────────────────────────── */
const DIFFERENTIATORS = [
  {
    icon: Users,
    title: 'Audience-led content',
    description: 'We start with what people will actually choose to watch, engage with, and remember.',
    image: UNSPLASH('photo-1542744094-3a31f272c490', 900),
    imageAlt: 'Audience research pinned across a planning wall',
  },
  {
    icon: Workflow,
    title: 'Strategy Meets Execution',
    description: 'The thinking behind the work stays connected to the team responsible for creating and delivering it.',
    image: UNSPLASH('photo-1531403009284-440f080d1e12', 900),
    imageAlt: 'Strategist and editor working side by side',
  },
  {
    icon: TrendingUp,
    title: 'Designed for Growth',
    description: 'We build repeatable workflows that support higher content output while maintaining consistency and quality.',
    image: UNSPLASH('photo-1551288049-bebda4e38f71', 900),
    imageAlt: 'Growth metrics on a dashboard',
  },
  {
    icon: Compass,
    title: 'Data Behind Creativity',
    description: 'Performance insights help us understand what is working and make better decisions about what comes next.',
    image: UNSPLASH('photo-1460925895917-afdab827c52f', 900),
    imageAlt: 'Analytics review across two screens',
  },
  {
    icon: Sparkles,
    title: 'AI that brings value',
    description: 'We use AI to reduce repetitive work, improve efficiency, and strengthen workflows without replacing human strategy and creative judgment.',
    image: UNSPLASH('photo-1618005182384-a83a8bd57fbe', 900),
    imageAlt: 'AI-assisted production workflow',
  },
  {
    icon: Layers,
    title: 'End-to-End Ownership',
    description: 'From planning and production to publishing and optimization, we keep the process connected so there are fewer gaps between strategy and execution.',
    image: UNSPLASH('photo-1598899134739-24c46f58b8c0', 900),
    imageAlt: 'Full production crew on a shoot',
  },
];

function DifferentSection() {
  return (
    <section className="relative bg-paper px-6 py-24 sm:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-baseline justify-between gap-6 border-b border-line pb-5">
          <p className="eyebrow">Why We Are Different</p>
          <span className="font-display text-xs font-semibold tracking-[0.2em] text-ink-muted">05</span>
        </div>

        <div className="mb-16 grid gap-8 md:grid-cols-12">
          <h2
            data-anim="statement"
            className="text-[clamp(2rem,5.2vw,4rem)] leading-[0.95] tracking-[-0.03em] text-ink opacity-0 md:col-span-7"
          >
            More Than an Agency. A System Behind the Work.
          </h2>
          <p className="self-end text-sm leading-relaxed text-ink-soft md:col-span-4 md:col-start-9">
            We bring strategy, production, performance, and technology together so your content works
            as one connected growth system, not a collection of disconnected deliverables.
          </p>
        </div>

        <div className="relative grid md:grid-cols-12 md:gap-10">
          <div className="relative hidden md:col-span-1 md:block">
            <div className="sticky top-1/2 h-40 w-px bg-line">
              <div data-anim="stack-progress" className="h-full w-px origin-top bg-accent" />
            </div>
          </div>

          <div data-anim="stack" className="md:col-span-11">
            {DIFFERENTIATORS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  data-anim="stack-card"
                  className="sticky top-24 mb-6 overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_18px_50px_-30px_rgba(11,26,43,0.45)] will-change-transform md:top-28"
                >
                  <div className="grid sm:grid-cols-5">
                    <div className="p-7 sm:col-span-3 sm:p-10">
                      <div className="mb-7 flex items-center justify-between border-b border-line pb-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-paper text-ink">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-display text-4xl font-bold tracking-tight text-ink/10 sm:text-5xl">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <h3 className="mb-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-ink-soft sm:text-base">
                        {item.description}
                      </p>
                    </div>

                    <div className="relative min-h-[220px] overflow-hidden sm:col-span-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        loading="lazy"
                        data-anim="img-parallax"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div data-anim="rise" className="mt-14">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 font-display text-sm font-semibold text-ink transition-colors duration-200 hover:text-accent"
          >
            Explore Our Services
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   PHOTO MARQUEE — the studio, on a loop
──────────────────────────────────────────────────────────────── */
const STRIP = [
  { src: UNSPLASH('photo-1574717024653-61fd2cf4d44d', 700), alt: 'Camera operator on a brand shoot' },
  { src: UNSPLASH('photo-1552664730-d307ca884978', 700), alt: 'Planning session in progress' },
  { src: UNSPLASH('photo-1551836022-d5d88e9218df', 700), alt: 'Colour grading in post-production' },
  { src: '/pushwebb-assets/images/team-photo-bts.png', alt: 'PUSHWebb team behind the scenes' },
  { src: UNSPLASH('photo-1542744094-3a31f272c490', 700), alt: 'Campaign planning wall' },
  { src: UNSPLASH('photo-1460925895917-afdab827c52f', 700), alt: 'Performance review on screen' },
  { src: UNSPLASH('photo-1531403009284-440f080d1e12', 700), alt: 'Discovery workshop' },
];

function PhotoMarquee() {
  const items = [...STRIP, ...STRIP];
  return (
    <section className="relative overflow-hidden border-y border-line bg-paper py-14 md:py-20">
      <div className="mb-8 flex items-baseline justify-between gap-6 px-6 sm:px-10">
        <p className="eyebrow">Inside the Studio</p>
        <span className="font-display text-xs font-semibold tracking-[0.2em] text-ink-muted">
          Drag-free · always running
        </span>
      </div>

      <div data-anim="photo-track" className="flex w-max gap-4 will-change-transform">
        {items.map((photo, i) => (
          <div
            key={i}
            className="relative h-[200px] w-[280px] shrink-0 overflow-hidden rounded-xl border border-line bg-paper-alt sm:h-[260px] sm:w-[360px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   06 — WHERE WE OPERATE
──────────────────────────────────────────────────────────────── */
const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  // Rotated so India and the Gulf face the viewer on first paint.
  theta: 0.28,
  dark: 0,
  diffuse: 0.42,
  mapSamples: 16000,
  mapBrightness: 1.15,
  baseColor: [0.92, 0.93, 0.95],
  markerColor: [30 / 255, 47 / 255, 168 / 255],
  glowColor: [0.85, 0.88, 0.95],
  markers: [
    { location: [19.076, 72.8777], size: 0.12 },   // Mumbai — HQ & studio
    { location: [25.2048, 55.2708], size: 0.1 },   // Dubai — regional hub
    { location: [28.6139, 77.209], size: 0.06 },   // Delhi
    { location: [12.9716, 77.5946], size: 0.055 }, // Bengaluru
    { location: [51.5074, -0.1278], size: 0.045 }, // London
    { location: [40.7128, -74.006], size: 0.05 },  // New York
    { location: [1.3521, 103.8198], size: 0.04 },  // Singapore
  ],
};

const LOCATIONS = [
  {
    place: 'India',
    role: 'Headquarters · Studio',
    detail: 'Creative production, content pipelines, and full-funnel marketing systems built for ambitious brands and creators.',
    image: UNSPLASH('photo-1570168007204-dfb528c6958f', 900),
    imageAlt: 'Mumbai skyline, India',
  },
  {
    place: 'Dubai, UAE',
    role: 'Growing Regional Hub',
    detail: 'Strategic brand storytelling, creator management, and paid media scaling for businesses across the Middle East.',
    image: UNSPLASH('photo-1512453979798-5ea266f8880c', 900),
    imageAlt: 'Dubai skyline, UAE',
  },
];

function LocationsSection() {
  return (
    <section
      id="locations"
      data-anim="parallax-section"
      className="relative overflow-hidden border-t border-line bg-paper px-6 py-24 sm:px-10 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-baseline justify-between gap-6 border-b border-line pb-5">
          <p className="eyebrow">Where We Operate</p>
          <span className="font-display text-xs font-semibold tracking-[0.2em] text-ink-muted">06</span>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <h2
              data-anim="statement"
              className="mb-6 text-[clamp(2rem,4.6vw,3.5rem)] leading-[0.96] tracking-[-0.03em] text-ink opacity-0"
            >
              Serving Brands Across India, Dubai &amp; Beyond.
            </h2>
            <p className="mb-10 max-w-md text-sm leading-relaxed text-ink-soft md:text-[15px]">
              PUSHWebb works with brands, creators, and marketing teams across India and the UAE,
              combining strategy, creative execution, production, and performance-driven content systems.
            </p>
          </div>

          {/* Drag to spin. The wrapper drifts against the scroll. */}
          <div data-anim="parallax" className="relative mx-auto aspect-square w-full max-w-[460px]">
            <Globe config={GLOBE_CONFIG} />
          </div>
        </div>

        {/* City tiles: photograph behind, caption over a scrim */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {LOCATIONS.map((location) => (
            <div
              key={location.place}
              data-anim="img-frame"
              className="group relative min-h-[320px] overflow-hidden rounded-3xl border border-line sm:min-h-[380px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={location.image}
                alt={location.imageAlt}
                loading="lazy"
                data-anim="img-parallax"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04070C] via-[#04070C]/60 to-transparent" />

              <div className="relative z-10 flex h-full flex-col justify-end p-7 sm:p-9">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                  <span className="font-display text-[10px] uppercase tracking-[0.16em] text-white/75">
                    {location.role}
                  </span>
                </div>
                <h3 className="mb-2 font-display text-2xl font-semibold tracking-tight text-white">
                  {location.place}
                </h3>
                <p className="max-w-md text-[13px] leading-relaxed text-white/80">{location.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   07 — FAQ
──────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'What does PUSHWebb do?',
    a: 'PUSHWebb is a creative and AI-powered marketing agency working across YouTube, short-form content, social media marketing, paid campaigns, performance marketing, and AI automation.',
  },
  {
    q: 'Does PUSHWebb handle both strategy and execution?',
    a: 'Yes. PUSHWebb combines strategy, planning, production, editing, publishing, campaign execution, and optimisation all under one roof to provide growth.',
  },
  {
    q: 'Does PUSHWebb provide complete YouTube management?',
    a: 'Yes. Our YouTube as a Service offering can cover strategy, scripting, production, editing, thumbnails, publishing, optimization, and analytics.',
  },
  {
    q: 'Does PUSHWebb create short-form and social media content?',
    a: 'Yes. We create short-form content for platforms including Instagram Reels, YouTube Shorts, and TikTok, along with broader social media planning and creative execution.',
  },
  {
    q: 'Does PUSHWebb work with clients outside India?',
    a: 'Yes. PUSHWebb works with clients across markets and is expanding its presence in Dubai to work more closely with brands and creators across the UAE.',
  },
  {
    q: 'How does PUSHWebb use AI?',
    a: 'We use AI to improve suitable content and marketing workflows, including research, repurposing, publishing, repetitive tasks, reporting, and decision support.',
  },
  {
    q: 'Can we work with PUSHWebb for only one service?',
    a: 'Clients can work with us for an individual service or combine multiple services depending on their brand goals and internal capabilities.',
  },
  {
    q: 'How do we start working with PUSHWebb?',
    a: 'Start with a strategy call. We first understand your goals, current setup, and challenges, then recommend the most relevant service or working model.',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group border-b border-line">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-5 py-6 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-[11px] font-semibold tracking-[0.16em] text-ink-muted">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 font-display text-base font-medium tracking-tight text-ink transition-colors duration-200 group-hover:text-accent sm:text-lg">
          {q}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition-colors duration-200 group-hover:border-ink group-hover:text-ink">
          {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </span>
      </button>

      {/* grid-rows trick: animates to the content's true height, no JS measuring */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-3xl pb-6 pl-9 pr-10 text-sm leading-relaxed text-ink-soft">{a}</p>
        </div>
      </div>
    </div>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="relative border-t border-line bg-paper px-6 py-24 sm:px-10 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <div className="mb-8 flex items-baseline justify-between gap-6 border-b border-line pb-5">
            <p className="eyebrow">FAQs</p>
            <span className="font-display text-xs font-semibold tracking-[0.2em] text-ink-muted">07</span>
          </div>

          <h2
            data-anim="statement"
            className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-[0.96] tracking-[-0.03em] text-ink opacity-0"
          >
            Questions, Answered.
          </h2>

          <Frame
            src={UNSPLASH('photo-1522071820081-009f0129c71c', 800)}
            alt="The PUSHWebb team on a client call"
            className="hidden aspect-[4/5] md:block"
            parallax
          />
        </div>

        <div className="md:col-span-8">
          {FAQS.map((item, i) => (
            <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   CLOSE — photograph behind the final statement
──────────────────────────────────────────────────────────────── */
function AboutClose() {
  return (
    <div className="on-dark dark-zone">
      <section className="relative overflow-hidden border-t border-line px-6 py-28 sm:px-10 md:py-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={UNSPLASH('photo-1598899134739-24c46f58b8c0', 1600)}
          alt=""
          aria-hidden
          loading="lazy"
          data-anim="img-parallax"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.18]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(70% 60% at 50% 50%, rgba(0,0,0,0.55) 0%, #000 78%)' }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div data-anim="rise" className="mb-6">
            <p className="eyebrow">Ready to upgrade?</p>
          </div>

          <h2
            data-anim="statement"
            className="mx-auto mb-7 max-w-[18ch] text-[clamp(2.2rem,6vw,5rem)] leading-[0.92] tracking-[-0.03em] text-ink opacity-0"
          >
            Ready to Build a Better Growth System?
          </h2>

          <p className="mx-auto mb-10 max-w-xl text-sm leading-relaxed text-ink-soft md:text-base">
            Great content isn&apos;t just about posting more. It&apos;s about knowing what to create, how
            to reach the right audience, and how to improve what works. PUSHWebb helps turn your content
            into a better growth system.
          </p>

          <Link
            href="/contact"
            data-anim="magnetic"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-9 py-4 text-sm font-semibold text-paper no-underline transition-colors duration-200 hover:bg-accent"
          >
            <span>Book a Strategy Call</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="bg-paper">
      <AboutMotion />
      <NavbarModernBlock />
      <AboutHero />
      <PhotoBand />
      <VelocityMarquee />
      <ApproachSection />
      <PillarsSection />
      <DifferentSection />
      <PhotoMarquee />
      <LocationsSection />
      <FAQSection />
      <AboutClose />
    </div>
  );
}
