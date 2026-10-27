import type Lenis from "lenis";

/*
 * The page's smooth scroller, once SmoothScroll has started it, and the two
 * things the rest of the site asks of it. Kept apart from SmoothScroll so
 * the header and links can use these without loading Lenis or GSAP.
 */

let lenis: Lenis | null = null;

/** SmoothScroll registers its instance here (null when it stops). */
export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Holds the page still (a menu covers it) or lets it scroll again. */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.classList.toggle("scroll-locked", locked);
}

/**
 * Scrolls to a section by id, smoothly when Lenis is running, instantly
 * otherwise (reduced motion, or before it has loaded).
 */
export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  // Lenis and native scrolling both honour the sections' scroll-margin-top.
  if (lenis) lenis.scrollTo(element, { duration: 1.6 });
  else element.scrollIntoView();
}
