"use client";

// What the start-up loader waits for, reported by the backdrop (Stage and
// Stills). Plain module state: the loader reads it every frame, so nothing
// here re-renders React.

export type SceneSignals = {
  /** "live" = the 3D studio, "stills" = pre-rendered images, null = not decided yet. */
  source: "live" | "stills" | null;
  /** 0–100: the 3D models and textures downloaded so far. */
  progress: number;
  /** The 3D studio has rendered its first frame. */
  ready: boolean;
};

export const sceneSignals: SceneSignals = {
  source: null,
  progress: 0,
  ready: false,
};

export function reportScene(next: Partial<SceneSignals>) {
  Object.assign(sceneSignals, next);
}

/** Stills that have finished loading, as "mood:shot", e.g. "night:0". */
export const loadedStills = new Set<string>();

/** Records a loaded still from its URL (which names the mood and shot). */
export function reportStill(url: string) {
  const match = decodeURIComponent(url).match(
    /atmosphere-v\d+\/([a-z]+)\/shot-(\d+)-/,
  );
  if (match) loadedStills.add(`${match[1]}:${match[2]}`);
}
