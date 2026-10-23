"use client";

import { getImageProps } from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cx } from "@/components/three/utils/cx";
import { usePrefersReducedMotion } from "@/components/three/utils/usePrefersReducedMotion";
import type { StillMood } from "@/lib/atmosphere";
import { SHOT_COUNT } from "./beats";
import {
  MAX_FRAME_DELTA,
  SCROLL_DAMPING,
  damp,
  easeShot,
} from "./camera-motion";
import { reportStill } from "./loader-store";
import { experience, subscribeProgress } from "./store";

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable: the zoom that stands in for the camera move between two stills.
 * ════════════════════════════════════════════════════════════════════════ */
const LEAVE_ZOOM = 0.05; // the still being left pushes in by 5% as it goes
const ARRIVE_ZOOM = 0.08; // the next still lands from 8% zoomed in to rest

const SETTLE_EPSILON = 0.0004;
// Once the live scene has faded in over them, the stills stop being drawn at
// all, which frees their full-screen layers (a lot of graphics memory on phones).
const HIDE_AFTER_MS = 1200;
const LAST_SHOT = SHOT_COUNT - 1;

/**
 * Pre-rendered frames of every camera shot, captured from the live scene.
 * Shown on phones, low-end devices and with reduced motion, and as the first
 * paint everywhere while the 3D loads.
 */
const stillSrc = (
  beat: number,
  orientation: "landscape" | "portrait",
  mood: StillMood,
) => `/experience/atmosphere-v5/${mood}/shot-${beat}-${orientation}.webp`;

function Still({
  beat,
  priority,
  mood,
}: {
  beat: number;
  priority: boolean;
  mood: StillMood;
}) {
  // Stills near the current one load straight away (not lazily), so each is
  // ready before the scroll starts bringing it in.
  const common = {
    alt: "",
    sizes: "100vw",
    loading: "eager" as const,
    fetchPriority: priority ? ("high" as const) : ("low" as const),
  };
  const {
    props: { srcSet: portrait },
  } = getImageProps({
    ...common,
    src: stillSrc(beat, "portrait", mood),
    width: 860,
    height: 1864,
  });
  const {
    props: { srcSet: landscape, ...rest },
  } = getImageProps({
    ...common,
    src: stillSrc(beat, "landscape", mood),
    width: 1920,
    height: 1080,
  });

  return (
    <picture>
      <source media="(orientation: portrait)" srcSet={portrait} />
      <source media="(orientation: landscape)" srcSet={landscape} />
      <img
        {...rest}
        alt=""
        className="h-full w-full object-cover"
        // Tell the start-up loader which image is on screen; it may have
        // finished before the page's JavaScript arrived.
        ref={(img) => {
          if (img?.complete && img.naturalWidth > 0)
            reportStill(img.currentSrc);
        }}
        onLoad={(event) => reportStill(event.currentTarget.currentSrc)}
      />
    </picture>
  );
}

/**
 * Sets each still's opacity and zoom for a scroll position (in beats). While
 * the page travels from one shot to the next, the next still fades in over
 * the current one, eased like the 3D camera, so the stills follow the
 * finger instead of switching at a threshold.
 */
function paintStills(
  layers: Map<number, HTMLDivElement>,
  progress: number,
  zoom: boolean,
) {
  const p = Math.min(Math.max(progress, 0), LAST_SHOT);
  const from = Math.floor(p);
  const t = from < LAST_SHOT ? easeShot(p - from) : 0;

  layers.forEach((layer, index) => {
    let opacity = 0;
    let scale = 1;
    if (index === from) {
      opacity = 1;
      scale = 1 + LEAVE_ZOOM * t;
    } else if (index === from + 1) {
      opacity = t;
      scale = 1 + ARRIVE_ZOOM * (1 - t);
    }
    layer.style.opacity = opacity.toFixed(4);
    // Off-screen stills stay loaded but skip painting.
    layer.style.visibility = opacity > 0 ? "visible" : "hidden";
    layer.style.transform = zoom ? `scale(${scale.toFixed(5)})` : "none";
  });
}

/**
 * - "show": the stills follow the scroll
 * - "hide": the live scene has taken over
 */
export type StillsMode = "show" | "hide";

/**
 * The stills, moving with the scroll the way the 3D camera does. Only the
 * pair on screen and one still either side are in the DOM. Scrolling never
 * re-renders React: styles are written straight to the layers each frame.
 */
export function Stills({ mode, mood }: { mode: StillsMode; mood: StillMood }) {
  const reducedMotion = usePrefersReducedMotion();
  const layers = useRef(new Map<number, HTMLDivElement>());
  /** Smoothed scroll progress in beats; null until the first frame. */
  const shown = useRef<number | null>(null);
  /** The still being travelled away from; it and the next are on screen. */
  const [from, setFrom] = useState(0);
  const fromRef = useRef(0);
  /** The mode whose fade has finished. */
  const [settled, setSettled] = useState<StillsMode>("show");

  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(mode), HIDE_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [mode]);

  const paint = useCallback(() => {
    paintStills(
      layers.current,
      shown.current ?? experience.progress,
      !reducedMotion,
    );
  }, [reducedMotion]);

  // Stills that just mounted get their styles before the browser paints.
  useLayoutEffect(() => paint());

  // Follow the scroll, with the camera's smoothing. Runs only while moving.
  useEffect(() => {
    if (mode === "hide") return;
    let frame = 0;
    let last = 0;

    const step = (now: number) => {
      const dt = Math.min(Math.max(now - last, 0) / 1000, MAX_FRAME_DELTA);
      const goal = experience.progress;
      let p =
        shown.current === null
          ? goal
          : damp(shown.current, goal, SCROLL_DAMPING, dt);
      const settled = Math.abs(p - goal) < SETTLE_EPSILON;
      if (settled) p = goal;
      shown.current = p;
      paint();

      const nextFrom = Math.min(Math.floor(p), LAST_SHOT);
      if (nextFrom !== fromRef.current) {
        fromRef.current = nextFrom;
        setFrom(nextFrom);
      }

      last = now;
      frame = settled ? 0 : requestAnimationFrame(step);
    };

    const wake = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };

    wake();
    const unsubscribe = subscribeProgress(wake);
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
    };
  }, [mode, paint]);

  const mounted = [from - 1, from, from + 1, from + 2].filter(
    (index) => index >= 0 && index <= LAST_SHOT,
  );

  return (
    <div
      className={cx(
        "absolute inset-0 transition-opacity duration-1000 ease-out",
        mode === "hide" && "opacity-0",
        mode === "hide" && settled === "hide" && "hidden",
      )}
    >
      {mounted.map((index) => (
        <div
          key={index}
          ref={(node) => {
            if (!node) return;
            layers.current.set(index, node);
            return () => {
              layers.current.delete(index);
            };
          }}
          className="absolute inset-0"
          // The first paint (before JavaScript): only the current still.
          style={{
            opacity: index === from ? 1 : 0,
            visibility: index === from ? "visible" : "hidden",
            willChange: "opacity, transform",
          }}
        >
          <Still beat={index} priority={index === 0} mood={mood} />
        </div>
      ))}
    </div>
  );
}
