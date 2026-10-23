"use client";

import { useEffect, useState, type RefObject } from "react";

type InViewState = {
  /** The element is currently within the viewport (plus `rootMargin`). */
  inView: boolean;
  /** The element has been in view at least once. Stays true afterwards. */
  hasEntered: boolean;
};

/**
 * Tracks whether an element is on screen with IntersectionObserver.
 *
 * Used to mount a Canvas only when it's about to be seen (`hasEntered`) and to
 * pause rendering whenever it scrolls away (`inView`).
 */
export function useInView(
  ref: RefObject<Element | null>,
  rootMargin = "0px",
): InViewState {
  const [state, setState] = useState<InViewState>({
    inView: false,
    hasEntered: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const visible = entry.isIntersecting;
        setState((prev) =>
          prev.inView === visible && (prev.hasEntered || !visible)
            ? prev
            : { inView: visible, hasEntered: prev.hasEntered || visible },
        );
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return state;
}
