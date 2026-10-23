"use client";

// Helpers shared by the lazily loaded scenes. Only imported from scene files,
// so three.js never lands in the initial bundle.

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

let glowTexture: THREE.CanvasTexture | null = null;

/**
 * A soft radial gradient (white center fading to transparent), used for cheap
 * glow halos. Tint it with the material `color`. Created once and reused.
 */
export function getGlowTexture(): THREE.CanvasTexture {
  if (glowTexture) return glowTexture;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    // Roughly Gaussian falloff so the halo has no visible edge.
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.62)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.2)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.05)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  glowTexture = new THREE.CanvasTexture(canvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
}

type SceneSignalsProps = {
  /** True while the canvas is on screen. */
  active: boolean;
  /** Fired once, after the first frame has been drawn. */
  onReady?: () => void;
  /** Fired if the browser drops the WebGL context (GPU reset, too many tabs…). */
  onContextLost?: () => void;
};

/**
 * Lifecycle glue that lives inside a Canvas:
 * - tells the wrapper when the first frame is up, so it can fade the canvas in
 * - reports a lost WebGL context, so the wrapper can fall back to the image
 * - asks for a fresh frame when the canvas comes back on screen
 */
export function SceneSignals({
  active,
  onReady,
  onContextLost,
}: SceneSignalsProps) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!onReady) return;
    // Two frames: one for React to commit, one for the GPU to present.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => onReady());
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [onReady]);

  useEffect(() => {
    if (!onContextLost) return;
    const canvas = gl.domElement;
    const handleLost = () => onContextLost();
    canvas.addEventListener("webglcontextlost", handleLost);
    return () => canvas.removeEventListener("webglcontextlost", handleLost);
  }, [gl, onContextLost]);

  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);

  return null;
}
