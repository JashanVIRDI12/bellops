"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
// Type-only import: erased at build time, so three.js stays out of this chunk.
import type { Logo3DProps } from "@/components/Logo3D";
import { SceneErrorBoundary } from "./utils/SceneErrorBoundary";
import { cx } from "./utils/cx";
import { use3DSupport, type RenderMode } from "./utils/use3DSupport";
import { useInView } from "./utils/useInView";

// The 3D wordmark (three.js, drei, font and HDR) loads in its own chunk, only
// on capable devices and only once it's near the viewport.
const Logo3D = dynamic(
  () => import("@/components/Logo3D").then((mod) => mod.Logo3D),
  { ssr: false },
);

export type LazyLogo3DProps = Pick<
  Logo3DProps,
  "size" | "autoRotate" | "interactive"
> & {
  /** Shown on phones and low-end devices, and while the 3D loads. */
  fallbackSrc?: string;
  /** Fetch the fallback image first. Keep on when the logo is the first thing on the page. */
  priority?: boolean;
  /** "auto" (default), or force "3d" / "fallback" for testing. */
  mode?: RenderMode;
  /** Sizing and positioning. The logo fills this box, so give it a height. */
  className?: string;
};

/**
 * <Logo3D /> with the site's loading rules: a static image first (fast LCP,
 * phones, low-end devices), the live wordmark fading in on top once it's ready.
 */
export function LazyLogo3D({
  size,
  autoRotate,
  interactive,
  fallbackSrc = "/three/logo-fallback.webp",
  priority = true,
  mode = "auto",
  className,
}: LazyLogo3DProps) {
  const container = useRef<HTMLDivElement>(null);
  const { inView, hasEntered } = useInView(container, "150px 0px");
  const decision = use3DSupport(mode);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => setFailed(true), []);

  const mount3D = decision === "3d" && hasEntered && !failed;
  const showing3D = mount3D && ready;

  return (
    <div ref={container} className={cx("relative h-full w-full", className)}>
      <Image
        src={fallbackSrc}
        alt="BellOps"
        fill
        sizes="100vw"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={cx(
          "object-contain transition-opacity duration-700 ease-out",
          showing3D && "opacity-0",
        )}
      />

      {mount3D && (
        // The image above already names the logo for screen readers.
        <div
          aria-hidden
          className={cx(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            showing3D ? "opacity-100" : "opacity-0",
          )}
        >
          <SceneErrorBoundary onError={markFailed}>
            <Logo3D
              size={size}
              autoRotate={autoRotate}
              interactive={interactive}
              paused={!inView}
              onReady={markReady}
              onContextLost={markFailed}
            />
          </SceneErrorBoundary>
        </div>
      )}
    </div>
  );
}
