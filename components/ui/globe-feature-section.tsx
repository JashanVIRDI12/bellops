"use client";

import { ArrowRight } from "lucide-react";
import createGlobe, { COBEOptions } from "cobe";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Source component adapted to this project's design tokens.
 *
 * Two deliberate departures from the upstream snippet:
 *  - the shadcn `Button` dependency is dropped in favour of a plain anchor.
 *    That button's variants reference `--color-primary`, `--color-secondary`,
 *    `--color-accent-foreground` and friends, none of which exist in this
 *    theme, so it would have rendered unstyled.
 *  - `bg-muted` / `text-gray-*` are replaced by paper/ink tokens so the block
 *    matches the rest of the site in both the light and `.on-dark` scopes.
 */
export default function Featured_05() {
  return (
    <section className="relative mx-auto w-full overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 shadow-[0_18px_50px_-24px_rgba(11,26,43,0.30)] md:px-16 md:py-24">
      <div className="flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
        <div className="z-10 max-w-xl text-left">
          <h3 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Build with <span className="text-accent">PUSHWebb</span>{" "}
            <span className="font-normal text-ink-muted">
              One connected growth system across strategy, production, performance, and AI.
            </span>
          </h3>
          <a
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper no-underline transition-colors hover:bg-accent"
          >
            Book a Strategy Call <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="relative h-[180px] w-full max-w-xl">
          <Globe className="absolute -bottom-20 -right-40 scale-150" />
        </div>
      </div>
    </section>
  );
}

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
};

/**
 * Rotation state lives in refs rather than the upstream snippet's
 * `let phi` + `useState(r)`. Two reasons, both real bugs there:
 *  - the globe is created once, capturing the first `onRender` closure, so a
 *    new `r` from state never reached the running instance and dragging did
 *    nothing;
 *  - `let phi` is re-initialised on every render, so the value only survives
 *    by accident of that same stale closure.
 * Refs make the drag actually drive the globe, and avoid a re-render per
 * pointer move.
 */
export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const rotationRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current === null) return;
    const delta = clientX - pointerInteracting.current;
    pointerInteractionMovement.current = delta;
    rotationRef.current = delta / 200;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      widthRef.current = canvas.offsetWidth;
    };

    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvas, {
      ...config,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender: (state: Record<string, number>) => {
        if (!pointerInteracting.current) phiRef.current += 0.005;
        state.phi = phiRef.current + rotationRef.current;
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    });

    const reveal = setTimeout(() => {
      canvas.style.opacity = "1";
    });

    return () => {
      // Upstream leaked this listener on unmount; on a client-routed site the
      // globe mounts and unmounts repeatedly.
      window.removeEventListener("resize", onResize);
      clearTimeout(reveal);
      globe.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}
