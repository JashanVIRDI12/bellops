"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { preload } from "react-dom";
import type { WorkProject } from "@/lib/work";
import { SceneErrorBoundary } from "@/components/three/utils/SceneErrorBoundary";
import { cx } from "@/components/three/utils/cx";
import {
  useSceneTier,
  type SceneTier,
} from "@/components/three/utils/use3DSupport";
import { usePrefersReducedMotion } from "@/components/three/utils/usePrefersReducedMotion";
import { Stills, type StillsMode } from "./Stills";
import { useEnvironment } from "./environment-store";
import { reportScene } from "./loader-store";
import { modelsFor, type LiveTier } from "./scene/profile";

// three.js, the models and postprocessing load in their own chunk, and only on
// devices that get the live scene.
const OfficeScene = dynamic(() => import("./scene/OfficeScene"), {
  ssr: false,
});

/* Remembers, for the browser session, that this device was too slow for 3D. */
const TOO_SLOW_KEY = "bellops:stills";
/* How long the live scene takes to fade out when handing over to the stills. */
const HANDOVER_MS = 1000;

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
  const markReady = useCallback(() => setReady(true), []);
  const reportWarmup = useCallback(
    (fraction: number) => reportScene({ warmup: fraction }),
    [],
  );
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
  const showing = live && ready && retired === "no";
  // The still for the current shot paints first everywhere; the live scene
  // fades in over it once it's ready.
  const stills: StillsMode = showing ? "hide" : "show";

  // Once this device has passed the 3D check, download its models alongside
  // the 3D code instead of after it. Devices that get images never fetch them.
  if (live && liveTier)
    for (const model of modelsFor(liveTier))
      preload(model, { as: "fetch", crossOrigin: "anonymous" });

  // Keep the start-up loader informed.
  useEffect(() => {
    reportScene({
      source: tier === "pending" ? null : live ? "live" : "stills",
      progress: loaded,
      ready: live && ready,
    });
  }, [tier, live, loaded, ready]);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-0 h-lvh bg-[#151c29]"
      data-scene-mood={atmosphere.still}
      data-scene-renderer={live && liveTier ? liveTier : "stills"}
      data-scene-source={
        mode !== "auto" ? "preview" : weather ? "weather" : "clock"
      }
    >
      <Stills mode={stills} mood={atmosphere.still} />

      {live && liveTier && (
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
              onWarmup={reportWarmup}
              onContextLost={markFailed}
              onTooSlow={markTooSlow}
            />
          </SceneErrorBoundary>
          {/* Phones skip the post-processing pass; the same vignette, in CSS. */}
          {liveTier === "mobile" && <div className="stage-vignette" />}
        </div>
      )}

      {/* Loading line, only while the live scene downloads. */}
      {live && !ready && (
        <div className="absolute inset-x-0 top-0 h-px bg-white/5">
          <div
            className="bg-violet h-full transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(4, loaded)}%` }}
          />
        </div>
      )}
    </div>
  );
}
