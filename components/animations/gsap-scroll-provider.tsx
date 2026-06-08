'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cleanups: Array<() => void> = [];

      // ── CURSOR GLOW ─────────────────────────────────────────
      const glowEl = document.getElementById('cursor-glow');
      if (glowEl) {
        gsap.set(glowEl, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
        const xTo = gsap.quickTo(glowEl, 'x', { duration: 0.9, ease: 'power3.out' });
        const yTo = gsap.quickTo(glowEl, 'y', { duration: 0.9, ease: 'power3.out' });

        let glowVisible = false;
        let rafId = 0;
        let lastX = 0;
        let lastY = 0;

        const onMouseMove = (e: MouseEvent) => {
          lastX = e.clientX;
          lastY = e.clientY;
          if (rafId) return;

          rafId = requestAnimationFrame(() => {
            rafId = 0;
            if (!glowVisible) {
              glowVisible = true;
              gsap.to(glowEl, { autoAlpha: 1, duration: 0.4, overwrite: 'auto' });
            }
            xTo(lastX);
            yTo(lastY);
          });
        };

        const onMouseLeave = () => {
          glowVisible = false;
          gsap.to(glowEl, { autoAlpha: 0, duration: 0.6, overwrite: 'auto' });
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseleave', onMouseLeave);

        cleanups.push(() => {
          if (rafId) cancelAnimationFrame(rafId);
          window.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseleave', onMouseLeave);
        });
      }

      // ── HERO ENTRANCE ────────────────────────────────────────
      const defaults = { ease: 'power3.out' };

      gsap.from('#hero-tagline', { autoAlpha: 0, y: -20, duration: 0.7, delay: 0.5, ...defaults });

      const heroH1 = document.getElementById('hero-headline');
      if (heroH1) {
        splitWords(heroH1);
        gsap.from('#hero-headline .gsap-word', {
          yPercent: 105, autoAlpha: 0, duration: 0.75,
          stagger: 0.05, delay: 0.75, ...defaults,
        });
      }

      gsap.from('#hero-services', { autoAlpha: 0, y: 18, duration: 0.6, delay: 1.15, ...defaults });
      gsap.from('#hero-cta', { autoAlpha: 0, scale: 0.88, duration: 0.5, delay: 1.45, ease: 'back.out(1.7)' });
      gsap.from('#hero-scroll', { autoAlpha: 0, y: 12, duration: 0.5, delay: 2.0, ...defaults });

      // ── CASE STUDIES ─────────────────────────────────────────
      const proofEl = document.getElementById('case-studies');
      if (proofEl) {
        const proofTrigger = (el: Element | null, start = 'top 80%') => ({
          scrollTrigger: { trigger: el ?? proofEl, start, once: true },
        });

        gsap.from(proofEl.querySelector('.anim-eyebrow'), {
          autoAlpha: 0, y: 20, duration: 0.5, ...defaults, ...proofTrigger(proofEl, 'top 82%'),
        });

        const proofH2 = proofEl.querySelector('h2');
        if (proofH2) {
          splitWords(proofH2);
          gsap.from(proofEl.querySelectorAll('.gsap-word'), {
            yPercent: 105, duration: 0.75, stagger: 0.055, ...defaults,
            ...proofTrigger(proofH2, 'top 82%'),
          });
        }

        gsap.from(proofEl.querySelectorAll('.anim-tag'), {
          autoAlpha: 0, y: 14, x: -10, stagger: 0.07, duration: 0.45, ...defaults,
          ...proofTrigger(proofEl, 'top 78%'),
        });

        gsap.from('#proof-story', {
          autoAlpha: 0, x: -50, duration: 0.85, ...defaults,
          ...proofTrigger(document.getElementById('proof-story'), 'top 88%'),
        });

        gsap.from('#proof-stats', {
          autoAlpha: 0, x: 50, duration: 0.85, ...defaults,
          ...proofTrigger(document.getElementById('proof-stats'), 'top 88%'),
        });

        const ctr30 = document.getElementById('stat-counter-30x');
        if (ctr30) {
          const obj = { val: 0 };
          ScrollTrigger.create({
            trigger: ctr30, start: 'top 88%', once: true,
            onEnter: () =>
              gsap.to(obj, {
                val: 30, duration: 2.8, ease: 'power2.out',
                onUpdate: () => { ctr30.textContent = Math.ceil(obj.val) + 'x'; },
              }),
          });
        }

        gsap.from(proofEl.querySelectorAll('.anim-proof-bottom'), {
          autoAlpha: 0, y: 40, duration: 0.65, stagger: 0.15, ...defaults,
          ...proofTrigger(proofEl.querySelector('.proof-bottom-grid'), 'top 90%'),
        });
      }

      // ── WORK SECTION ─────────────────────────────────────────
      const workEl = document.getElementById('work');
      if (workEl) {
        const workH2 = workEl.querySelector('h2');
        if (workH2) {
          splitWords(workH2);
          gsap.from(workEl.querySelectorAll('.gsap-word'), {
            yPercent: 105, duration: 0.75, stagger: 0.06, ...defaults,
            scrollTrigger: { trigger: workEl, start: 'top 80%', once: true },
          });
        }

        gsap.from(workEl.querySelector('.anim-eyebrow'), {
          autoAlpha: 0, y: 20, duration: 0.5, ...defaults,
          scrollTrigger: { trigger: workEl, start: 'top 82%', once: true },
        });

        const workGrid = workEl.querySelector('.work-grid');
        gsap.from(workEl.querySelectorAll('.work-card'), {
          autoAlpha: 0, y: 60, duration: 0.7,
          stagger: { amount: 0.55, from: 'start' }, ...defaults,
          scrollTrigger: { trigger: workGrid, start: 'top 88%', once: true },
        });

        if (workGrid) {
          (workGrid as HTMLElement).style.perspective = '1000px';
        }

        workEl.querySelectorAll<HTMLElement>('.work-card').forEach((card) => {
          const xTo = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3.out' });
          const yTo = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3.out' });
          const scaleTo = gsap.quickTo(card, 'scale', { duration: 0.4, ease: 'power2.out' });

          let cardRafId = 0;
          let cardNx = 0;
          let cardNy = 0;

          const onCardMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            cardNx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            cardNy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            if (cardRafId) return;

            cardRafId = requestAnimationFrame(() => {
              cardRafId = 0;
              xTo(cardNx * 6);
              yTo(-cardNy * 4);
              scaleTo(1.02);
            });
          };

          const onCardLeave = () => {
            xTo(0); yTo(0); scaleTo(1);
          };

          card.addEventListener('mousemove', onCardMove, { passive: true });
          card.addEventListener('mouseleave', onCardLeave);
          card.style.transformStyle = 'preserve-3d';

          cleanups.push(() => {
            if (cardRafId) cancelAnimationFrame(cardRafId);
            card.removeEventListener('mousemove', onCardMove);
            card.removeEventListener('mouseleave', onCardLeave);
          });
        });
      }

      // ── AUDIT CTA ────────────────────────────────────────────
      const auditEl = document.getElementById('free-audit');
      if (auditEl) {
        const auditTrigger = { scrollTrigger: { trigger: auditEl, start: 'top 78%', once: true } };
        gsap.from('#audit-left', { autoAlpha: 0, x: -60, duration: 0.85, ...defaults, ...auditTrigger });
        gsap.from('#audit-right', { autoAlpha: 0, x: 60, duration: 0.85, delay: 0.1, ...defaults, ...auditTrigger });
        gsap.from(auditEl.querySelectorAll('.audit-list-item'), {
          autoAlpha: 0, x: 22, duration: 0.4, stagger: 0.1, ...defaults,
          scrollTrigger: { trigger: document.getElementById('audit-right'), start: 'top 86%', once: true },
        });
      }

      // ── ABOUT SECTION ────────────────────────────────────────
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        const aboutTrigger = { scrollTrigger: { trigger: aboutEl, start: 'top 80%', once: true } };
        gsap.from(aboutEl.querySelector('.anim-eyebrow'), {
          autoAlpha: 0, y: 20, duration: 0.5, ...defaults, ...aboutTrigger,
        });

        const aboutH2 = aboutEl.querySelector('h2');
        if (aboutH2) {
          splitWords(aboutH2);
          gsap.from(aboutEl.querySelectorAll('.gsap-word'), {
            yPercent: 105, duration: 0.75, stagger: 0.06, ...defaults, ...aboutTrigger,
          });
        }

        gsap.from('#about-main-card', {
          autoAlpha: 0, y: 45, duration: 0.85, ...defaults, ...aboutTrigger,
        });

        aboutEl.querySelectorAll<HTMLElement>('.stat-number').forEach((el) => {
          const count = parseFloat(el.dataset.count ?? '0');
          const suffix = el.dataset.suffix ?? '';
          if (isNaN(count)) return;
          const obj = { val: 0 };
          ScrollTrigger.create({
            trigger: el, start: 'top 90%', once: true,
            onEnter: () =>
              gsap.to(obj, {
                val: count, duration: 2, ease: 'power2.out',
                onUpdate: () => { el.textContent = Math.ceil(obj.val) + suffix; },
              }),
          });
        });

        gsap.from(aboutEl.querySelectorAll('.stat-card'), {
          autoAlpha: 0, y: 44, scale: 0.94, duration: 0.65,
          stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: aboutEl, start: 'top 78%', once: true },
        });
      }

      // ── CONTACT SECTION ──────────────────────────────────────
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        const contactH2 = contactEl.querySelector('h2');
        if (contactH2) {
          splitWords(contactH2);
          gsap.from(contactEl.querySelectorAll('.gsap-word'), {
            yPercent: 105, duration: 0.75, stagger: 0.05, ...defaults,
            scrollTrigger: { trigger: contactEl, start: 'top 78%', once: true },
          });
        }

        gsap.from(contactEl.querySelector('.anim-eyebrow'), {
          autoAlpha: 0, y: 18, duration: 0.5, ...defaults,
          scrollTrigger: { trigger: contactEl, start: 'top 80%', once: true },
        });

        gsap.from(contactEl.querySelectorAll('.form-field'), {
          autoAlpha: 0, y: 28, duration: 0.5, stagger: 0.08, ...defaults,
          scrollTrigger: { trigger: contactEl.querySelector('form'), start: 'top 88%', once: true },
        });
      }

      // ── FOOTER ───────────────────────────────────────────────
      const footerEl = document.querySelector('footer');
      if (footerEl) {
        gsap.from(footerEl.children, {
          autoAlpha: 0, y: 22, duration: 0.6, stagger: 0.1, ...defaults,
          scrollTrigger: { trigger: footerEl, start: 'top 95%', once: true },
        });
      }

      return () => {
        cleanups.forEach((fn) => fn());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      id="cursor-glow"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 68%)',
        pointerEvents: 'none',
        zIndex: 9998,
        opacity: 0,
        mixBlendMode: 'screen',
      }}
    />
  );
}
