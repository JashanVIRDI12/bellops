// Per-frame values the camera rig computes and the rest of the scene reads.
// One studio scene exists at a time, so a module-level object is enough.

export const rig = {
  /** Light level for this frame: 1 = the shot's normal afternoon light. */
  exposure: 1,
  /** Laptop screen brightness for this frame: 0 = off, 1 = full. */
  screen: 0,
  /** Smoothed scroll progress in beats. */
  progress: 0,
  /** Load sequence, 0 → 1: the sunlight sweeps in across the logo. */
  intro: 0,
  /** Smoothed environment values, shared by the ceiling lights and reflections. */
  night: 0,
  indoor: 0,
  wet: 0,
  environmentKey: "",
  lightingSettled: false,
};

/* Tweakable: how long the load sequence (sun sweep + camera ease-in) takes, in seconds. */
export const INTRO_DURATION = 3.4;
/* Seconds before it starts, so the canvas has faded in first. */
export const INTRO_DELAY = 0.5;

/** Eased load progress for a time in seconds since the scene appeared. */
export function introAt(seconds: number) {
  const t = Math.min(1, Math.max(0, (seconds - INTRO_DELAY) / INTRO_DURATION));
  return 1 - Math.pow(1 - t, 3);
}
