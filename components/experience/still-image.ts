import { getImageProps } from "next/image";
import type { StillMood } from "@/lib/atmosphere";

// The pre-rendered studio stills: every camera shot, in five moods and two
// orientations. Shared by the home page's backdrop (Stills, Stage) and the
// inner pages' heroes. No "use client": server pages call it too.

export type StillOrientation = "landscape" | "portrait";

export const STILL_SIZE: Record<
  StillOrientation,
  { width: number; height: number }
> = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 860, height: 1864 },
};

/** Where a still lives. Bump the folder version when re-capturing them. */
export const stillSrc = (
  beat: number,
  orientation: StillOrientation,
  mood: StillMood,
) => `/experience/atmosphere-v6/${mood}/shot-${beat}-${orientation}.webp`;

/**
 * The image props for one still. The home page's start-of-page preload asks
 * for exactly these URLs, so keep both in step.
 */
export function stillImage(
  beat: number,
  orientation: StillOrientation,
  mood: StillMood,
  priority: boolean,
  sizes = "100vw",
) {
  return getImageProps({
    alt: "",
    src: stillSrc(beat, orientation, mood),
    ...STILL_SIZE[orientation],
    sizes,
    fetchPriority: priority ? "high" : "low",
  }).props;
}
