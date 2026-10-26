"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { preload } from "react-dom";
import "./stage.css";
import type { StillMood } from "@/lib/atmosphere";
import type { WorkProject } from "@/lib/work";
import { SceneErrorBoundary } from "@/components/three/utils/SceneErrorBoundary";
import { cx } from "@/components/three/utils/cx";
import {
  useSceneTier,
  type SceneTier,
} from "@/components/three/utils/use3DSupport";
import { usePrefersReducedMotion } from "@/components/three/utils/usePrefersReducedMotion";
import { whenIdle } from "@/components/three/utils/whenIdle";
import { Stills, type StillsMode } from "./Stills";
import { stillImage } from "./still-image";
import { useEnvironment } from "./environment-store";
import { reportScene } from "./scene-signals";
import { modelsFor, type LiveTier } from "./scene/profile";

// three.js, the models and postprocessing load in their own chunk, and only on
// devices that get the live scene.
const OfficeScene = dynamic(() => import("./scene/OfficeScene"), {
  ssr: false,
});

/*
 * Starts downloading the first still before any JavaScript runs: a tiny
 * inline script works out the visitor's mood from their clock (the same hours
 * as resolveAtmosphere in lib/atmosphere.ts, or a ?scene= preview) and adds a
 * high-priority preload for that mood's still, in this screen's orientation.
 * The server can't know either, so it can't preload the right one itself.
 */
const MOODS: StillMood[] = ["day", "dusk", "night", "overcast", "rain"];
const firstStills = Object.fromEntries(
  MOODS.map((mood) => [
    mood,
    [
      stillImage(0, "landscape", mood, true).srcSet,
      stillImage(0, "portrait", mood, true).srcSet,
    ],
  ]),
);
const preloadFirstStill = `(function(){try{var s=${JSON.stringify(firstStills)};var q=new URLSearchParams(location.search).get("scene");var d=new Date(),h=d.getHours()+d.getMinutes()/60;var m=s[q]?q:h<6||h>=19?"night":h<8||h>=17?"dusk":"day";var l=document.createElement("link");l.rel="preload";l.as="image";l.setAttribute("fetchpriority","high");l.setAttribute("imagesrcset",s[m][matchMedia("(orientation: portrait)").matches?1:0]);l.setAttribute("imagesizes","100vw");document.head.appendChild(l)}catch(e){}})()`;

/* Remembers, for the browser session, that this device was too slow for 3D. */
const TOO_SLOW_KEY = "bellops:stills";
/* How long the live scene takes to fade out when handing over to the stills. */
const HANDOVER_MS = 1000;
/* The 3D starts loading once the first still is up and the browser is idle,
   or after these limits (ms) at most. */
const IDLE_WAIT = 2500;
const STILL_WAIT = 4000;

/**
 * `?render=` forces a renderer, for testing on a real device:
 * live (3D with this device's settings), mobile, desktop or stills.
 */
function forcedTier(): SceneTier | "live" | null {
  if (typeof window === "undefined") return null;
  const value = new URL(window.location.href).searchParams.get("render");
  if (value === "stills") return "fallback";
  if (value === "live" || value === "mobile" || value === "desktop")
    return value;
  return null;
}

function rememberedTooSlow() {
  try {
    return sessionStorage.getItem(TOO_SLOW_KEY) === "1";
  } catch {
    return false;
  }
}

// Read once per page load, so a device found too slow mid-visit still gets
// its fade to the stills instead of an abrupt switch.
let launch: { forced: ReturnType<typeof forcedTier>; tooSlow: boolean } | null =
  null;
const launchOptions = () =>
  (launch ??= { forced: forcedTier(), tooSlow: rememberedTooSlow() });

/** The renderer for this visitor: a forced one, the device's tier, or none yet. */
function useLiveTier(): LiveTier | "fallback" | "pending" {
  const detected = useSceneTier();
  if (detected === "pending") return "pending";
  const { forced, tooSlow } = launchOptions();
  if (forced === "fallback") return "fallback";
  if (forced === "mobile" || forced === "desktop") return forced;
  if (forced === "live")
    return window.matchMedia("(hover: none) and (pointer: coarse)").matches
      ? "mobile"
      : "desktop";
  if (detected === "fallback" || tooSlow) return "fallback";
  return detected;
}

/**
 * The fixed backdrop behind the whole page: the live studio on capable
 * devices (tuned separately for desktops and phones), crossfading stills
 * everywhere else.
 *
 * Nothing here holds up the page: the text paints straight away over a dark
 * backdrop (in light colors), the still for the visitor's mood fades in
 * behind it, and the live scene downloads, warms up out of sight and then
 * crossfades in. A thin line along the top tracks the 3D on its way.
 *
 * It's as tall as the screen with the browser's toolbars hidden (100lvh), so
 * on phones the 3D never resizes, and never stutters, as they slide away.
 */
export function Stage({ projects }: { projects: readonly WorkProject[] }) {
  const tier = useLiveTier();
  const reducedMotion = usePrefersReducedMotion();
  const { atmosphere, mode, weather } = useEnvironment();

  const [ready, setReady] = useState(false);
  /** "fading": handing over to the stills; "off": the live scene is gone. */
  const [retired, setRetired] = useState<"no" | "fading" | "off">("no");
  const [loaded, setLoaded] = useState(0);
  const [warmup, setWarmup] = useState(0);
  /** A still (or the live scene) is on screen, so the text can take its mood's colors. */
  const [stillShown, setStillShown] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const markStillShown = useCallback(() => setStillShown(true), []);
  /** The page has settled enough to start on the 3D. */
  const [idle, setIdle] = useState(false);
  const [stillWaitOver, setStillWaitOver] = useState(false);
  const markFailed = useCallback(() => setRetired("off"), []);
  const markTooSlow = useCallback(() => {
    try {
      sessionStorage.setItem(TOO_SLOW_KEY, "1");
    } catch {
      /* fine: the check runs again next time */
    }
    setRetired((state) => (state === "no" ? "fading" : state));
  }, []);

  useEffect(() => {
    if (retired !== "fading") return;
    const timer = window.setTimeout(() => setRetired("off"), HANDOVER_MS);
    return () => window.clearTimeout(timer);
  }, [retired]);

  const liveTier = tier === "desktop" || tier === "mobile" ? tier : null;
  // Reduced motion gets the stills: same story, no camera flight.
  const live = liveTier !== null && !reducedMotion && retired !== "off";

  // The page comes first: the 3D (code and models) waits for the first still
  // and a quiet moment, so it never competes with the opening paint.
  useEffect(() => {
    if (!live || stillShown) return;
    const timer = window.setTimeout(() => setStillWaitOver(true), STILL_WAIT);
    return () => window.clearTimeout(timer);
  }, [live, stillShown]);
  useEffect(() => {
    if (!live || idle || !(stillShown || stillWaitOver)) return;
    return whenIdle(() => setIdle(true), IDLE_WAIT);
  }, [live, idle, stillShown, stillWaitOver]);
  const started = live && idle;
  const showing = live && ready && retired === "no";
  // The still for the current shot paints first everywhere; the live scene
  // fades in over it once it's ready.
  const stills: StillsMode = showing ? "hide" : "show";

  // Once this device has passed the 3D check, download its models alongside
  // the 3D code instead of after it. Devices that get images never fetch them.
  if (started && liveTier)
    for (const model of modelsFor(liveTier))
      preload(model, { as: "fetch", crossOrigin: "anonymous" });

  // Analytics records which renderer each visit got.
  useEffect(() => {
    reportScene({
      source: tier === "pending" ? null : live ? "live" : "stills",
    });
  }, [tier, live]);

  // Downloading is most of the wait, the warm-up the rest.
  const progress = Math.min(1, 0.04 + (loaded / 100) * 0.66 + warmup * 0.3);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: preloadFirstStill }} />
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-0 h-lvh bg-(--midnight-raised)"
        data-backdrop={stillShown || showing ? "ready" : "pending"}
        data-scene-mood={atmosphere.still}
        data-scene-renderer={live && liveTier ? liveTier : "stills"}
        data-scene-source={
          mode !== "auto" ? "preview" : weather ? "weather" : "clock"
        }
      >
        {tier !== "pending" && (
          <Stills
            mode={stills}
            mood={atmosphere.still}
            primary={!live}
            onFirstLoad={markStillShown}
          />
        )}

        {started && liveTier && (
          <div
            data-live-ready={ready}
            className={cx(
              "absolute inset-0 transition-opacity duration-1000 ease-out",
              showing ? "opacity-100" : "opacity-0",
            )}
          >
            <SceneErrorBoundary onError={markFailed}>
              <OfficeScene
                tier={liveTier}
                projects={projects}
                atmosphere={atmosphere}
                active
                onReady={markReady}
                onProgress={setLoaded}
                onWarmup={setWarmup}
                onContextLost={markFailed}
                onTooSlow={markTooSlow}
              />
            </SceneErrorBoundary>
            {/* Phones skip the post-processing pass; the same vignette, in CSS. */}
            {liveTier === "mobile" && <div className="stage-vignette" />}
          </div>
        )}
      </div>

      {/* The 3D on its way: downloading, then warming up. */}
      {started && (
        <div
          aria-hidden
          className="scene-progress"
          data-done={showing || undefined}
          style={{ "--progress": showing ? 1 : progress } as CSSProperties}
        />
      )}
    </>
  );
}
