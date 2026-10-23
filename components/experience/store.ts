"use client";

// One tiny shared store for the scroll-driven experience. The page writes the
// scroll position here; the 3D scene and the HUD read it. It lives outside
// React so scrolling never re-renders the page.

import { useSyncExternalStore } from "react";

type Listener = () => void;

export const experience = {
  /** Scroll position in "beats": 0 = first camera shot, 1 = second, … (float). */
  progress: 0,
};

const listeners = new Set<Listener>();

export function setProgress(value: number) {
  if (value === experience.progress) return;
  experience.progress = value;
  listeners.forEach((listener) => listener());
}

export function subscribeProgress(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getBeat = () => Math.round(experience.progress);
const getServerBeat = () => 0;

/** The nearest camera beat. Re-renders only when it changes, not on every scroll frame. */
export function useBeat(): number {
  return useSyncExternalStore(subscribeProgress, getBeat, getServerBeat);
}
