// Render settings for each kind of device. Kept free of three.js so the page
// can read them (to preload the right model) without loading any 3D code.

import { MACBOOK_URL, OFFICE_MOBILE_URL, OFFICE_URL } from "./models";

export type LiveTier = "desktop" | "mobile";

export type RenderProfile = {
  tier: LiveTier;
  /** Highest pixel ratio rendered. */
  maxDpr: number;
  /** Pixel budget: big screens render at a lower ratio to stay within it. */
  maxPixels: number;
  /**
   * Post-processing (bloom, tone mapping, vignette and MSAA in a separate pass).
   * Off on phones: their tile-based GPUs pay heavily for full-screen passes but
   * get native MSAA almost for free, and the vignette is drawn in CSS.
   */
  composer: boolean;
  shadowMapSize: number;
  /** Cube map size for the studio reflections and the sign's reflection probe. */
  reflectionSize: number;
  /** Noise layers in the sky and cloud shader; each one costs about as much as the last. */
  skyOctaves: number;
  /** Raindrops outside the glass when it rains. */
  rainDrops: number;
  officeUrl: string;
  /** Camera turn with a finger drag, in radians, on touch screens. */
  fingerLook: number;
};

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */
export const PROFILES: Record<LiveTier, RenderProfile> = {
  desktop: {
    tier: "desktop",
    maxDpr: 1.75,
    maxPixels: Infinity,
    composer: true,
    shadowMapSize: 2048,
    reflectionSize: 256,
    skyOctaves: 5,
    rainDrops: 1500,
    officeUrl: OFFICE_URL,
    fingerLook: 0,
  },
  mobile: {
    tier: "mobile",
    maxDpr: 1.6,
    maxPixels: 1_150_000, // about a 390 × 844 phone at 1.6×
    composer: false,
    shadowMapSize: 1024,
    reflectionSize: 128,
    skyOctaves: 4,
    rainDrops: 700,
    officeUrl: OFFICE_MOBILE_URL,
    fingerLook: 0.11,
  },
};
/* ════════════════════════════════════════════════════════════════════════ */

/** The models a tier downloads, so the page can start fetching them early. */
export const modelsFor = (tier: LiveTier) => [
  PROFILES[tier].officeUrl,
  MACBOOK_URL,
];

/** The starting pixel ratio for this screen: sharp, within the pixel budget. */
export function startingDpr(profile: RenderProfile) {
  const device = window.devicePixelRatio || 1;
  const area = window.innerWidth * window.innerHeight;
  const budget = Math.sqrt(profile.maxPixels / Math.max(area, 1));
  return Math.max(1, Math.min(device, profile.maxDpr, budget));
}
