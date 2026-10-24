"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cx } from "@/components/three/utils/cx";
import { usePrefersReducedMotion } from "@/components/three/utils/usePrefersReducedMotion";
import { whenIdle } from "@/components/three/utils/whenIdle";
import type { StillMood } from "@/lib/atmosphere";
import { SHOT_COUNT } from "./beats";
import {
  MAX_FRAME_DELTA,
  SCROLL_DAMPING,
  damp,
  easeShot,
} from "./camera-motion";
import { stillImage, type StillOrientation } from "./still-image";
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

function Still({
  beat,
  priority,
  mood,
  onLoad,
}: {
  beat: number;
  priority: boolean;
  mood: StillMood;
  onLoad?: () => void;
}) {
  const portrait = stillImage(beat, "portrait", mood, priority);
  const landscape = stillImage(beat, "landscape", mood, priority);

  return (
    <picture>
      <source
        media="(orientation: portrait)"
        srcSet={portrait.srcSet}
        sizes={portrait.sizes}
      />
      <img
        {...landscape}
        alt=""
        className="h-full w-full object-cover"
        // It may have finished (from the preload) before React attached onLoad.
        ref={(img) => {
          if (img?.complete && img.naturalWidth > 0) onLoad?.();
        }}
        onLoad={onLoad}
        // A still that fails to load leaves the dark backdrop, not a broken icon.
        onError={(event) => {
          event.currentTarget.style.visibility = "hidden";
        }}
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

/** The orientation the page shows stills in right now. */
const currentOrientation = (): StillOrientation =>
  window.matchMedia("(orientation: portrait)").matches
    ? "portrait"
    : "landscape";

/**
 * - "show": the stills follow the scroll
 * - "hide": the live scene has taken over
 */
export type StillsMode = "show" | "hide";

/**
 * The stills, moving with the scroll the way the 3D camera does. Only browser
 * code renders them (the server can't know the visitor's mood).
 *
 * The still on screen loads first, with high priority. Its neighbours load
 * once it has arrived and the browser is idle, and only where the stills
 * carry the tour (`primary`); elsewhere just the next one joins while the
 * page travels to it. Scrolling never re-renders React: styles are written
 * straight to the layers each frame.
 */
export function Stills({
  mode,
  mood,
  primary,
  onFirstLoad,
}: {
  mode: StillsMode;
  mood: StillMood;
  /** The stills carry the whole tour (no live scene on the way). */
  primary: boolean;
  /** The first still is on screen. */
  onFirstLoad?: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const layers = useRef(new Map<number, HTMLDivElement>());
  /** Smoothed scroll progress in beats; null until the first frame. */
  const shown = useRef<number | null>(null);
  /** The still being travelled away from; it and the next are on screen. */
  const [from, setFrom] = useState(() =>
    Math.min(Math.floor(experience.progress), LAST_SHOT),
  );
  const fromRef = useRef(from);
  /** Between two stills: the next one must be in the DOM. */
  const [travelling, setTravelling] = useState(false);
  const travellingRef = useRef(false);
  /** The mode whose fade has finished. */
  const [settled, setSettled] = useState<StillsMode>("show");
  /** The first still has loaded and the browser had a moment: neighbours may load. */
  const [neighbours, setNeighbours] = useState(false);
  const [firstLoaded, setFirstLoaded] = useState(false);
  /** The mood drawn now; a new one takes over once its still has loaded. */
  const [shownMood, setShownMood] = useState(mood);

  const handleFirstLoad = useCallback(() => {
    setFirstLoaded(true);
  }, []);

  useEffect(() => {
    if (!firstLoaded) return;
    onFirstLoad?.();
    return whenIdle(() => setNeighbours(true));
  }, [firstLoaded, onFirstLoad]);

  // The weather can change the mood after the first still is up: fetch the
  // new one in the background, then switch, so the backdrop never goes blank.
  useEffect(() => {
    if (mood === shownMood) return;
    let cancelled = false;
    const props = stillImage(fromRef.current, currentOrientation(), mood, true);
    const image = new Image();
    image.sizes = props.sizes ?? "100vw";
    image.srcset = props.srcSet ?? "";
    image.src = props.src;
    image
      .decode()
      .catch(() => {})
      .then(() => {
        if (!cancelled) setShownMood(mood);
      });
    return () => {
      cancelled = true;
    };
  }, [mood, shownMood]);

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
      const nextTravelling = p - nextFrom > SETTLE_EPSILON;
      if (nextTravelling !== travellingRef.current) {
        travellingRef.current = nextTravelling;
        setTravelling(nextTravelling);
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

  const wanted = new Set([from]);
  if (travelling) wanted.add(from + 1);
  if (neighbours && primary)
    [from - 1, from + 1, from + 2].forEach((index) => wanted.add(index));
  const mounted = [...wanted]
    .filter((index) => index >= 0 && index <= LAST_SHOT)
    .sort((a, b) => a - b);

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
          key={`${shownMood}:${index}`}
          ref={(node) => {
            if (!node) return;
            layers.current.set(index, node);
            return () => {
              if (layers.current.get(index) === node)
                layers.current.delete(index);
            };
          }}
          className="absolute inset-0"
          style={{
            opacity: index === from ? 1 : 0,
            visibility: index === from ? "visible" : "hidden",
            willChange: "opacity, transform",
          }}
        >
          <Still
            beat={index}
            priority={index === from}
            mood={shownMood}
            onLoad={index === from ? handleFirstLoad : undefined}
          />
        </div>
      ))}
    </div>
  );
}
