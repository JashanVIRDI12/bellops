// What the visitor steers the view with, besides scrolling:
// - a mouse: the view turns a little toward the cursor
// - a finger: the view follows a sideways drag, and springs back on release
// - the phone's tilt (Android): the studio shifts like a view through a window.
//   iOS only shares tilt after a permission prompt, so it's skipped there.
// No three.js here.

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */
const DRAG_GAIN = 2.6; // how far a sideways drag turns the view; the edge is soft
const TILT_RANGE = 14; // degrees of tilt for the full shift; tilting further moves the center
const TILT_DEADZONE = 0.035; // ignores sensor jitter, so a still phone lets the page rest
const TILT_RECENTER = 3.5; // seconds for the view to settle back to center when held still
/* ════════════════════════════════════════════════════════════════════════ */

/** Each channel runs from -1 to 1: right and up are positive. */
export const look = {
  pointer: { x: 0, y: 0 },
  drag: 0,
  tilt: { x: 0, y: 0 },
};

const clamp = (value: number, limit: number) =>
  Math.min(limit, Math.max(-limit, value));

/** True on browsers that only share tilt after a permission prompt (iOS). */
function tiltNeedsPermission() {
  const Orientation = window.DeviceOrientationEvent as
    | (typeof DeviceOrientationEvent & { requestPermission?: unknown })
    | undefined;
  return !Orientation || typeof Orientation.requestPermission === "function";
}

/** Tilt in degrees relative to the screen, however the phone is turned. */
function screenTilt(beta: number, gamma: number) {
  const angle = window.screen.orientation?.angle ?? 0;
  if (angle === 90) return { x: beta, y: -gamma };
  if (angle === 270 || angle === -90) return { x: -beta, y: gamma };
  if (angle === 180) return { x: -gamma, y: -beta };
  return { x: gamma, y: beta };
}

/**
 * Listens to the cursor, touches and tilt. Calls `onChange` whenever a channel
 * moves, so an on-demand render loop can wake up. Returns the cleanup.
 */
export function trackLook({
  onChange,
  touch,
}: {
  onChange: () => void;
  /** Follow fingers and tilt (touch screens). */
  touch: boolean;
}) {
  const controller = new AbortController();
  const options = { passive: true, signal: controller.signal };

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      look.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      look.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
      onChange();
    },
    options,
  );

  if (touch) {
    let startX: number | null = null;
    const release = () => {
      startX = null;
      if (look.drag !== 0) {
        look.drag = 0;
        onChange();
      }
    };
    window.addEventListener(
      "touchstart",
      (event) => {
        // A pinch is a zoom, not a look.
        startX = event.touches.length === 1 ? event.touches[0]!.clientX : null;
        if (startX === null) release();
      },
      options,
    );
    window.addEventListener(
      "touchmove",
      (event) => {
        if (startX === null || event.touches.length !== 1) return;
        const dx = (event.touches[0]!.clientX - startX) / window.innerWidth;
        // The studio moves with the finger, like dragging a panorama.
        look.drag = -Math.tanh(dx * DRAG_GAIN);
        onChange();
      },
      options,
    );
    window.addEventListener("touchend", release, options);
    window.addEventListener("touchcancel", release, options);

    if (!tiltNeedsPermission()) {
      let center: { x: number; y: number } | null = null;
      let last = 0;
      window.addEventListener(
        "deviceorientation",
        (event) => {
          if (event.beta === null || event.gamma === null) return;
          const tilt = screenTilt(event.beta, event.gamma);
          // Held near upright, gamma swings wildly; keep the last side-to-side value.
          const upright = Math.abs(event.beta) > 78;
          const dt = last ? Math.min((event.timeStamp - last) / 1000, 0.25) : 0;
          last = event.timeStamp;
          // The center trails behind the phone: tilting past the range drags
          // it along, and it slowly settles where the phone is held.
          const keep = Math.exp(-dt / TILT_RECENTER);
          center ??= { ...tilt };
          if (!upright)
            center.x = tilt.x - clamp(tilt.x - center.x, TILT_RANGE) * keep;
          center.y = tilt.y - clamp(tilt.y - center.y, TILT_RANGE) * keep;
          const x = upright ? look.tilt.x : (tilt.x - center.x) / TILT_RANGE;
          const y = (tilt.y - center.y) / TILT_RANGE;
          if (
            Math.abs(x - look.tilt.x) > TILT_DEADZONE ||
            Math.abs(y - look.tilt.y) > TILT_DEADZONE
          ) {
            look.tilt.x = x;
            look.tilt.y = y;
            onChange();
          }
        },
        options,
      );
    }
  }

  return () => {
    controller.abort();
    look.pointer.x = look.pointer.y = look.drag = 0;
    look.tilt.x = look.tilt.y = 0;
  };
}
