"use client";

import { useSyncExternalStore } from "react";

/**
 * How a 3D component decides what to show.
 * - "auto": 3D on capable devices, the static fallback everywhere else (default)
 * - "3d": always try 3D (handy for testing on a phone)
 * - "fallback": always show the static fallback
 */
export type RenderMode = "auto" | "3d" | "fallback";

/** What the component should render right now. "pending" = not known yet (server + first paint). */
export type RenderDecision = "pending" | "3d" | "fallback";

/* Tweakable: devices with this many CPU cores or fewer get the static fallback. */
const MAX_LOW_END_CORES = 4;

let cachedCapable: boolean | null = null;

/** WebGL 2 is required by three.js r163+. `failIfMajorPerformanceCaveat` rejects software rendering. */
function hasHardwareWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: true,
    });
    if (!gl) return false;
    // Free the probe context right away; browsers cap how many can be open.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function detectCapable(): boolean {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
  };

  const lowEndCpu =
    typeof nav.hardwareConcurrency === "number" &&
    nav.hardwareConcurrency <= MAX_LOW_END_CORES;
  // Phones and tablets: a touch screen with no hover is the primary input.
  const touchFirst = window.matchMedia(
    "(hover: none) and (pointer: coarse)",
  ).matches;
  const saveData = nav.connection?.saveData === true;

  if (lowEndCpu || touchFirst || saveData) return false;
  return hasHardwareWebGL2();
}

const subscribe = () => () => {};
const getSnapshot = () => (cachedCapable ??= detectCapable());
const getServerSnapshot = () => null;

/**
 * Decides between the live 3D scene and the static fallback.
 * Runs the device check once per page load and caches it.
 */
export function use3DSupport(mode: RenderMode = "auto"): RenderDecision {
  const capable = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (mode === "fallback") return "fallback";
  if (capable === null) return "pending";
  if (mode === "3d") return "3d";
  return capable ? "3d" : "fallback";
}
