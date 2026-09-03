'use client';

import React from 'react';
import Link from 'next/link';
import { RuixenGradientFooter } from '@/components/ui/ruixen-gradient-footer';

const COLUMNS = [
  {
    title: 'Locations',
    links: [
      { label: 'India', href: null },
      { label: 'Dubai, UAE', href: null },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'info@pushwebb.com', href: 'mailto:info@pushwebb.com' },
      { label: '+91 XXXXX XXXXX', href: null },
      { label: 'Book a Strategy Call', href: '/contact' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Instagram', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'YouTube', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms & Conditions', href: '#' },
    ],
  },
];

/**
 * Site-wide footer. The glow band inside RuixenGradientFooter is
 * `position: fixed`, so nothing here may sit under a transformed or filtered
 * ancestor — that would capture the fixed positioning and pin the gradient to
 * the wrong box.
 */
export function Footer() {
  return (
    <RuixenGradientFooter
      gradientHeight="38vh"
      // 0 keeps the rainbow out of sight until the last screen of the page,
      // instead of leaving a permanent strip along every viewport.
      minReveal={0}
      className="relative border-t border-line"
    >
      {/* .footer-reveal is the animation target — the glow band is a sibling
          and must never be transformed. */}
      <div className="footer-reveal container relative z-10 mx-auto max-w-5xl px-4 py-14 md:px-8">
        {/* Wordmark + centred tagline */}
        <div className="mb-12 flex flex-col items-center gap-3 border-b border-line pb-10 text-center">
          <Link href="/" className="flex items-baseline gap-0.5 no-underline">
            <span className="font-display text-xl font-bold tracking-[-0.5px] text-ink">PUSH</span>
            <span className="font-display text-xl font-medium tracking-[-0.5px] text-ink-muted">Webb</span>
          </Link>
          <p className="text-[11px] uppercase tracking-[0.28em] text-ink-muted">
            Content. Creative. Performance. AI.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="mb-3 font-display text-[10px] uppercase tracking-widest text-ink-muted">
                {column.title}
              </p>
              <ul className="space-y-2 text-sm text-ink-soft">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="no-underline transition-colors duration-200 hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span>{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-line pt-6 text-center">
          <p className="text-xs text-ink-muted sm:text-sm">
            &copy; Copyright {new Date().getFullYear()}. All rights reserved by PUSHWEBB.
          </p>
        </div>
      </div>
    </RuixenGradientFooter>
  );
}
