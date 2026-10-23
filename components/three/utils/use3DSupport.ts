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

/**
 * Which live renderer a device can run:
 * - "desktop": full quality, with post-processing
 * - "mobile": tuned for phone and tablet GPUs
 * - "fallback": none; show the static images
 */
export type SceneTier = "desktop" | "mobile" | "fallback";

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */

/* Computers with this many CPU cores or fewer get the static fallback. */
const MAX_LOW_END_CORES = 4;
/* Phones reporting less memory than this (in GB, Chrome only) get the fallback. */
const MIN_PHONE_MEMORY = 4;
/* Connections this slow skip the 3D download (about 3 MB on phones). */
const SLOW_CONNECTIONS = ["slow-2g", "2g", "3g"];

/* ════════════════════════════════════════════════════════════════════════ */

type DeviceNavigator = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  deviceMemory?: number;
};

/**
 * WebGL 2 with a hardware GPU (`failIfMajorPerformanceCaveat` rejects
 * software rendering). Returns the GPU's name, or null without one.
 */
function probeGpu(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: true,
    });
    if (!gl) return null;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(
      gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "",
    );
    // Free the probe context right away; browsers cap how many can be open.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch {
    return null;
  }
}

/**
 * Phone GPUs that can't hold a smooth frame rate in the studio: budget
 * Adreno, Mali and PowerVR chips, and software renderers. Anything not listed
 * gets the live scene, and the scene's own frame-rate check steps in if the
 * device turns out slower than it looks.
 */
export function isWeakPhoneGpu(name: string) {
  const gpu = name.toLowerCase();
  if (/swiftshader|llvmpipe|software|powervr|img bxm/.test(gpu)) return true;
  const adreno = gpu.match(/adreno[^0-9]*(\d{3})/);
  if (adreno) return Number(adreno[1]) <= 610;
  if (/mali-(t|4|3)/.test(gpu)) return true; // Midgard and Utgard generations
  const mali = gpu.match(/mali-g(\d+)/);
  if (mali) return Number(mali[1]) < 68; // G31 to G57
  return false;
}

function detectTier(): SceneTier {
  const nav = navigator as DeviceNavigator;
  if (nav.connection?.saveData === true) return "fallback";

  // Phones and tablets: a touch screen with no hover is the primary input.
  const touchFirst = window.matchMedia(
    "(hover: none) and (pointer: coarse)",
  ).matches;

  if (touchFirst) {
    if (SLOW_CONNECTIONS.includes(nav.connection?.effectiveType ?? ""))
      return "fallback";
    if (
      typeof nav.deviceMemory === "number" &&
      nav.deviceMemory < MIN_PHONE_MEMORY
    )
      return "fallback";
    const gpu = probeGpu();
    return gpu === null || isWeakPhoneGpu(gpu) ? "fallback" : "mobile";
  }

  // Phone browsers report core counts unreliably, so this applies to computers only.
  const lowEndCpu =
    typeof nav.hardwareConcurrency === "number" &&
    nav.hardwareConcurrency <= MAX_LOW_END_CORES;
  if (lowEndCpu) return "fallback";
  return probeGpu() === null ? "fallback" : "desktop";
}

let cachedTier: SceneTier | null = null;

const subscribe = () => () => {};
const getSnapshot = () => (cachedTier ??= detectTier());
const getServerSnapshot = () => null;

/**
 * Which renderer this device gets. Runs the device check once per page load
 * and caches it; "pending" on the server and the first paint.
 */
export function useSceneTier(): SceneTier | "pending" {
  return (
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) ?? "pending"
  );
}

/**
 * Decides between a 3D component and its static fallback. The smaller 3D
 * pieces (the orb, the work showcase, the logo) are desktop only.
 */
export function use3DSupport(mode: RenderMode = "auto"): RenderDecision {
  const tier = useSceneTier();

  if (mode === "fallback") return "fallback";
  if (tier === "pending") return "pending";
  if (mode === "3d") return "3d";
  return tier === "desktop" ? "3d" : "fallback";
}
