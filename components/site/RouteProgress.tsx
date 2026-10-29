"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageSkeleton } from "./PageSkeleton";

/* Tweakable: how long a page may take before its skeleton shows (ms). */
const SLOW = 400;
/* Tweakable: the longest the bar waits for a page before it gives up (ms). */
const GIVE_UP = 10000;

/** Pages that open on a full-height studio window (their skeleton too). */
const HERO_PAGES = new Set(["/work", "/3d-website-design"]);

/** Runs `fn` once the current state has been painted (two frames on). */
const afterPaint = (fn: () => void) =>
  requestAnimationFrame(() => requestAnimationFrame(fn));

/**
 * The page a click opens, if it's another page of this site in this tab:
 * not a new tab, a download, a file (.csv, .xml), a hash or query on the
 * same page, or a modified click.
 */
function pageOpened(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return null;
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement)) return null;
  if ((link.target && link.target !== "_self") || link.hasAttribute("download"))
    return null;
  const url = new URL(link.href, window.location.href);
  const opens =
    url.origin === window.location.origin &&
    url.pathname !== window.location.pathname &&
    !/\.[a-z0-9]+$/i.test(url.pathname);
  return opens ? url.pathname.replace(/\/$/, "") || "/" : null;
}

/**
 * Loading feedback for client-side navigation (CLAUDE_TASKS_LOADER.md):
 *
 * - A thin bar along the top of the screen from the click until the address
 *   changes, so it shows (briefly) even when the page was prefetched and
 *   opens at once. Transforms and opacity only; with reduced motion it
 *   appears and disappears without moving (app/globals.css,
 *   .route-progress).
 * - If the page takes longer than SLOW, a skeleton of it over the screen
 *   (components/site/PageSkeleton.tsx), with the studio window for /work
 *   and /3d-website-design.
 *
 * Both live only in the browser. The pages have no loading.tsx on purpose:
 * a loading boundary makes React send every prerendered page as its
 * skeleton first, with the real content hidden until a script reveals it,
 * which delays the first real paint and hides the text from crawlers that
 * don't run JavaScript.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  // A click is waiting for its page.
  const pending = useRef(false);
  const timers = useRef<number[]>([]);
  const [skeleton, setSkeleton] = useState<"hero" | "title" | null>(null);

  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    const clearTimers = () => timers.current.splice(0).forEach(clearTimeout);
    const onClick = (event: MouseEvent) => {
      const next = pageOpened(event);
      if (!next) return;
      pending.current = true;
      clearTimers();
      // Back to the start without a transition, then grow.
      element.dataset.state = "idle";
      afterPaint(() => {
        if (pending.current) element.dataset.state = "loading";
      });
      timers.current.push(
        window.setTimeout(() => {
          if (pending.current)
            setSkeleton(HERO_PAGES.has(next) ? "hero" : "title");
        }, SLOW),
        window.setTimeout(() => {
          pending.current = false;
          element.dataset.state = "done";
          setSkeleton(null);
        }, GIVE_UP),
      );
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimers();
    };
  }, []);

  // The new page is here: run the bar to the end, then fade it.
  useEffect(() => {
    const element = bar.current;
    if (!element || !pending.current) return;
    pending.current = false;
    timers.current.splice(0).forEach(clearTimeout);
    setSkeleton(null);
    const finish = () => {
      element.dataset.state = "done";
    };
    if (element.dataset.state === "loading") afterPaint(finish);
    else
      afterPaint(() => {
        element.dataset.state = "loading";
        afterPaint(finish);
      });
  }, [pathname]);

  return (
    <>
      <div
        ref={bar}
        className="route-progress"
        data-state="idle"
        aria-hidden="true"
      />
      {skeleton && (
        <div className="route-skeleton">
          <PageSkeleton hero={skeleton === "hero"} />
        </div>
      )}
    </>
  );
}
