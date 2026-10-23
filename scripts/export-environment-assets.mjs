// Optimized runtime panoramas. Masters and generation prompts live in assets/environments/.
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

const sharp = createRequire(import.meta.resolve("next"))("sharp");

const out = "public/experience/environments";
await mkdir(out, { recursive: true });
for (const [source, mood] of [
  ["clear", "day"],
  ["dusk", "dusk"],
  ["night", "night"],
  ["day", "overcast"],
]) {
  await sharp(`assets/environments/rooftop-${source}-source.png`)
    .resize({ width: 4096, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(`${out}/rooftop-${mood}.webp`);
  console.log(`Exported ${mood}`);
}
