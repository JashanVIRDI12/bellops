"use client";

import { useSyncExternalStore } from "react";

/*
 * How far the home page's live 3D studio has got: written by the backdrop
 * (Stage.tsx) while the models download and the scene warms up, read by the
 * loader over the opening scene (SceneLoader.tsx). Outside React, so only
 * the loader re-renders.
 */

export type SceneLoading =
  /** Nothing to show: no live 3D on this device, or it hasn't started. */
  | { state: "idle" }
  /** Downloading and warming up; progress from 0 to 1. */
  | { state: "loading"; progress: number }
  /** The live scene is on screen. */
  | { state: "done" };

const idle: SceneLoading = { state: "idle" };
let current: SceneLoading = idle;
const listeners = new Set<() => void>();

export function setSceneLoading(next: SceneLoading) {
  if (
    next.state === current.state &&
    (next.state !== "loading" ||
      (current.state === "loading" && next.progress === current.progress))
  )
    return;
  current = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The 3D's loading state; "idle" on the server and before it starts. */
export function useSceneLoading() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => idle,
  );
}
