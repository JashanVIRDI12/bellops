'use client';

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  SquarePlay,
  Clapperboard,
  Target,
  Bot,
  Share2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Service = {
  icon: LucideIcon;
  title: string;
  category: string;
  image: string;
  description: string;
  bullets: string[];
  cta: string;
};

const SERVICES: Service[] = [
  {
    icon: SquarePlay,
    title: 'YAAS — YouTube as a Service',
    category: 'Channel Growth',
    image: '/pushwebb-assets/images/service-yaas-youtube.jpg',
    description:
      'Complete YouTube ecosystem management from scripting to production, publishing, and SEO optimization so that audience growth becomes structured and predictable.',
    bullets: [
      'High-retention structure & packaging',
      'End-to-end production & thumbnails',
      'Continuous algorithmic optimization',
    ],
    cta: 'Explore YouTube as a Service',
  },
  {
    icon: Clapperboard,
    title: 'Microcontent Mastery',
    category: 'Short-Form Video',
    image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1200&q=85&auto=format&fit=crop',
    description:
      'Platform-native short-form content engineered to capture attention in the first 3 seconds, maximize watch time, and drive rapid organic reach across Reels & Shorts.',
    bullets: [
      'Hook-driven narrative engineering',
      'High-velocity editing & pacing',
      'Data-backed format experimentation',
    ],
    cta: 'Explore Microcontent Mastery',
  },
  {
    icon: Target,
    title: 'ROI-Driven Ad Campaigns',
    category: 'Paid Performance',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=85&auto=format&fit=crop',
    description:
      'High-performing paid media campaigns combining creative storytelling with rigorous targeting, multivariate testing, and full-funnel optimization.',
    bullets: [
      'Full-funnel Meta, Google & YouTube ads',
      'Dynamic creative testing & iteration',
      'Obsessive ROAS & CAC optimization',
    ],
    cta: 'Explore ROI-Driven Ad Campaigns',
  },
  {
    icon: Bot,
    title: 'AI Automation',
    category: 'Intelligent Workflows',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=85&auto=format&fit=crop',
    description:
      'Building automated AI systems for content repurposing, metadata generation, distribution workflows, and real-time performance analytics.',
    bullets: [
      'Automated repurposing pipelines',
      'AI-powered scheduling & publishing',
      'Real-time predictive growth data',
    ],
    cta: 'Explore AI Automation',
  },
  {
    icon: Share2,
    title: 'Social Media Marketing',
    category: 'Brand Strategy',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&q=85&auto=format&fit=crop',
    description:
      'Cultivating high-trust brand authority across social channels through cohesive visual direction, structured content calendars, and community engagement.',
    bullets: [
      'Cohesive omnichannel positioning',
      'Multi-platform content execution',
      'Audience conversion architecture',
    ],
    cta: 'Explore Social Media Marketing',
  },
  {
    icon: BarChart3,
    title: 'Performance Marketing',
    category: 'Growth & Scaling',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85&auto=format&fit=crop',
    description:
      'Managing media budgets with surgical precision, measuring cross-channel attribution, and aggressively scaling top-performing customer acquisition funnels.',
    bullets: [
      'Comprehensive budget efficiency modeling',
      'Multi-touch attribution tracking',
      'Scalable paid acquisition engines',
    ],
    cta: 'Explore Performance Marketing',
  },
];

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = service.icon;
  const cardRef = useRef<HTMLDivElement>(null);
  const rotXTo = useRef<((value: number) => void) | null>(null);
  const rotYTo = useRef<((value: number) => void) | null>(null);
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.set(card, { transformPerspective: 1200, transformStyle: 'preserve-3d' });
    rotXTo.current = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power2.out' });
    rotYTo.current = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power2.out' });
  }, []);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const r = cardRef.current.getBoundingClientRect();
      rectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectRef.current || !rotXTo.current || !rotYTo.current) return;

    const { left, top, width, height } = rectRef.current;
    const x = e.clientX - left;
    const y = e.clientY - top;
    const centerX = width / 2;
    const centerY = height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    rotXTo.current(rotateX);
    rotYTo.current(rotateY);
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    if (rotXTo.current && rotYTo.current) {
      rotXTo.current(0);
      rotYTo.current(0);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
      className="service-card group relative flex h-[490px] w-[340px] sm:w-[370px] md:w-[390px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-ink/10 bg-surface p-6 sm:p-7 shadow-[0_18px_50px_-24px_rgba(11,26,43,0.30)] backdrop-blur-2xl transition-all duration-300 hover:border-ink/30 hover:bg-surface-hover hover:shadow-[0_22px_48px_-22px_rgba(11,26,43,0.35)]"
    >
      {/* Dynamic Ambient Background Aura */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-ink/[0.04] blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top Header: Badge & Subtle Watermark Index */}
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/20 bg-ink/10 text-ink shadow-inner">
              <Icon className="h-4 w-4" />
            </div>
            <span className="rounded-full border border-ink/15 bg-ink/[0.06] px-3 py-0.5 font-display text-[10px] font-medium tracking-wider text-ink uppercase">
              {service.category}
            </span>
          </div>

          <span className="watermark-number font-display text-2xl font-bold tracking-tight text-ink/20 transition-colors duration-300 group-hover:text-ink/40">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Generous Hero Media Thumbnail */}
        <div className="card-media-wrapper relative mb-5 h-44 w-full overflow-hidden rounded-2xl border border-ink/15 bg-paper-alt shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.image}
            alt={service.title}
            loading="lazy"
            className="card-media-img h-full w-full object-cover scale-105 transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent opacity-60" />
        </div>

        {/* Title */}
        <h3 className="mb-2 font-display text-xl font-medium tracking-tight text-ink transition-colors duration-200 group-hover:text-ink sm:text-2xl">
          {service.title}
        </h3>

        {/* Concise Description */}
        <p className="line-clamp-2 text-xs sm:text-[13px] leading-relaxed text-ink-soft">
          {service.description}
        </p>
      </div>

      {/* Clean Bottom Action Link */}
      <div className="relative z-10 pt-4 border-t border-ink/[0.08]">
        <a
          href="/contact"
          className="group/cta inline-flex w-full items-center justify-between text-xs sm:text-sm font-display font-medium text-ink no-underline transition-colors duration-200 hover:text-ink"
        >
          <span className="tracking-wide">{service.cta}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 bg-ink/10 transition-all duration-200 group-hover/cta:bg-ink group-hover/cta:text-paper group-hover/cta:scale-105">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
          </div>
        </a>
      </div>
    </div>
  );
}

function ClosingCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotXTo = useRef<((value: number) => void) | null>(null);
  const rotYTo = useRef<((value: number) => void) | null>(null);
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.set(card, { transformPerspective: 1200, transformStyle: 'preserve-3d' });
    rotXTo.current = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power2.out' });
    rotYTo.current = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power2.out' });
  }, []);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const r = cardRef.current.getBoundingClientRect();
      rectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectRef.current || !rotXTo.current || !rotYTo.current) return;

    const { left, top, width, height } = rectRef.current;
    const x = e.clientX - left;
    const y = e.clientY - top;
    const centerX = width / 2;
    const centerY = height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    rotXTo.current(rotateX);
    rotYTo.current(rotateY);
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    if (rotXTo.current && rotYTo.current) {
      rotXTo.current(0);
      rotYTo.current(0);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
      className="service-card group relative flex h-[490px] w-[340px] sm:w-[370px] md:w-[390px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl bg-ink p-7 sm:p-8 shadow-[0_18px_50px_-24px_rgba(11,26,43,0.45)] transition-all duration-300 hover:shadow-[0_26px_60px_-24px_rgba(11,26,43,0.6)]"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-paper transition-transform duration-300 group-hover:scale-110">
          <Sparkles className="h-5 w-5 text-paper" />
        </div>

        <span className="mb-3 block font-display text-xs font-medium tracking-widest text-paper/60 uppercase">
          Unified Growth Engine
        </span>

        <h3 className="mb-4 font-display text-2xl sm:text-3xl font-medium leading-tight text-paper">
          Every Growth Lever, Connected as One.
        </h3>

        <p className="text-xs sm:text-sm leading-relaxed text-paper/70">
          We connect video, distribution, performance ads, and automation into a single scalable growth system.
        </p>
      </div>

      <div className="relative z-10 pt-4 border-t border-white/15">
        <a
          href="/contact"
          className="group/btn flex w-full items-center justify-center gap-2 rounded-2xl bg-paper py-3.5 font-display text-sm font-semibold text-ink no-underline transition-all duration-200 hover:bg-white hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Book a Brainstorming Call</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </a>
      </div>
    </div>
  );
}

export function WhatWeDoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const getDistance = () => track.scrollWidth - window.innerWidth + 80;

      // 1. Core Pin and Horizontal Scrub Tween
      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top 10%',
          end: () => `+=${getDistance() * 1.15}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
          },
        },
      });

      // 2. Parallax Image Pan on Horizontal Scroll
      const cards = gsap.utils.toArray<HTMLElement>(track.querySelectorAll('.service-card'));
      cards.forEach((card) => {
        const img = card.querySelector<HTMLElement>('.card-media-img');
        if (img) {
          gsap.fromTo(
            img,
            { xPercent: -12 },
            {
              xPercent: 12,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left 95%',
                end: 'right 5%',
                scrub: true,
              },
            },
          );
        }

        // 3. Staggered Bullet List Animation as Card Approaches Center
        const bullets = card.querySelectorAll('.bullet-item');
        if (bullets.length > 0) {
          gsap.fromTo(
            bullets,
            { opacity: 0.6, x: -6 },
            {
              opacity: 1,
              x: 0,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left 80%',
                end: 'left 35%',
                scrub: true,
              },
            },
          );
        }
      });

      // 4. Subtle Floating Watermark Sine Wave Oscillation
      const watermarks = track.querySelectorAll('.watermark-number');
      const floatTween = gsap.to(watermarks, {
        y: -4,
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        stagger: 0.15,
      });

      const refresh = () => ScrollTrigger.refresh();
      if (document.readyState === 'complete') {
        requestAnimationFrame(refresh);
      } else {
        window.addEventListener('load', refresh);
      }

      return () => {
        window.removeEventListener('load', refresh);
        floatTween.kill();
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  const scrollBy = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const distance = direction === 'left' ? -420 : 420;
    el.scrollBy({ left: distance, behavior: 'smooth' });
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="reveal-section relative w-full border-t border-line bg-paper py-14 md:py-20 overflow-hidden"
    >
      <div ref={stageRef} className="w-full">
        
        {/* Full-width container header */}
        <div className="w-full px-4 sm:px-8 lg:px-12 mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 max-w-7xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-ink/[0.06] px-4 py-1 text-xs font-medium text-ink backdrop-blur-md mb-3 shadow-[inset_0_1px_0_rgba(11,26,43,0.15)]">
                <Sparkles className="h-3.5 w-3.5 text-ink" />
                <span>WHAT WE DO · 6 CORE DISCIPLINES</span>
              </div>

              <h2 className="split-h2 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-1.5px] text-ink leading-[1.08] max-w-3xl">
                We Turn Creative Ideas Into Growth Systems
              </h2>
            </div>

            {/* Interactive Progress Bar & Arrows */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="font-display text-sm font-semibold text-ink">
                  {String(Math.min(SERVICES.length, Math.round(scrollProgress * (SERVICES.length - 1)) + 1)).padStart(2, '0')}
                </span>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink/15">
                  <div
                    className="h-full bg-ink transition-all duration-150 ease-out shadow-[0_0_8px_rgba(11,26,43,0.8)]"
                    style={{ width: `${Math.max(16, scrollProgress * 100)}%` }}
                  />
                </div>
                <span className="font-display text-xs text-ink-muted">
                  {String(SERVICES.length).padStart(2, '0')}
                </span>
              </div>

              {/* Arrow navigation buttons for manual scrolling on mobile/tablet */}
              <div className="flex items-center gap-1.5 lg:hidden">
                <button
                  type="button"
                  onClick={() => scrollBy('left')}
                  aria-label="Scroll left"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-ink/10 text-ink transition-all hover:bg-ink hover:text-paper active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy('right')}
                  aria-label="Scroll right"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-ink/10 text-ink transition-all hover:bg-ink hover:text-paper active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Horizontal Scroll Track */}
        <div className="w-full overflow-hidden">
          <div
            ref={trackRef}
            className="no-scrollbar flex gap-6 overflow-x-auto lg:overflow-visible scroll-smooth px-4 sm:px-8 lg:px-12 pb-4 will-change-transform"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {SERVICES.map((service, index) => (
              <ServiceCard key={service.title} service={service} index={index} />
            ))}
            <ClosingCard />
          </div>
        </div>

      </div>
    </section>
  );
}
