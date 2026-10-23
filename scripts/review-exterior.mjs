// Review photographic surroundings and mood transitions in the live 3D scene.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const base = process.env.EXTERIOR_URL ?? "http://localhost:3002";
const out = path.resolve(
  process.env.EXTERIOR_DIR ?? "artifacts/highrise-review",
);
const selectedMoods = process.env.EXTERIOR_MOODS?.split(",");
const shotsToReview = (process.env.EXTERIOR_SHOTS ?? "0,1,2,7")
  .split(",")
  .map(Number);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (error) => {
    if (!errors.includes(error.message)) errors.push(error.message);
  });
  page.on("console", (message) => {
    if (
      /THREE.WebGLProgram: Shader Error|GL_INVALID|VALIDATE_STATUS.*false/.test(
        message.text(),
      )
    )
      errors.push(message.text());
  });
  await page.goto(`${base}/?scene=night`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-live-ready="true"]', { timeout: 60000 });
  await page.addStyleTag({
    content: "nextjs-portal { visibility: hidden !important; }",
  });
  await page.waitForTimeout(6500);
  assert.deepEqual(errors, [], "Scene initializes without errors");
  const shots = await page
    .locator("[data-beat]")
    .evaluateAll((elements) =>
      elements.map((e) => e.getBoundingClientRect().top + window.scrollY),
    );
  const results = [];
  for (const [mood, label] of [
    ["night", "Night"],
    ["day", "Day"],
    ["dusk", "Dusk"],
    ["overcast", "Cloudy"],
    ["rain", "Rain"],
    ["night", "Night"],
  ]) {
    if (selectedMoods && !selectedMoods.includes(mood)) continue;
    const trigger = page.getByRole("button", { name: /^Studio atmosphere:/ });
    await trigger.click();
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(4000);
    for (const shot of shotsToReview) {
      await page.evaluate((y) => window.scrollTo(0, y + 4), shots[shot]);
      await page.waitForTimeout(2300);
      await page.screenshot({
        path: path.join(out, `${mood}-shot-${shot}.png`),
      });
      assert.equal(
        await page.locator('[data-live-ready="true"]').count(),
        1,
        "3D stays mounted during a weather change",
      );
    }
    assert.deepEqual(errors, [], "No JavaScript or WebGL shader errors");
    const panoramaLoads = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((entry) => entry.name.includes("/experience/environments/"))
        .map((entry) => entry.name),
    );
    assert.equal(
      panoramaLoads.length,
      2,
      "All moods share two full-resolution city photographs without repeat downloads",
    );
    results.push({
      mood,
      errors: [...errors],
      panoramaLoads: panoramaLoads.length,
    });
    console.log(`reviewed ${mood}`);
  }
  await writeFile(
    path.join(out, "report.json"),
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}
