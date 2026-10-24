"use client";

type IdleWindow = Window & {
  requestIdleCallback?: Window["requestIdleCallback"];
  cancelIdleCallback?: Window["cancelIdleCallback"];
};

/**
 * Runs `callback` once the browser has a quiet moment, or after `timeout` ms
 * at most. Safari has no requestIdleCallback, so it gets a short delay
 * instead. Returns a function that cancels it.
 */
export function whenIdle(callback: () => void, timeout = 2000) {
  const idle = window as IdleWindow;
  if (idle.requestIdleCallback && idle.cancelIdleCallback) {
    const id = idle.requestIdleCallback(callback, { timeout });
    return () => idle.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(callback, Math.min(timeout, 300));
  return () => window.clearTimeout(id);
}
