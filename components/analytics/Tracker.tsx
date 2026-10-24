"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { sceneSignals } from "@/components/experience/scene-signals";
import { experience, subscribeProgress } from "@/components/experience/store";
import {
  currentVisit,
  flush,
  setSceneReader,
  track,
} from "@/lib/analytics/client";
import { chapters } from "@/lib/content";

/*
 * Records a visit on the home page: the page view, how far through the tour
 * the visitor got, which contact buttons they pressed, how long the page was
 * on screen, and how fast it loaded. See lib/analytics/client.ts.
 */

// Which chapter each camera beat belongs to: intro, studio, …, contact.
const chapterOfBeat = chapters.flatMap((chapter, index) =>
  Array.from({ length: chapter.beats }, () => ({ id: chapter.id, index })),
);

const reportVital = (metric: { name: string; value: number }) =>
  track("vitals", metric.name, metric.value);

/** Contact links without a data-track name still count, by where they go. */
function actionFor(element: Element) {
  const named = element.getAttribute("data-track");
  if (named) return named;
  const href = element.getAttribute("href") ?? "";
  if (href.startsWith("https://wa.me/")) return "whatsapp";
  if (href.startsWith("tel:")) return "call";
  if (href.startsWith("mailto:")) return "email";
  return null;
}

export function Tracker() {
  useReportWebVitals(reportVital);

  useEffect(() => {
    currentVisit();
    setSceneReader(() =>
      sceneSignals.source === "live"
        ? "3d"
        : sceneSignals.source === "stills"
          ? "images"
          : "",
    );
    track("pageview");

    // Each chapter once, with its place in the tour (to find the furthest).
    const reached = new Set<string>();
    const onProgress = () => {
      const chapter = chapterOfBeat[Math.round(experience.progress)];
      if (chapter && !reached.has(chapter.id)) {
        reached.add(chapter.id);
        track("section", chapter.id, chapter.index);
      }
    };
    onProgress();
    const stopProgress = subscribeProgress(onProgress);

    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest?.("a, button");
      const action = target && actionFor(target);
      if (action) {
        track("action", action);
        flush();
      }
    };
    document.addEventListener("click", onClick, { capture: true });

    // Time the page was actually on screen, in seconds.
    let engaged = 0;
    let visibleSince =
      document.visibilityState === "visible" ? performance.now() : null;
    const onHide = () => {
      if (visibleSince !== null) {
        engaged += performance.now() - visibleSince;
        visibleSince = null;
      }
      track("engagement", "seconds", Math.round(engaged / 1000));
      flush(true);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
      else visibleSince = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);

    return () => {
      stopProgress();
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  return null;
}
