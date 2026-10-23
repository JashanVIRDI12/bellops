// Camera shots for the studio tour, one per scroll beat, plus the math that
// glides between them. World units are meters; the office floor is y = -1.45,
// the desk top y = -0.64, the window wall x = 0 and the logo wall x = 9.16.

import * as THREE from "three";
import { easeShot } from "../camera-motion";

type Vec3 = [number, number, number];

export type Shot = {
  /** Where the camera stands. */
  position: Vec3;
  /** What it looks at. */
  target: Vec3;
  /** Vertical field of view in degrees, for landscape screens. */
  fov: number;
  /** Afternoon light level for this shot: 1 = normal, lower = dimmer. */
  exposure: number;
  /** Laptop screen brightness: 0 = off, 1 = full. */
  screen: number;
};

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable: the shot list. Order must match the chapters in lib/content.ts.
 * ════════════════════════════════════════════════════════════════════════ */
export const SHOTS: Shot[] = [
  // Intro: up close to the glass, looking out over the sea of clouds. Turned
  // so the left frame falls out of view behind the headline; one frame and
  // the low sun stay on the right.
  // Scrolling pulls straight back over the desk into the studio shot.
  {
    position: [1.55, 0.42, 0],
    target: [-10, 1.05, -1.6],
    fov: 44,
    exposure: 1,
    screen: 0.3,
  },
  // Studio: turn around to the windows, the room backlit by the low sun.
  {
    position: [8.6, 0.32, 0.01],
    target: [0, -0.2, 0],
    fov: 50,
    exposure: 1,
    screen: 0.4,
  },
  // Approach: along the glass, the plant and its long shadow in the foreground.
  {
    position: [1.6, 0.15, 3.5],
    target: [0.9, -0.35, -2.4],
    fov: 46,
    exposure: 1,
    screen: 0.4,
  },
  // Work 1–3: over the chair at the laptop, closer each time. The laptop sits
  // right of center so the project name has the bottom left.
  {
    position: [2.7, -0.12, 0.35],
    target: [4.0, -0.62, -0.2],
    fov: 34,
    exposure: 0.92,
    screen: 1,
  },
  {
    position: [3.0, -0.2, -0.55],
    target: [4.0, -0.6, -0.08],
    fov: 32,
    exposure: 0.9,
    screen: 1,
  },
  {
    position: [3.32, -0.33, 0.12],
    target: [4.03, -0.55, -0.13],
    fov: 30,
    exposure: 0.88,
    screen: 1,
  },
  // Services: straight down; window shadows stripe the floor, desk in the left third.
  {
    position: [3.86, 2.4, 0.95],
    target: [3.9, -1.45, 0.95],
    fov: 60,
    exposure: 1,
    screen: 0.8,
  },
  // Contact: from the back corner toward the sunlit glass corner.
  {
    position: [8.3, 0.75, 3.7],
    target: [0.6, -0.55, -3.0],
    fov: 52,
    exposure: 1,
    screen: 0.6,
  },
];

/** Below this width/height ratio the field of view widens so narrow screens still see the scene. */
const REFERENCE_ASPECT = 1.5;
/** How much of the landscape framing narrow screens keep (1 = all of it, wider lens). */
const NARROW_COVERAGE = 0.72;
const MAX_FOV = 78;

/* ════════════════════════════════════════════════════════════════════════ */

export type ShotSample = {
  position: THREE.Vector3;
  yaw: number;
  pitch: number;
  fov: number;
  exposure: number;
  screen: number;
};

const toAngles = (shot: Shot) => {
  const dir = new THREE.Vector3(...shot.target)
    .sub(new THREE.Vector3(...shot.position))
    .normalize();
  return {
    yaw: Math.atan2(dir.x, dir.z),
    pitch: THREE.MathUtils.clamp(Math.asin(dir.y), -1.55, 1.55),
  };
};

/**
 * Builds a sampler: progress (0 … shots-1) → camera state. Positions follow a
 * smooth curve through every shot; angles take the shortest turn between shots.
 */
export function createShotSampler(shots: Shot[]) {
  const curve = new THREE.CatmullRomCurve3(
    shots.map((shot) => new THREE.Vector3(...shot.position)),
    false,
    "centripetal",
  );

  const angles = shots.map(toAngles);
  for (let i = 1; i < angles.length; i++) {
    const prev = angles[i - 1]!;
    const current = angles[i]!;
    while (current.yaw - prev.yaw > Math.PI) current.yaw -= Math.PI * 2;
    while (current.yaw - prev.yaw < -Math.PI) current.yaw += Math.PI * 2;
  }

  const last = shots.length - 1;

  return (progress: number, out: ShotSample) => {
    const p = THREE.MathUtils.clamp(progress, 0, last);
    const index = Math.min(Math.floor(p), last - 1);
    const t = easeShot(p - index);
    const a = shots[index]!;
    const b = shots[index + 1] ?? a;
    const angleA = angles[index]!;
    const angleB = angles[index + 1] ?? angleA;

    curve.getPoint((index + t) / last, out.position);
    out.yaw = THREE.MathUtils.lerp(angleA.yaw, angleB.yaw, t);
    out.pitch = THREE.MathUtils.lerp(angleA.pitch, angleB.pitch, t);
    out.fov = THREE.MathUtils.lerp(a.fov, b.fov, t);
    out.exposure = THREE.MathUtils.lerp(a.exposure, b.exposure, t);
    out.screen = THREE.MathUtils.lerp(a.screen, b.screen, t);
    return out;
  };
}

/** Widens the lens on narrow (portrait) screens so the framing survives. */
export function fitFov(fov: number, aspect: number) {
  if (aspect >= REFERENCE_ASPECT) return fov;
  const half = THREE.MathUtils.degToRad(fov / 2);
  const horizontal =
    Math.atan(Math.tan(half) * REFERENCE_ASPECT) * NARROW_COVERAGE;
  const vertical = Math.atan(Math.tan(horizontal) / aspect);
  return Math.min(
    MAX_FOV,
    Math.max(fov, THREE.MathUtils.radToDeg(vertical * 2)),
  );
}
