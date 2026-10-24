"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type PreviewImage = {
  key: string;
  props: { src: string; srcSet?: string; sizes?: string };
};

/* Tweakable: how closely the preview follows the pointer (higher = tighter). */
const FOLLOW = 0.16;

/**
 * Beside the pointer, the studio shot of the row it's over, easing after it.
 * Only for a mouse or trackpad, and not with reduced motion; the list works
 * the same without it.
 */
export function RowPreview({
  images,
  children,
}: {
  images: readonly PreviewImage[];
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = root.current;
    const preview = figure.current;
    if (!enabled || !element || !preview) return;
    const target = { x: 0, y: 0 };
    const shown = { x: 0, y: 0 };
    let frame = 0;
    let started = false;

    const step = () => {
      shown.x += (target.x - shown.x) * FOLLOW;
      shown.y += (target.y - shown.y) * FOLLOW;
      preview.style.transform = `translate3d(${shown.x}px, ${shown.y}px, 0)`;
      const settled =
        Math.abs(target.x - shown.x) < 0.3 &&
        Math.abs(target.y - shown.y) < 0.3;
      frame = settled ? 0 : requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      target.x = event.clientX - box.left;
      target.y = event.clientY - box.top;
      if (!started) {
        shown.x = target.x;
        shown.y = target.y;
        started = true;
      }
      const row = (event.target as Element).closest<HTMLElement>("[data-row]");
      setActive(row?.dataset.row ?? null);
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onLeave = () => {
      setActive(null);
      started = false;
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return (
    <div ref={root} className="row-preview-area">
      {children}
      {enabled && (
        <div
          ref={figure}
          className="row-preview"
          aria-hidden="true"
          data-visible={active !== null || undefined}
        >
          {images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element -- next/image props, via getImageProps
            <img
              key={image.key}
              {...image.props}
              alt=""
              loading="lazy"
              data-shown={image.key === active || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
