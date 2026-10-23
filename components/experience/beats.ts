import { chapters } from "@/lib/content";

/** Number of camera shots (beats). Must equal SHOTS.length in scene/shots.ts. */
export const SHOT_COUNT = chapters.reduce(
  (total, chapter) => total + chapter.beats,
  0,
);

/** The first beat of each chapter, e.g. work starts at beat 3. */
const firstBeats = chapters.reduce<number[]>((starts, _chapter, index) => {
  const previous = chapters[index - 1];
  starts.push(index === 0 ? 0 : starts[index - 1]! + (previous?.beats ?? 0));
  return starts;
}, []);

/** Index of the chapter a beat belongs to. */
export function chapterAt(beat: number) {
  let current = 0;
  firstBeats.forEach((start, index) => {
    if (beat >= start) current = index;
  });
  return current;
}
