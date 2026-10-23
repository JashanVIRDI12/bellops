"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { SceneErrorBoundary } from "./utils/SceneErrorBoundary";
import { cx } from "./utils/cx";
import { use3DSupport, type RenderMode } from "./utils/use3DSupport";
import { useInView } from "./utils/useInView";
import { usePrefersReducedMotion } from "./utils/usePrefersReducedMotion";

// three.js, drei and postprocessing load in their own chunk, only once the orb
// is about to scroll into view on a capable device.
const HeroOrbScene = dynamic(() => import("./scenes/HeroOrbScene"), {
  ssr: false,
});

export type HeroOrbProps = {
  /** Scales the orb, ring and shards together. 1 = the orb is about half the frame's height. */
  size?: number;
  /** Glow strength (bloom, halo, ring). 0 = off, 1 = default, 2 = strong. */
  intensity?: number;
  /** Tilt and drift toward the cursor. */
  interactive?: boolean;
  /** Shown on phones and low-end devices, and while the 3D loads. Transparent WebP recommended. */
  fallbackSrc?: string;
  /** Fetch the fallback image first. Keep on when the orb is in the first screen. */
  priority?: boolean;
  /** "auto" (default), or force "3d" / "fallback" for testing. */
  mode?: RenderMode;
  /** Sizing and positioning. The orb fills this box, so give it a height. */
  className?: string;
};

/**
 * A glossy purple orb with an orbit ring and floating glass shards.
 * Decorative: hidden from screen readers, never blocks clicks.
 */
export function HeroOrb({
  size = 1,
  intensity = 1,
  interactive = true,
  fallbackSrc = "/three/hero-orb-fallback.webp",
  priority = true,
  mode = "auto",
  className,
}: HeroOrbProps) {
  const container = useRef<HTMLDivElement>(null);
  // Start loading a little before it's visible; pause once it's fully gone.
  const { inView, hasEntered } = useInView(container, "150px 0px");
  const decision = use3DSupport(mode);
  const reducedMotion = usePrefersReducedMotion();

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => setFailed(true), []);

  const mount3D = decision === "3d" && hasEntered && !failed;
  const showing3D = mount3D && ready;

  return (
    <div
      ref={container}
      aria-hidden
      className={cx("pointer-events-none relative h-full w-full", className)}
    >
      <Image
        src={fallbackSrc}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 70vw"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={cx(
          "object-contain transition-opacity duration-700 ease-out",
          showing3D && "opacity-0",
        )}
      />

      {mount3D && (
        <div
          className={cx(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            showing3D ? "opacity-100" : "opacity-0",
          )}
        >
          <SceneErrorBoundary onError={markFailed}>
            <HeroOrbScene
              size={size}
              intensity={intensity}
              interactive={interactive}
              active={inView}
              reducedMotion={reducedMotion}
              onReady={markReady}
              onContextLost={markFailed}
            />
          </SceneErrorBoundary>
        </div>
      )}
    </div>
  );
}
