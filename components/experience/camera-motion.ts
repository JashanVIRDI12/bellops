// How the view travels between camera shots as the page scrolls. Shared by the
// live 3D (scene/OfficeScene) and the stills phones see (Stills), so both
// follow the scroll with the same weight and settle on each shot the same way.
// No three.js here: the stills ship in the main bundle.

/* Tweakable: how closely the view follows the scroll; higher = tighter. */
export const SCROLL_DAMPING = 4.5;

/** Longest step the smoothing takes in one frame, so a dropped frame doesn't jump. */
export const MAX_FRAME_DELTA = 1 / 30;

/** Frame-rate independent easing toward a target (same as THREE.MathUtils.damp). */
export function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number,
) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/** Smooth in and out of every shot, so the view settles on each one. */
export function easeShot(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
