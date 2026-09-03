'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onEnterOnce } from '@/lib/reveal';

gsap.registerPlugin(ScrollTrigger);

/** Wraps every word in an overflow-hidden mask for slide-up reveals */
function splitWords(el: Element) {
  if (!el || el.querySelector('.gsap-word')) return;
  el.innerHTML = el.innerHTML.replace(
    /(<[^>]+>)|([^<\s]+)/g,
    (_, tag, word) => tag
      ? tag
      : `<span class="gsap-mask" style="display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:0.18em;margin-bottom:-0.18em"><span class="gsap-word" style="display:inline-block">${word}</span></span>`,
  );
}

export function GsapScrollProvider() {
  // Lenis and the GSAP ticker are wired together in SmoothScrollProvider,
  // which owns the instance. This component only declares the animations.
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cleanups: Array<() => void> = [];
      const watch = (el: Element | null, play: () => void, rootMargin?: string) => {
        if (!el) return;
        cleanups.push(onEnterOnce(el, play, rootMargin));
      };

      const defaults = { ease: 'power3.out' };

      // ── HERO ENTRANCE ────────────────────────────────────────
      const heroTagline = document.getElementById('hero-tagline');
      if (heroTagline) {
        gsap.from(heroTagline, { autoAlpha: 0, y: -20, duration: 0.7, delay: 0.5, ...defaults });
      }

      const heroH1 = document.getElementById('hero-headline');
      if (heroH1) {
        splitWords(heroH1);
        gsap.from('#hero-headline .gsap-word', {
          yPercent: 105, autoAlpha: 0, duration: 0.75,
          stagger: 0.05, delay: 0.75, ...defaults,
        });
      }

      const heroServices = document.getElementById('hero-services');
      if (heroServices) {
        gsap.from(heroServices, { autoAlpha: 0, y: 18, duration: 0.6, delay: 1.15, ...defaults });
      }

      const heroCta = document.getElementById('hero-cta');
      if (heroCta) {
        gsap.from(heroCta, { autoAlpha: 0, scale: 0.88, duration: 0.5, delay: 1.45, ease: 'back.out(1.7)' });
      }

      const heroScroll = document.getElementById('hero-scroll');
      if (heroScroll) {
        gsap.from(heroScroll, { autoAlpha: 0, y: 12, duration: 0.5, delay: 2.0, ...defaults });
      }

      // ── GENERIC SECTION REVEAL ───────────────────────────────
      // Any section marked .reveal-section gets: eyebrow fade, split-word h2
      // reveal (via .split-h2), and a staggered fade for .reveal-stagger.
      document.querySelectorAll<HTMLElement>('.reveal-section').forEach((section) => {
        const eyebrow = section.querySelector('.anim-eyebrow');
        const h2 = section.querySelector('h2.split-h2');
        if (h2) splitWords(h2);

        watch(section, () => {
          const tl = gsap.timeline({ defaults });
          if (eyebrow) tl.from(eyebrow, { autoAlpha: 0, y: 20, duration: 0.5 }, 0);
          if (h2) {
            tl.from(h2.querySelectorAll('.gsap-word'), {
              yPercent: 105, duration: 0.75, stagger: 0.055,
            }, 0.08);
          }
        }, '0px 0px -18% 0px');

        const staggerGroup = section.querySelector('.reveal-stagger');
        watch(staggerGroup, () => {
          gsap.from(staggerGroup!.children, {
            autoAlpha: 0, y: 36, duration: 0.6, stagger: 0.1, ...defaults,
          });
        }, '0px 0px -12% 0px');
      });

      // ── STAT COUNTERS (any section) ──────────────────────────
      document.querySelectorAll<HTMLElement>('.stat-number[data-count]').forEach((el) => {
        const count = parseFloat(el.dataset.count ?? '0');
        const suffix = el.dataset.suffix ?? '';
        if (isNaN(count)) return;

        watch(el, () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: count, duration: 2, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.ceil(obj.val) + suffix; },
          });
        }, '0px 0px -8% 0px');
      });

      // ── FRAMEWORK: the four steps land one after another ──────
      // Each card arrives tilted and low, then its contents cascade: rule
      // draws, icon pops, step number slides in, thumbnail settles out of an
      // over-scale, copy rises. Reads as four things being built, in order.
      const frameworkGrid = document.querySelector<HTMLElement>('.framework-grid');
      if (frameworkGrid) {
        const cards = gsap.utils.toArray<HTMLElement>('.framework-card', frameworkGrid);

        gsap.set(frameworkGrid, { perspective: 1100 });
        gsap.set(cards, { autoAlpha: 0, y: 64, rotateX: 12, scale: 0.94, transformOrigin: '50% 0%' });
        gsap.set('.framework-rule', { scaleX: 0 });
        gsap.set('.framework-icon', { autoAlpha: 0, scale: 0.5, rotate: -25 });
        gsap.set('.framework-step', { autoAlpha: 0, x: 18 });
        gsap.set('.framework-thumb', { scale: 1.45 });
        gsap.set('.framework-copy', { autoAlpha: 0, y: 14 });

        watch(frameworkGrid, () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          cards.forEach((card, i) => {
            const at = i * 0.13;
            tl.to(card, { autoAlpha: 1, y: 0, rotateX: 0, scale: 1, duration: 0.85 }, at)
              .to(card.querySelector('.framework-rule'), { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, at + 0.12)
              .to(card.querySelector('.framework-icon'), { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(2)' }, at + 0.2)
              .to(card.querySelector('.framework-step'), { autoAlpha: 1, x: 0, duration: 0.5 }, at + 0.26)
              .to(card.querySelector('.framework-thumb'), { scale: 1.05, duration: 1.15, ease: 'power2.out' }, at + 0.18)
              .to(card.querySelectorAll('.framework-copy'), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07 }, at + 0.3);
          });
        }, '0px 0px -14% 0px');
      }

      // ── ABOUT ────────────────────────────────────────────────
      // The narrative card wipes open from the top while the KPI tiles slide
      // in from the right, so the eye reads the story first, numbers second.
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        const badge = aboutEl.querySelector('.about-badge');
        const aboutH2 = aboutEl.querySelector('h2');
        if (aboutH2) splitWords(aboutH2);

        const mainCard = aboutEl.querySelector('#about-main-card');
        const copy = aboutEl.querySelectorAll('#about-main-card p');
        const avatars = aboutEl.querySelectorAll('.about-avatars > *');
        const tiles = aboutEl.querySelectorAll('.stat-card');

        if (badge) gsap.set(badge, { autoAlpha: 0, y: 16 });
        if (mainCard) {
          gsap.set(mainCard, {
            autoAlpha: 0, y: 40,
            clipPath: 'inset(0% 0% 100% 0%)',
          });
        }
        gsap.set(copy, { autoAlpha: 0, y: 16 });
        gsap.set(avatars, { autoAlpha: 0, scale: 0.4 });
        gsap.set(tiles, { autoAlpha: 0, x: 46, scale: 0.96 });

        watch(aboutEl, () => {
          const tl = gsap.timeline({ defaults });

          if (badge) tl.to(badge, { autoAlpha: 1, y: 0, duration: 0.5 }, 0);
          if (aboutH2) {
            tl.from(aboutH2.querySelectorAll('.gsap-word'), {
              yPercent: 105, duration: 0.75, stagger: 0.06,
            }, 0.1);
          }
          if (mainCard) {
            tl.to(mainCard, {
              autoAlpha: 1, y: 0,
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 0.95, ease: 'power4.out',
            }, 0.25);
          }
          tl.to(copy, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09 }, 0.55)
            .to(avatars, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(2.4)' }, 0.9)
            .to(tiles, { autoAlpha: 1, x: 0, scale: 1, duration: 0.7, stagger: 0.12 }, 0.45);
        }, '0px 0px -16% 0px');
      }

      // ── CONTACT SECTION ──────────────────────────────────────
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        const contactH2 = contactEl.querySelector('h2');
        if (contactH2) splitWords(contactH2);
        const contactEyebrow = contactEl.querySelector('.anim-eyebrow');
        const fields = contactEl.querySelectorAll('.form-field');

        watch(contactEl, () => {
          const tl = gsap.timeline({ defaults });
          if (contactEyebrow) tl.from(contactEyebrow, { autoAlpha: 0, y: 18, duration: 0.5 }, 0);
          if (contactH2) {
            tl.from(contactH2.querySelectorAll('.gsap-word'), {
              yPercent: 105, duration: 0.75, stagger: 0.05,
            }, 0.08);
          }
          if (fields.length) {
            tl.from(fields, { autoAlpha: 0, y: 28, duration: 0.5, stagger: 0.08 }, 0.3);
          }
        }, '0px 0px -14% 0px');
      }

      // ── FOOTER ───────────────────────────────────────────────
      // Scoped to .footer-reveal on purpose: the footer's other child is the
      // gradient band, which is position:fixed. Transforming it would capture
      // that fixed positioning and drag the glow out of the viewport.
      const footerContent = document.querySelector<HTMLElement>('footer .footer-reveal');
      watch(footerContent, () => {
        gsap.from(footerContent!.children, {
          autoAlpha: 0, y: 22, duration: 0.6, stagger: 0.1, ...defaults,
        });
      }, '0px');

      return () => {
        cleanups.forEach((fn) => fn());
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
