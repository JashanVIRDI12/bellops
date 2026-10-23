"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { preload } from "react-dom";
import type { WorkProject } from "@/lib/work";
import { SceneErrorBoundary } from "@/components/three/utils/SceneErrorBoundary";
import { cx } from "@/components/three/utils/cx";
import { use3DSupport } from "@/components/three/utils/use3DSupport";
import { usePrefersReducedMotion } from "@/components/three/utils/usePrefersReducedMotion";
import { Stills, type StillsMode } from "./Stills";
import { useEnvironment } from "./environment-store";
import { reportScene } from "./loader-store";
import { MACBOOK_URL, OFFICE_URL } from "./scene/models";

// three.js, the models and postprocessing load in their own chunk, and only on
// devices that get the live scene.
const OfficeScene = dynamic(() => import("./scene/OfficeScene"), {
  ssr: false,
});

/**
 * The fixed backdrop behind the whole page: the live studio on capable
 * desktops, crossfading stills everywhere else.
 */
export function Stage({ projects }: { projects: readonly WorkProject[] }) {
  const decision = use3DSupport();
  const reducedMotion = usePrefersReducedMotion();
  const { atmosphere, mode, weather } = useEnvironment();

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => setFailed(true), []);

  // Reduced motion gets the stills: same story, no camera flight.
  const live = decision === "3d" && !reducedMotion && !failed;
  // The still for the current shot paints first everywhere; the live scene
  // fades in over it once it's ready.
  const stills: StillsMode = live && ready ? "hide" : "show";

  // Once this device has passed the 3D check, download the models alongside
  // the 3D code instead of after it. Devices that get images never fetch them.
  if (live)
    for (const model of [OFFICE_URL, MACBOOK_URL])
      preload(model, { as: "fetch", crossOrigin: "anonymous" });

  // Keep the start-up loader informed.
  useEffect(() => {
    reportScene({
      source: decision === "pending" ? null : live ? "live" : "stills",
      progress: loaded,
      ready: live && ready,
    });
  }, [decision, live, loaded, ready]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 bg-[#151c29]"
      data-scene-mood={atmosphere.still}
      data-scene-source={
        mode !== "auto" ? "preview" : weather ? "weather" : "clock"
      }
    >
      <Stills mode={stills} mood={atmosphere.still} />

      {live && (
        <div
          data-live-ready={ready}
          className={cx(
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <SceneErrorBoundary onError={markFailed}>
            <OfficeScene
              projects={projects}
              atmosphere={atmosphere}
              active
              onReady={markReady}
              onProgress={setLoaded}
              onContextLost={markFailed}
            />
          </SceneErrorBoundary>
        </div>
      )}

      {/* Loading line, only while the live scene downloads. */}
      {live && !ready && (
        <div className="absolute inset-x-0 top-0 h-px bg-white/5">
          <div
            className="bg-violet h-full transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(4, loaded)}%` }}
          />
        </div>
      )}
    </div>
  );
}
