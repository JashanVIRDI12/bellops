'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { onEnterOnce } from '@/lib/reveal';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Choreography for /about.
 *
 * Two rules hold the whole file together:
 *
 *  1. Anything that hides its target (`autoAlpha: 0`, `yPercent: 120`) runs off
 *     IntersectionObserver, never a ScrollTrigger — a trigger that fails to
 *     fire would strand that content invisible for good.
 *  2. Anything on a ScrollTrigger is *scrubbed*, and its resting state is
 *     legible on its own: dimmed text, an un-scaled card. Progress is recomputed
 *     from scroll position continuously, so it is self-correcting.
 *
 * Everything lives inside gsap.matchMedia so `prefers-reduced-motion` gets a
 * static page and every tween, trigger and split is reverted on unmount.
 */
export function AboutMotion() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cleanups: Array<() => void> = [];
      const splits: SplitText[] = [];
      const watch = (el: Element | null, play: () => void, rootMargin?: string) => {
        if (!el) return;
        cleanups.push(onEnterOnce(el, play, rootMargin));
      };

      // ── HERO: character cascade out of a line mask ────────────
      const heroTitle = document.querySelector<HTMLElement>('[data-anim="hero-title"]');
      if (heroTitle) {
        const split = new SplitText(heroTitle, {
          type: 'lines,chars',
          linesClass: 'split-line',
        });
        splits.push(split);

        gsap.set(heroTitle, { autoAlpha: 1 });
        gsap.from(split.chars, {
          yPercent: 120,
          duration: 1,
          stagger: { each: 0.014, from: 'start' },
          ease: 'expo.out',
          delay: 0.15,
        });
      }

      gsap.from('[data-anim="hero-meta"]', {
        autoAlpha: 0, y: 18, duration: 0.7, delay: 0.5, stagger: 0.09, ease: 'power3.out',
      });
      gsap.from('[data-anim="hero-cta"]', {
        autoAlpha: 0, y: 20, duration: 0.6, delay: 0.85, ease: 'power3.out',
      });

      // Hero drifts up and dims as the next section takes over. Scrubbed, so
      // it is always correct for the current scroll position.
      const hero = document.querySelector<HTMLElement>('[data-anim="hero"]');
      const heroInner = document.querySelector<HTMLElement>('[data-anim="hero-inner"]');
      if (hero && heroInner) {
        gsap.to(heroInner, {
          yPercent: -14,
          autoAlpha: 0.18,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        });
      }

      // ── VELOCITY MARQUEE: scroll speed drives the loop ────────
      const track = document.querySelector<HTMLElement>('[data-anim="marquee-track"]');
      if (track) {
        const loop = gsap.to(track, {
          xPercent: -50, repeat: -1, duration: 26, ease: 'none',
        });

        const velocityTrigger = ScrollTrigger.create({
          onUpdate: (self) => {
            const speed = gsap.utils.clamp(1, 5, 1 + Math.abs(self.getVelocity()) / 900);
            gsap.to(loop, { timeScale: speed, duration: 0.6, overwrite: true });
            gsap.to(track, {
              skewX: gsap.utils.clamp(-8, 8, self.getVelocity() / 320),
              duration: 0.5, ease: 'power3.out', overwrite: 'auto',
            });
          },
          onScrubComplete: () => {
            gsap.to(loop, { timeScale: 1, duration: 0.8 });
            gsap.to(track, { skewX: 0, duration: 0.6 });
          },
        });
        cleanups.push(() => { velocityTrigger.kill(); loop.kill(); });
      }

      // ── WORD-FILL: copy brightens word by word as it's read ───
      // Resting state is dimmed rather than hidden, so a missed trigger costs
      // contrast, never the content.
      document.querySelectorAll<HTMLElement>('[data-anim="fill"]').forEach((block) => {
        const split = new SplitText(block, { type: 'words' });
        splits.push(split);

        gsap.set(split.words, { autoAlpha: 0.22 });
        gsap.to(split.words, {
          autoAlpha: 1,
          ease: 'none',
          stagger: 0.4,
          scrollTrigger: {
            trigger: block,
            start: 'top 82%',
            end: 'bottom 58%',
            scrub: 0.6,
          },
        });
      });

      // ── STATEMENT LINES: masked line reveal per pillar ────────
      document.querySelectorAll<HTMLElement>('[data-anim="statement"]').forEach((el) => {
        const split = new SplitText(el, { type: 'lines', linesClass: 'split-line' });
        splits.push(split);

        gsap.set(el, { autoAlpha: 1 });
        gsap.set(split.lines, { yPercent: 110 });

        watch(el, () => {
          gsap.to(split.lines, {
            yPercent: 0, duration: 0.95, stagger: 0.09, ease: 'expo.out',
          });
        }, '0px 0px -18% 0px');
      });

      // ── STACKING CARDS ────────────────────────────────────────
      // Each card is sticky; the one beneath scales back and dims as the next
      // slides over it, so the stack reads as depth rather than a list.
      const stack = document.querySelector<HTMLElement>('[data-anim="stack"]');
      if (stack) {
        const cards = gsap.utils.toArray<HTMLElement>('[data-anim="stack-card"]', stack);

        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          gsap.to(card, {
            scale: 0.9,
            yPercent: -4,
            autoAlpha: 0.45,
            ease: 'none',
            scrollTrigger: {
              trigger: cards[i + 1],
              start: 'top 88%',
              end: 'top 30%',
              scrub: 0.5,
            },
          });
        });

        // Progress rail beside the stack.
        const rail = document.querySelector<HTMLElement>('[data-anim="stack-progress"]');
        if (rail) {
          gsap.fromTo(rail,
            { scaleY: 0 },
            {
              scaleY: 1, ease: 'none', transformOrigin: 'top',
              scrollTrigger: { trigger: stack, start: 'top 60%', end: 'bottom 80%', scrub: 0.4 },
            },
          );
        }
      }

      // ── PARALLAX: globe drifts against its section ────────────
      const globeWrap = document.querySelector<HTMLElement>('[data-anim="parallax"]');
      const globeSection = document.querySelector<HTMLElement>('[data-anim="parallax-section"]');
      if (globeWrap && globeSection) {
        gsap.fromTo(globeWrap,
          { yPercent: 8 },
          {
            yPercent: -8, ease: 'none',
            scrollTrigger: { trigger: globeSection, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      }

      // ── SIMPLE REVEALS ────────────────────────────────────────
      document.querySelectorAll<HTMLElement>('[data-anim="rise"]').forEach((group) => {
        const items = group.children.length ? Array.from(group.children) : [group];
        gsap.set(items, { autoAlpha: 0, y: 30 });
        watch(group, () => {
          gsap.to(items, {
            autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
          });
        }, '0px 0px -12% 0px');
      });

      // ── MAGNETIC CTAs ─────────────────────────────────────────
      document.querySelectorAll<HTMLElement>('[data-anim="magnetic"]').forEach((el) => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

        const onMove = (event: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          xTo((event.clientX - (rect.left + rect.width / 2)) * 0.28);
          yTo((event.clientY - (rect.top + rect.height / 2)) * 0.4);
        };
        const onLeave = () => { xTo(0); yTo(0); };

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        cleanups.push(() => {
          el.removeEventListener('mousemove', onMove);
          el.removeEventListener('mouseleave', onLeave);
        });
      });

      // ── FOOTER ────────────────────────────────────────────────
      // Scoped to .footer-reveal: the footer's other child is the fixed
      // gradient band, which must never be transformed.
      const footerContent = document.querySelector<HTMLElement>('footer .footer-reveal');
      watch(footerContent, () => {
        gsap.from(footerContent!.children, {
          autoAlpha: 0, y: 22, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        });
      }, '0px');

      // Late images shift every trigger's start position.
      ScrollTrigger.refresh();
      const refreshOnLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', refreshOnLoad);
      cleanups.push(() => window.removeEventListener('load', refreshOnLoad));

      return () => {
        cleanups.forEach((fn) => fn());
        // Restores the original text nodes — split characters are invisible to
        // screen readers and to text search.
        splits.forEach((split) => split.revert());
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
