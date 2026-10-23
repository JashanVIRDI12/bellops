"use client";

import { useLayoutEffect, useRef } from "react";
import { loader as copy } from "@/lib/content";
import { getEnvironment } from "./environment-store";
import { loadedStills, markLoaderLifted, sceneSignals } from "./loader-store";
import { lockScroll } from "./SmoothScroll";
import { experience } from "./store";

/*
 * The start-up screen. It's in the page's HTML, so it covers the first paint,
 * and counts up as the parts of the studio actually arrive: fonts, the
 * visitor's local weather, the first image and, on devices that get 3D, the
 * models and the warm-up (every shot drawn once, hidden, so the camera never
 * stalls on something new mid-flight). Then it lifts like a blind on the
 * studio's window, and the sun sweeps in.
 *
 * It shows on every visit (cached visits take about a second) but never holds
 * the page for long: it lifts anyway after the limits below, and the 3D carries
 * on fading in over the image, already warmed up. Without JavaScript it
 * removes itself.
 */

const WEATHER_WAIT = 2000; // Tweakable (ms): longest wait for the local weather…
const LIVE_WAIT = 15000; // …for the 3D studio, downloaded and warmed up…
const GIVE_UP = 18000; // …and for anything at all, from the moment the page opened.

export function SiteLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  // A layout effect, so the count takes over before the next paint.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || root.dataset.state !== "boot") return;

    root.dataset.state = "tracking";
    lockScroll(true);

    let fontsReady = !document.fonts;
    document.fonts?.ready.then(() => (fontsReady = true));

    // Carry on from where the CSS-only line got to before JavaScript arrived.
    const start = performance.now();
    let shown = 20 * Math.min(1, start / 2400);
    let caption = "";
    let frame = 0;
    let fallback = 0;

    const finish = () => {
      root.dataset.state = "done";
    };

    const leave = () => {
      root.dataset.state = "leaving";
      lockScroll(false);
      markLoaderLifted();
      root.addEventListener("transitionend", (event) => {
        if (event.target === root) finish();
      });
      fallback = window.setTimeout(finish, 1500);
    };

    const tick = () => {
      const now = performance.now();
      const environment = getEnvironment();
      const weatherReady = environment.settled || now > WEATHER_WAIT;
      const shot = Math.round(experience.progress);
      const stillReady = loadedStills.has(
        `${environment.atmosphere.still}:${shot}`,
      );
      const { source, progress, warmup, ready } = sceneSignals;
      const live = source === "live";

      // Each part's share of the count.
      let target = (fontsReady ? 10 : 0) + (weatherReady ? 5 : 0);
      if (live)
        target +=
          (stillReady ? 10 : 0) +
          Math.min(progress, 100) * 0.5 +
          Math.min(warmup, 1) * 20 +
          (ready ? 5 : 0);
      else target += stillReady ? 85 : 0;

      const waitingForScene = live && !ready && now < LIVE_WAIT;
      const done =
        now > GIVE_UP ||
        (fontsReady &&
          weatherReady &&
          stillReady &&
          source !== null &&
          !waitingForScene);

      // While a part is on its way, keep the count creeping, short of 100.
      const goal = done
        ? 100
        : Math.min(
            97,
            target +
              (100 - target) * 0.35 * (1 - Math.exp(-(now - start) / 2500)),
          );
      shown += (goal - shown) * (done ? 0.2 : 0.07);
      if (done && shown > 99.5) shown = 100;

      countRef.current!.textContent = String(Math.floor(shown));
      barRef.current!.style.transform = `scaleX(${shown / 100})`;

      const nextCaption = !weatherReady
        ? copy.checking
        : live && !ready && progress < 100
          ? copy.matching(environment.weather?.location)
          : live && !ready
            ? copy.lighting
            : copy.opening;
      if (nextCaption !== caption) {
        caption = nextCaption;
        captionRef.current!.textContent = caption;
      }

      if (shown === 100) leave();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
      // Unmounted mid-way (or React re-running effects in development).
      if (root.dataset.state === "tracking") {
        root.dataset.state = "boot";
        lockScroll(false);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={rootRef}
        className="site-loader"
        data-state="boot"
        aria-hidden="true"
        suppressHydrationWarning
      >
        <div className="site-loader-inner">
          <p className="site-loader-count">
            <span ref={countRef}>0</span>
            <span className="site-loader-percent">%</span>
          </p>
          <div className="site-loader-track">
            <div ref={barRef} className="site-loader-bar" />
          </div>
          <p ref={captionRef} className="site-loader-caption">
            {copy.opening}
          </p>
        </div>
      </div>
      <noscript
        dangerouslySetInnerHTML={{
          __html: "<style>.site-loader{display:none}</style>",
        }}
      />
    </>
  );
}
