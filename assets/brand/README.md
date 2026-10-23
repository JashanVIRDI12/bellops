# Bellops brand assets

The supplied logo is preserved in `reference-logo.png`. Its background-free
version is saved in `wordmark-master.png` and used in the header and organization
metadata. The icon uses the purple O so it remains readable in a small tab.

The transparent wordmark, sharing banner and icon masters were made with the
built-in **image_gen** tool using the supplied logo as the reference. Their final prompts are recorded
in [prompts.json](./prompts.json). The generated originals also remain in the
image generation library.

Run `node scripts/export-brand-assets.mjs` to export the production files:

- `public/brand/bellops-wordmark-transparent.png` — 984 × 304 transparent wordmark.
- `public/brand/share-banner.jpg` — 1200 × 630 Open Graph and Twitter card.
- `public/brand/icon-192.png` and `icon-512.png` — home-screen icons.
- `public/brand/icon-maskable-512.png` — maskable icon with safe padding.
- `app/favicon.ico` — 16px, 32px and 48px favicon frames.
- `app/icon.png` — 48px browser icon.
- `app/apple-icon.png` — 180px Apple touch icon.

Exports strip screenshot metadata, keep the original aspect ratios, and use
Next.js's installed Sharp dependency for image sizing and encoding.
