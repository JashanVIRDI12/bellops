// Re-captures the stills phones and fallback devices see, from the live 3D.
// Run after changing camera shots, lighting or the models:
//
//   pnpm build && pnpm start      (in one terminal)
//   pnpm stills                   (in another)
//
// Needs Google Chrome. Set CHROME_PATH if it isn't in the default macOS spot,
// and STILLS_URL if the site isn't on http://localhost:3000.
// Filter with STILLS_SHOTS=0, STILLS_MOODS=night or STILLS_SIZES=portrait
// (comma-separated values).

import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.STILLS_URL ?? "http://localhost:3000";
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = path.resolve("public/experience/atmosphere-v7");
const selectedShots = process.env.STILLS_SHOTS?.split(",").map(Number);
const moods = (
  process.env.STILLS_MOODS ?? "day,dusk,night,overcast,rain"
).split(",");
const selectedSizes = process.env.STILLS_SIZES?.split(",");
const SIZES = [
  { name: "landscape", width: 1920, height: 1080 },
  { name: "portrait", width: 860, height: 1864 },
].filter((size) => !selectedSizes || selectedSizes.includes(size.name));
const INTRO_WAIT = 6500; // the sign and room lighting settle
const SHOT_WAIT = 1800; // the camera settling on each shot
const QUALITY = 0.8;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});

for (const mood of moods) {
  const moodOut = path.join(OUT, mood);
  await mkdir(moodOut, { recursive: true });
  for (const size of SIZES) {
    const page = await browser.newPage({
      viewport: { width: size.width, height: size.height },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const url = new URL(BASE);
    url.searchParams.set("scene", mood);
    // The full-quality renderer, whatever the window's shape.
    url.searchParams.set("render", "desktop");
    await page.goto(url.href, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-live-ready="true"]', { timeout: 60_000 });
    // Only the scene: no text, header, grain or scrims (the page adds those live).
    await page.addStyleTag({
      content:
        "main, header, nav, .grain, [data-scrim], [data-scene-control], .contact-dock, .cookie-notice, nextjs-portal { visibility: hidden !important }",
    });
    await page.waitForTimeout(INTRO_WAIT);

    const starts = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("[data-beat]"),
        (beat) => beat.getBoundingClientRect().top + window.scrollY,
      ),
    );

    for (const [index, start] of starts.entries()) {
      if (selectedShots && !selectedShots.includes(index)) continue;
      await page.evaluate((y) => window.scrollTo(0, y), start + 4);
      await page.waitForTimeout(index === 0 ? 500 : SHOT_WAIT);
      if (errors.length) {
        throw new Error(`Scene failed to render: ${errors.join("\n")}`);
      }
      const png = await page.screenshot();
      // Encode to WebP in the browser itself, so no image library is needed.
      const webp = await page.evaluate(
        async ([base64, quality]) => {
          const image = new Image();
          image.src = `data:image/png;base64,${base64}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          canvas.getContext("2d")?.drawImage(image, 0, 0);
          const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/webp", quality),
          );
          const bytes = new Uint8Array(await blob.arrayBuffer());
          let binary = "";
          for (const byte of bytes) binary += String.fromCharCode(byte);
          return btoa(binary);
        },
        [png.toString("base64"), QUALITY],
      );
      const file = path.join(moodOut, `shot-${index}-${size.name}.webp`);
      await writeFile(file, Buffer.from(webp, "base64"));
      console.log(`saved ${path.relative(process.cwd(), file)}`);
    }
    await page.close();
  }
}

await browser.close();
