"use client";

import { useEffect, type RefObject } from "react";
import { setProgress } from "./store";

/**
 * Turns the page's scroll position into camera progress ("beats").
 *
 * Every element marked `data-beat` is one camera shot. While its section is
 * on screen the camera holds on that shot; during the last screen-height of
 * the section it travels to the next one. So a taller section = a longer hold.
 *
 * Screen heights are measured in svh, like the sections themselves: on
 * phones, window.innerHeight grows and shrinks as the browser's toolbars
 * slide, which would nudge the camera mid-flight.
 */
export function useBeatTracker(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = root.current;
    if (!container) return;

    let starts: number[] = [];
    let viewport = window.innerHeight;

    // An invisible 100svh ruler.
    const ruler = document.createElement("div");
    ruler.setAttribute("aria-hidden", "true");
    ruler.style.cssText =
      "position:absolute;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
    document.body.appendChild(ruler);

    const update = () => {
      const y = window.scrollY;
      let progress = 0;

      for (let k = 0; k < starts.length; k++) {
        const start = starts[k]!;
        const next = starts[k + 1];
        if (next === undefined) {
          if (y >= start) progress = k;
          break;
        }
        if (y < next) {
          const span = next - start;
          const travel = Math.min(span, viewport);
          const hold = span - travel;
          const t = Math.min(1, Math.max(0, (y - start - hold) / travel));
          progress = k + t;
          break;
        }
      }
      setProgress(progress);
    };

    // Measured only when the page or the ruler changes size, from inside the
    // observer, where the layout is already worked out: never forces one.
    const measure = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries)
        if (entry.target === ruler)
          viewport = entry.contentRect.height || window.innerHeight;
      const beats = container.querySelectorAll<HTMLElement>("[data-beat]");
      starts = Array.from(
        beats,
        (beat) => beat.getBoundingClientRect().top + window.scrollY,
      );
      update();
    };

    const resize = new ResizeObserver(measure);
    resize.observe(container);
    resize.observe(ruler);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      ruler.remove();
      resize.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [root]);
}
