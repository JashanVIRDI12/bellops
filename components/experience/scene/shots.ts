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
  /**
   * Framing for portrait screens (phones), where it differs. Anything left
   * out uses the values above. Field of view still widens to fit (fitFov).
   */
  portrait?: Partial<Pick<Shot, "position" | "target" | "fov">>;
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
  // 3D websites: low across the desk from the sign wall, toward the sun: the
  // chair, the back of the laptop, the plant and the sea of clouds beyond.
  // From the end of the desk, so the move to the work swings wide of the
  // laptop. Phones tilt down: the desk on top, the dark rug under the copy.
  {
    position: [5.4, -0.45, 1.5],
    target: [3.4, -0.55, -0.4],
    fov: 38,
    exposure: 1,
    screen: 0.5,
    portrait: { position: [5.9, 0.05, 1.55], target: [3.7, -2.0, -0.3] },
  },
  // Work 1–3: over the chair at the laptop, closer each time. The laptop sits
  // right of center so the project name has the bottom left. Phones stack
  // it instead: the sign on top, the laptop in the middle, the name below.
  {
    position: [2.7, -0.12, 0.35],
    target: [4.0, -0.62, -0.2],
    fov: 34,
    exposure: 0.92,
    screen: 1,
    portrait: { position: [2.5, -0.02, 0.06], target: [4.0, -0.38, 0] },
  },
  {
    position: [3.0, -0.2, -0.55],
    target: [4.0, -0.6, -0.08],
    fov: 32,
    exposure: 0.9,
    screen: 1,
    portrait: { position: [2.8, -0.1, -0.3], target: [4.0, -0.5, -0.08] },
  },
  {
    position: [3.32, -0.33, 0.12],
    target: [4.03, -0.55, -0.13],
    fov: 30,
    exposure: 0.88,
    screen: 1,
    portrait: { position: [3.12, -0.24, 0.06], target: [4.0, -0.42, 0] },
  },
  // Work 4: low along the desk from the side, the screen in profile against
  // the window light. Phones: the laptop in the top third.
  {
    position: [3.35, -0.5, 0.75],
    target: [3.9, -0.55, -0.05],
    fov: 34,
    exposure: 0.9,
    screen: 1,
    portrait: { position: [3.3, -0.3, 0.8], target: [3.92, -0.95, -0.05] },
  },
  // Work 5: from above, looking down over the keyboard to the screen; the
  // laptop on the right, the dark desk left for the copy. Phones: the
  // laptop on top, the chair below.
  {
    position: [3.5, 0.2, 0.05],
    target: [3.88, -0.6, -0.2],
    fov: 38,
    exposure: 0.9,
    screen: 1,
    portrait: { position: [3.4, 0.35, 0.05], target: [3.62, -0.62, 0] },
  },
  // Clients: the camera cranes up into the far corner and looks down across
  // the desk to the glass, on its way up to the services shot.
  {
    position: [7.6, 1.9, 3.3],
    target: [2.6, -1.1, -1.2],
    fov: 50,
    exposure: 1,
    screen: 0.7,
  },
  // Services: straight down; window shadows stripe the floor, desk in the left third.
  // Phones: the desk near the top, above the list.
  {
    position: [3.86, 2.4, 0.95],
    target: [3.9, -1.45, 0.95],
    fov: 60,
    exposure: 1,
    screen: 0.8,
    portrait: { position: [3.05, 2.4, 0.2], target: [3.09, -1.45, 0.2] },
  },
  // About: the BellOps sign on the back wall, at an angle and right of
  // center (clear of the copy), window shadows across the plaster.
  // Phones: square on from below, the sign in the top third, clear of the copy.
  {
    position: [5.9, 0.1, -2.9],
    target: [9.16, 0.38, -1.0],
    fov: 42,
    exposure: 1,
    screen: 0.6,
    portrait: { position: [5.6, 0.25, -1.2], target: [9.16, -0.7, 0] },
  },
  // FAQ: high in the window corner, looking back down at the desk and the sign.
  {
    position: [1.4, 2.1, -3.3],
    target: [5.5, -1.2, 1.2],
    fov: 52,
    exposure: 1,
    screen: 0.6,
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
/** Screens this wide (width/height) or wider use the landscape framing… */
const LANDSCAPE_FROM = 1;
/** …this narrow or narrower the portrait framing; in between, a blend. */
const PORTRAIT_FROM = 0.75;

/* ════════════════════════════════════════════════════════════════════════ */

export type ShotSample = {
  position: THREE.Vector3;
  yaw: number;
  pitch: number;
  fov: number;
  exposure: number;
  screen: number;
};

type Framing = { position: Vec3; target: Vec3; fov: number };

const toAngles = ({ position, target }: Framing) => {
  const dir = new THREE.Vector3(...target)
    .sub(new THREE.Vector3(...position))
    .normalize();
  return {
    yaw: Math.atan2(dir.x, dir.z),
    pitch: THREE.MathUtils.clamp(Math.asin(dir.y), -1.55, 1.55),
  };
};

/** Shifts `angle` by whole turns to within half a turn of `reference`. */
const nearest = (angle: number, reference: number) =>
  angle - Math.round((angle - reference) / (Math.PI * 2)) * Math.PI * 2;

/** One framing of the whole tour: a smooth path and the view angles at each shot. */
function createTrack(framings: Framing[], reference?: { yaw: number }[]) {
  const curve = new THREE.CatmullRomCurve3(
    framings.map((framing) => new THREE.Vector3(...framing.position)),
    false,
    "centripetal",
  );
  const angles = framings.map(toAngles);
  angles.forEach((angle, i) => {
    // Each shot takes the shortest turn from the last; a second framing
    // stays on the same turn as the first, so blending them never spins.
    if (reference) angle.yaw = nearest(angle.yaw, reference[i]!.yaw);
    else if (i > 0) angle.yaw = nearest(angle.yaw, angles[i - 1]!.yaw);
  });
  return { curve, angles, fovs: framings.map((framing) => framing.fov) };
}

/** 0 on landscape screens, 1 on portrait ones, a blend in between. */
const portraitWeight = (aspect: number) =>
  1 - THREE.MathUtils.smoothstep(aspect, PORTRAIT_FROM, LANDSCAPE_FROM);

type Track = ReturnType<typeof createTrack>;
type View = { yaw: number; pitch: number; fov: number };

// Scratch values, reused every frame so sampling never allocates.
const portraitPoint = new THREE.Vector3();
const wideView: View = { yaw: 0, pitch: 0, fov: 0 };
const tallView: View = { yaw: 0, pitch: 0, fov: 0 };

/** One track's camera at `index + t` along the tour. */
function sampleTrack(
  track: Track,
  index: number,
  t: number,
  along: number,
  position: THREE.Vector3,
  view: View,
) {
  track.curve.getPoint(along, position);
  const from = track.angles[index]!;
  const to = track.angles[index + 1] ?? from;
  const fromFov = track.fovs[index]!;
  view.yaw = THREE.MathUtils.lerp(from.yaw, to.yaw, t);
  view.pitch = THREE.MathUtils.lerp(from.pitch, to.pitch, t);
  view.fov = THREE.MathUtils.lerp(fromFov, track.fovs[index + 1] ?? fromFov, t);
}

/**
 * Builds a sampler: progress (0 … shots-1) and screen aspect → camera state.
 * Positions follow a smooth curve through every shot; angles take the
 * shortest turn between shots.
 */
export function createShotSampler(shots: Shot[]) {
  const landscape = createTrack(shots);
  const portrait = createTrack(
    shots.map((shot) => ({
      position: shot.portrait?.position ?? shot.position,
      target: shot.portrait?.target ?? shot.target,
      fov: shot.portrait?.fov ?? shot.fov,
    })),
    landscape.angles,
  );
  const last = shots.length - 1;

  return (progress: number, out: ShotSample, aspect = REFERENCE_ASPECT) => {
    const p = THREE.MathUtils.clamp(progress, 0, last);
    const index = Math.min(Math.floor(p), last - 1);
    const t = easeShot(p - index);
    const a = shots[index]!;
    const b = shots[index + 1] ?? a;
    const along = (index + t) / last;
    const w = portraitWeight(aspect);

    sampleTrack(landscape, index, t, along, out.position, wideView);
    out.yaw = wideView.yaw;
    out.pitch = wideView.pitch;
    out.fov = wideView.fov;
    if (w > 0) {
      sampleTrack(portrait, index, t, along, portraitPoint, tallView);
      out.position.lerp(portraitPoint, w);
      out.yaw = THREE.MathUtils.lerp(out.yaw, tallView.yaw, w);
      out.pitch = THREE.MathUtils.lerp(out.pitch, tallView.pitch, w);
      out.fov = THREE.MathUtils.lerp(out.fov, tallView.fov, w);
    }
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

/** Fits a sampled shot to the screen: widens its lens on narrow screens. */
export function fitShot(out: ShotSample, aspect: number) {
  out.fov = fitFov(out.fov, aspect);
  return out;
}
