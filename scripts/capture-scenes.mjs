// Capture the complete page, including text, at every settled camera shot.
// Start the site, then run:
//   SCENES_URL=http://localhost:3002 node scripts/capture-scenes.mjs
// Screenshots and overview sheets are saved in artifacts/scene-review.

import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const base = process.env.SCENES_URL ?? "http://localhost:3000";
const out = path.resolve(process.env.SCENES_DIR ?? "artifacts/scene-review");
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});
const reports = [];

await mkdir(out, { recursive: true });

try {
  for (const size of [
    { name: "desktop", width: 1440, height: 900, touch: false },
    { name: "mobile", width: 390, height: 844, touch: true },
  ]) {
    const page = await browser.newPage({
      viewport: { width: size.width, height: size.height },
      isMobile: size.touch,
      hasTouch: size.touch,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(
      await page.getByRole("navigation", { name: "Chapters" }).count(),
      0,
      "Chapter rail is removed",
    );
    await page.evaluate(() => document.fonts.ready);
    if (!size.touch) {
      await page.waitForSelector('[data-live-ready="true"]', {
        timeout: 60_000,
      });
    }
    await page.waitForTimeout(5500);
    // Hide only the development badge; the scene and all site UI stay visible.
    await page.addStyleTag({
      content: "nextjs-portal { visibility: hidden !important; }",
    });

    const scenes = await page.locator("[data-beat]").evaluateAll((elements) =>
      elements.map((element, index) => ({
        index,
        name: element.id || `work-${index - 2}`,
        top: element.getBoundingClientRect().top + window.scrollY,
      })),
    );
    const captures = [];

    for (const scene of scenes) {
      await page.evaluate((y) => window.scrollTo(0, y), scene.top + 4);
      await page.waitForTimeout(size.touch ? 1200 : 3200);
      const copy = await page
        .locator("[data-beat]")
        .nth(scene.index)
        .locator(".scene-copy")
        .evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return {
            heading: element.querySelector("h1,h2").textContent,
            color: getComputedStyle(element).color,
            opacity: getComputedStyle(element).opacity,
            visible: getComputedStyle(element).visibility,
            bounds: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            },
            viewport: { width: innerWidth, height: innerHeight },
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
      const name = `${size.name}-${scene.index}-${scene.name}`;
      assert.equal(copy.color, "rgb(255, 255, 255)", `${name}: text color`);
      assert.equal(copy.visible, "visible", `${name}: copy visibility`);
      assert.equal(Number(copy.opacity), 1, `${name}: reveal finished`);
      assert.ok(copy.bounds.y >= 80, `${name}: header clearance`);
      assert.ok(
        copy.bounds.y + copy.bounds.height <= size.height,
        `${name}: copy fits vertically`,
      );
      assert.equal(copy.overflow, false, `${name}: horizontal overflow`);
      const png = await page.screenshot({
        path: path.join(out, `${name}.png`),
      });
      captures.push({ name, base64: png.toString("base64") });
      reports.push({ name, ...copy });
      console.log(`Captured ${name}`);
    }
    assert.deepEqual(errors, [], `${size.name}: browser errors`);

    // Compose an overview in the browser, without another image dependency.
    const overview = await page.evaluate(
      async ({ captures, size }) => {
        const cols = 4;
        const width = size.touch ? 260 : 480;
        const height = Math.round((width * size.height) / size.width);
        const labelHeight = 32;
        const canvas = document.createElement("canvas");
        canvas.width = cols * width;
        canvas.height =
          Math.ceil(captures.length / cols) * (height + labelHeight);
        const context = canvas.getContext("2d");
        context.fillStyle = "#111118";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = "15px sans-serif";
        context.fillStyle = "#fff";
        for (const [index, capture] of captures.entries()) {
          const image = new Image();
          image.src = `data:image/png;base64,${capture.base64}`;
          await image.decode();
          const x = (index % cols) * width;
          const y = Math.floor(index / cols) * (height + labelHeight);
          context.fillText(capture.name, x + 12, y + 22);
          context.drawImage(image, x, y + labelHeight, width, height);
        }
        return canvas.toDataURL("image/png").split(",")[1];
      },
      { captures, size },
    );
    await writeFile(
      path.join(out, `${size.name}-overview.png`),
      Buffer.from(overview, "base64"),
    );
    await page.close();
  }
  await writeFile(
    path.join(out, "report.json"),
    `${JSON.stringify(reports, null, 2)}\n`,
  );
  console.log(`All scenes passed. Screenshots: ${out}`);
} finally {
  await browser.close();
}
