// Export web-ready branding from the approved PNG masters in assets/brand.
// Run: node scripts/export-brand-assets.mjs

import { createRequire } from "node:module";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Reuse the image processor installed with Next.js.
const requireFromNext = createRequire(import.meta.resolve("next"));
const sharp = requireFromNext("sharp");
const source = path.resolve("assets/brand");
const out = path.resolve("public/brand");
await mkdir(out, { recursive: true });

await sharp(path.join(source, "wordmark-master.png"))
  .resize(984, 304, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(path.join(out, "bellops-wordmark-transparent.png"));

await sharp(path.join(source, "share-master.png"))
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(path.join(out, "share-banner.jpg"));

const icon = path.join(source, "icon-master.png");
for (const size of [192, 512]) {
  await sharp(icon)
    .resize(size, size)
    .png()
    .toFile(path.join(out, `icon-${size}.png`));
}
// The approved icon already keeps its mark inside the central safe circle.
await copyFile(
  path.join(out, "icon-512.png"),
  path.join(out, "icon-maskable-512.png"),
);
await sharp(icon).resize(48, 48).png().toFile("app/icon.png");
await sharp(icon).resize(180, 180).png().toFile("app/apple-icon.png");

// A real multi-resolution ICO for browsers that request /favicon.ico directly.
const sizes = [16, 32, 48];
const frames = await Promise.all(
  sizes.map((size) =>
    sharp(icon).resize(size, size).ensureAlpha().png().toBuffer(),
  ),
);
const directory = Buffer.alloc(6 + 16 * frames.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
for (const [index, frame] of frames.entries()) {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
}
await writeFile("app/favicon.ico", Buffer.concat([directory, ...frames]));
console.log("Exported wordmark, sharing banner, favicon and app icons.");
