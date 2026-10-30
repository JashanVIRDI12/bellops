"use client";

import { useSceneLoading } from "./scene-loading";

/**
 * The home page's 3D loader: while the live studio downloads and warms up
 * behind the opening still, a short label, its percentage and a bar, set
 * just above the headline, in the opening scene's own colours (so it reads
 * on day and night stills alike). It fades out as the 3D takes over.
 *
 * The progress is the real one (Stage.tsx: the models' download, then the
 * scene's warm-up). Only devices that get the live 3D ever see it; phones
 * and computers that get the stills, and reduced motion, never do.
 *
 * Browser-only and absolutely positioned: the page's HTML, its first paint
 * and its layout are the same as without it. Decorative (aria-hidden): the
 * page reads the same either way.
 */
export function SceneLoader() {
  const loading = useSceneLoading();
  if (loading.state === "idle") return null;
  const progress = loading.state === "loading" ? loading.progress : 1;
  return (
    <div
      aria-hidden="true"
      className="scene-loader"
      data-done={loading.state === "done" || undefined}
    >
      <span className="scene-loader-text">
        <span>Loading the 3D studio</span>
        <span className="scene-loader-value">
          {Math.round(progress * 100)}%
        </span>
      </span>
      <span className="scene-loader-track">
        <span
          className="scene-loader-bar"
          style={{ transform: `scaleX(${progress})` }}
        />
      </span>
    </div>
  );
}
