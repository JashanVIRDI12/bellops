'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  SquarePlay,
  Clapperboard,
  Target,
  Bot,
  Share2,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Channel = {
  id: string;
  name: string;
  icon: LucideIcon;
  hook: string;
  description: string[];
  cover: string[];
  image: string;
};

/* Unsplash placeholders — swap for real production photography later. */
const CHANNELS: Channel[] = [
  {
    id: 'yaas',
    name: 'YAAS: YouTube as a Service',
    icon: SquarePlay,
    hook: 'Turn Your YouTube Channel Into a Growth Engine',
    description: [
      'We manage the complete YouTube ecosystem, from strategy and scripting to production, publishing, and ongoing optimisation.',
      'The focus is beyond just uploading videos. We build content around stronger retention, higher watch time, higher click-through rate, and consistent channel growth.',
    ],
    cover: [
      'YouTube strategy and content planning',
      'Scripting, production, and editing',
      'Thumbnails, publishing, and optimisation',
      'Analytics and performance insights',
    ],
    image: '/pushwebb-assets/images/service-yaas-youtube.jpg',
  },
  {
    id: 'microcontent',
    name: 'Microcontent Mastery',
    icon: Clapperboard,
    hook: 'Short-Form Content Built to Earn Attention.',
    description: [
      'We create platform-driven microcontent designed for the way people actually consume content on Instagram Reels and YouTube Shorts.',
      'From the opening hook to the final edit, every piece is structured to capture viewers’ attention.',
    ],
    cover: [
      'Short-form strategy and ideation',
      'Hook-first storytelling',
      'High-volume video editing',
      'Long-form and podcast repurposing',
      'Performance-led optimisation',
    ],
    image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1200&q=85&auto=format&fit=crop',
  },
  {
    id: 'ad-campaigns',
    name: 'ROI-Driven Ad Campaigns',
    icon: Target,
    hook: 'Campaigns Built With a Clear Objective.',
    description: [
      'We combine campaign strategy, audience targeting, and strong creative to build paid campaigns around specific marketing goals.',
      'From awareness to conversion, every campaign is structured around reaching the right audience with the right content.',
    ],
    cover: [
      'Campaign strategy',
      'Creative development',
      'Audience targeting',
      'Full-funnel campaign planning',
      'Campaign testing and optimization',
      'Meta, Google, and YouTube campaigns',
    ],
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=85&auto=format&fit=crop',
  },
  {
    id: 'ai-automation',
    name: 'AI Automation',
    icon: Bot,
    hook: 'Automate the Repetitive. Focus on What Actually Needs You.',
    description: [
      'We use AI to streamline marketing and content workflows, helping teams work more efficiently without removing the human thinking behind strategy and creative.',
      'The goal is to reduce manual work, simplify processes, and create workflows that are easier to scale.',
    ],
    cover: [
      'Content repurposing workflows',
      'Scheduling and publishing workflows',
      'Repetitive marketing task automation',
      'Content operations',
      'Data and reporting workflows',
      'AI-assisted insights and decision support',
    ],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=85&auto=format&fit=crop',
  },
  {
    id: 'social-media',
    name: 'Social Media Marketing',
    icon: Share2,
    hook: 'Build a Social Presence With More Purpose.',
    description: [
      'Social media should not just keep your account active.',
      'We help brands create a consistent presence through content planning, platform-focused creative, and ongoing performance results.',
    ],
    cover: [
      'Social media strategy building',
      'Content calendars and planning',
      'Content scheduling, publishing, and caption writing',
      'Platform-related content',
      'Creative execution',
      'Performance monitoring and optimisation',
    ],
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&q=85&auto=format&fit=crop',
  },
  {
    id: 'performance-marketing',
    name: 'Performance Marketing',
    icon: BarChart3,
    hook: 'Turn Media Into a Smarter Growth Channel.',
    description: [
      'Performance marketing requires constant learning, not a set-and-forget approach.',
      'We manage and optimise paid campaigns using performance insights, testing, and creative data to look into what is working and where improvements are required.',
    ],
    cover: [
      'Paid media strategy',
      'Meta, Google, and YouTube campaigns',
      'Creative testing',
      'Audience testing',
      'Performance tracking',
      'Ongoing campaign optimization',
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85&auto=format&fit=crop',
  },
];

/** A framed image that drifts subtly within its frame as the page scrolls past it. */
function ChannelFrame({ src, alt }: { src: string; alt: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const imgWrap = imgWrapRef.current;
    if (!frame || !imgWrap) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tween = gsap.fromTo(
        imgWrap,
        { y: -36 },
        {
          y: 36,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={frameRef} className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line md:aspect-[5/6]">
      <div
        ref={imgWrapRef}
        className="absolute inset-x-0 will-change-transform"
        style={{ top: -36, height: 'calc(100% + 72px)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/60 px-2.5 py-1 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-red-500" />
          <span className="font-mono text-[10px] tracking-widest text-white/85">REC</span>
        </span>
      </div>
    </div>
  );
}

function ChannelSection({ channel, index, reversed }: { channel: Channel; index: number; reversed: boolean }) {
  const Icon = channel.icon;

  return (
    <section id={channel.id} className="channel-section reveal-section relative border-t border-line py-16 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <div className={cn('md:col-span-7', reversed && 'md:order-2')}>
            <div className="reveal-stagger">
              <p className="anim-eyebrow mb-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink">
                <Icon className="h-3.5 w-3.5" />
                Channel {String(index + 1).padStart(2, '0')} — {channel.name}
              </p>
              <h2 className="split-h2 mb-5 font-display text-3xl leading-[1.08] tracking-[-1px] text-ink sm:text-4xl md:text-[2.6rem]">
                {channel.hook}
              </h2>
              <div className="mb-8 max-w-xl space-y-4">
                {channel.description.map((p) => (
                  <p key={p} className="text-sm leading-relaxed text-ink-soft md:text-base">
                    {p}
                  </p>
                ))}
              </div>

              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">What We Cover</p>
              <ul className="mb-8 max-w-xl border-t border-line">
                {channel.cover.map((item, i) => (
                  <li key={item} className="flex items-baseline gap-4 border-b border-line py-2.5">
                    <span className="w-5 shrink-0 font-mono text-[10px] text-ink-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm leading-relaxed text-ink-soft">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-hover"
              >
                Book a Call
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          <div className={cn('md:col-span-5', reversed && 'md:order-1')}>
            <ChannelFrame src={channel.image} alt={channel.name} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Fixed left-edge index of channels — visible only alongside the channel list, highlights whichever section is centred in view. */
function ChannelRail() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const triggers: ScrollTrigger[] = [];

      const zone = document.getElementById('channel-rail-zone');
      const rail = document.querySelector('.channel-rail');
      if (zone && rail) {
        triggers.push(
          ScrollTrigger.create({
            trigger: zone,
            start: 'top center',
            end: 'bottom center',
            toggleClass: { targets: rail, className: 'is-visible' },
          }),
        );
      }

      CHANNELS.forEach((channel, i) => {
        const sectionEl = document.getElementById(channel.id);
        const railItem = document.querySelector(`[data-channel-rail-item="${i}"]`);
        if (!sectionEl || !railItem) return;
        triggers.push(
          ScrollTrigger.create({
            trigger: sectionEl,
            start: 'top center',
            end: 'bottom center',
            toggleClass: { targets: railItem, className: 'is-active' },
          }),
        );
      });

      return () => triggers.forEach((t) => t.kill());
    });
    return () => mm.revert();
  }, []);

  return (
    <nav
      aria-label="Service channels"
      className="channel-rail pointer-events-none fixed left-8 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-5 opacity-0 transition-opacity duration-300 xl:flex"
    >
      {CHANNELS.map((channel, i) => (
        <a
          key={channel.id}
          href={`#${channel.id}`}
          data-channel-rail-item={i}
          className="channel-rail-item group flex items-center gap-3"
          aria-label={channel.name}
        >
          <span className="channel-rail-dot h-1.5 w-1.5 rounded-full" />
          <span className="channel-rail-tag font-mono text-[10px] tracking-widest">
            CH.{String(i + 1).padStart(2, '0')}
          </span>
        </a>
      ))}
    </nav>
  );
}

export function ServicesChannelList() {
  return (
    <>
      <ChannelRail />
      <div id="channel-rail-zone">
        {CHANNELS.map((channel, i) => (
          <ChannelSection key={channel.id} channel={channel} index={i} reversed={i % 2 === 1} />
        ))}
      </div>
    </>
  );
}
