"use client";

// Which renderer this visit got, reported by the backdrop (Stage) and read by
// analytics. Plain module state, so nothing here re-renders React.

export type SceneSignals = {
  /** "live" = the 3D studio, "stills" = pre-rendered images, null = not decided yet. */
  source: "live" | "stills" | null;
};

export const sceneSignals: SceneSignals = { source: null };

export function reportScene(next: Partial<SceneSignals>) {
  Object.assign(sceneSignals, next);
}
