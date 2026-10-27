// Captures a project's device screenshots for lib/work.ts: the laptop
// (1600×1000) and the phone (780×1690, a 390px screen at 2×), as WebP named
// with a hash of their contents (they're cached for a year).
//
//   node scripts/capture-project.mjs <name> <url> ["Button text to press first"]
//
// e.g. node scripts/capture-project.mjs mngspirits https://www.mngspirits.com "YES, ENTER"
// The optional button dismisses an age gate or a cookie banner. Then put the
// file names it prints into the project's `image` and `mobileImage`.

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const [name, url, press] = process.argv.slice(2);
if (!name || !url) {
  console.error('Usage: node scripts/capture-project.mjs <name> <url> ["button"]');
  process.exit(1);
}

const out = path.resolve("public/projects");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});

try {
  for (const size of [
    { name: "desktop", width: 1600, height: 1000, scale: 1, mobile: false },
    { name: "mobile", width: 390, height: 845, scale: 2, mobile: true },
  ]) {
    const page = await browser.newPage({
      viewport: { width: size.width, height: size.height },
      deviceScaleFactor: size.scale,
      isMobile: size.mobile,
      hasTouch: size.mobile,
    });
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    if (press) {
      // Case-insensitive: buttons are often uppercased by CSS only.
      const escaped = press.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const button = page
        .getByRole("button", { name: new RegExp(escaped, "i") })
        .or(page.getByText(new RegExp(`^\\s*${escaped}\\s*$`, "i")))
        .first();
      if (await button.isVisible().catch(() => false)) {
        await button.click();
        await page.waitForLoadState("networkidle").catch(() => {});
      }
    }
    await page.evaluate(() => document.fonts.ready);
    // Entrance animations, lazy images and hero videos settle.
    await page.waitForTimeout(6000);
    const png = await page.screenshot();
    const webp = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0);
      return canvas.toDataURL("image/webp", 0.88).split(",")[1];
    }, png.toString("base64"));
    const bytes = Buffer.from(webp, "base64");
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 8);
    const file = path.join(out, `${name}-${size.name}.${hash}.webp`);
    await writeFile(file, bytes);
    console.log(`${size.name}: /projects/${path.basename(file)}`);
    await page.close();
  }
} finally {
  await browser.close();
}
