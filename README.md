# Bellops

Next.js starter. The home page is blank. A 3D wordmark lives in `components/Logo3D.tsx`.

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` — development server
- `pnpm build` — production build
- `pnpm start` — serve the production build
- `pnpm lint` — ESLint
- `pnpm format` — Prettier

## Folders

- `app/` — routes (App Router)
- `components/` — React components
- `lib/` — shared code
- `public/` — static files

React Three Fiber, drei, and Framer Motion are installed.

## 3D logo

Preview the wordmark at [http://localhost:3000/logo-preview](http://localhost:3000/logo-preview).

Load it on the client so Three.js stays out of the server render:

```tsx
import dynamic from "next/dynamic";

const Logo3D = dynamic(
  () => import("@/components/Logo3D").then((mod) => mod.Logo3D),
  { ssr: false },
);

export function Example() {
  return (
    <div style={{ height: 480 }}>
      <Logo3D size={1} autoRotate interactive />
    </div>
  );
}
```

`size` scales the logo in its frame (`1` fills the frame). `autoRotate` turns on the slow spin and float. `interactive` tilts the logo toward the pointer. Both animations stay off when the visitor has `prefers-reduced-motion: reduce`.

The extruded face is Outfit Bold at `public/fonts/outfit-bold.typeface.json` (SIL Open Font License, see `public/fonts/OFL.txt`). Studio lighting uses the HDR at `public/hdri/studio_small_03_1k.hdr`.

Deploy by importing the repo on Vercel.
