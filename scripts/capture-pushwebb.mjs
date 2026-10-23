// Refresh the PUSHWebb device screenshots after its interactive robot loads.
// Run: node scripts/capture-pushwebb.mjs

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const out = path.resolve("public/work");
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});

await mkdir(out, { recursive: true });

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
    await page.goto("https://www.pushwebb.com", {
      waitUntil: "networkidle",
      timeout: 60_000,
    });
    // The hero defers Spline until pointer, touch, keyboard or scroll input.
    await page.mouse.move(size.width / 2, size.height * 0.45, { steps: 8 });
    await page.locator(".robot-tint canvas").waitFor({
      state: "visible",
      timeout: 90_000,
    });
    await page.locator(".robot-tint .loader").waitFor({
      state: "detached",
      timeout: 90_000,
    });
    await page.evaluate(() => document.fonts.ready);
    // Let the model's materials and its entrance animation finish rendering.
    await page.waitForTimeout(8000);
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
    const file = path.join(out, `pushwebb-${size.name}-bot.webp`);
    await writeFile(file, Buffer.from(webp, "base64"));
    console.log(`Saved ${file} with the robot loaded`);
    await page.close();
  }
} finally {
  await browser.close();
}
