"use client";

// The live studio for the home page. Loaded on demand via next/dynamic, so
// three.js, drei and postprocessing stay out of the initial bundle.

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useProgress } from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import type { WorkProject } from "@/lib/work";
import type { Atmosphere } from "@/lib/atmosphere";
import { SceneSignals } from "@/components/three/scenes/shared";
import { MAX_FRAME_DELTA, SCROLL_DAMPING } from "../camera-motion";
import { experience, subscribeProgress } from "../store";
import { Daylight, SUN_DIRECTION } from "./Daylight";
import { Exterior } from "./Exterior";
import { LogoSign } from "./LogoSign";
import { MacBook } from "./MacBook";
import { Office } from "./Office";
import { Precipitation } from "./Precipitation";
import { lightingFor } from "./lighting";
import { INTRO_DELAY, INTRO_DURATION, introAt, rig } from "./rig";
import { SHOTS, createShotSampler, fitFov, type ShotSample } from "./shots";

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */

const BACKGROUND = "#E9D9C4"; // never really seen: the sky dome surrounds everything

// How closely the camera follows the scroll: SCROLL_DAMPING in ../camera-motion.ts.
const PARALLAX_YAW = 0.045; // radians the view turns with the cursor
const PARALLAX_PITCH = 0.025;
const PARALLAX_DAMPING = 2.6;
const INTRO_DOLLY = 0.9; // meters the camera eases forward during the load sequence

const DPR: [number, number] = [1, 1.75]; // sharper high-density screens, with a bounded GPU cost
const MSAA_SAMPLES = 4;
const BLOOM_INTENSITY = 0.24;
const BLOOM_THRESHOLD = 1.05;
const VIGNETTE_DARKNESS = 0.32;

const SETTLE_EPSILON = 0.0004;

/* ════════════════════════════════════════════════════════════════════════ */

export type OfficeSceneProps = {
  projects: readonly WorkProject[];
  atmosphere: Atmosphere;
  /** False while the tab or page hides the canvas: rendering stops. */
  active: boolean;
  onReady?: () => void;
  onProgress?: (percent: number) => void;
  onContextLost?: () => void;
};

export default function OfficeScene({
  projects,
  atmosphere,
  active,
  onReady,
  onProgress,
  onContextLost,
}: OfficeSceneProps) {
  return (
    <Canvas
      dpr={DPR}
      // Renders only while the camera, cursor or a fade is moving.
      frameloop={active ? "demand" : "never"}
      camera={{
        position: SHOTS[0]!.position,
        fov: SHOTS[0]!.fov,
        near: 0.03,
        far: 260,
      }}
      gl={{
        antialias: false, // the composer does MSAA instead
        stencil: false,
        powerPreference: "high-performance",
      }}
      // Soft-edged shadow maps for the sun (window frames, desk, plants, sign).
      shadows="percentage"
    >
      <color attach="background" args={[BACKGROUND]} />
      <LoadProgress onProgress={onProgress} />
      <Daylight atmosphere={atmosphere} />

      <Suspense fallback={null}>
        <Exterior atmosphere={atmosphere} />
        <StudioReflections atmosphere={atmosphere} />
        <Office />
        <MacBook projects={projects} />
        <LogoSign />
        {atmosphere.precipitation !== "none" && (
          <Precipitation kind={atmosphere.precipitation} />
        )}
        <CameraRig />
        <SceneSignals
          active={active}
          onReady={onReady}
          onContextLost={onContextLost}
        />
      </Suspense>

      <EffectComposer multisampling={MSAA_SAMPLES}>
        <Bloom
          mipmapBlur
          intensity={BLOOM_INTENSITY}
          luminanceThreshold={BLOOM_THRESHOLD}
          luminanceSmoothing={0.2}
          radius={0.7}
        />
        {/* Neutral keeps the afternoon colors true while rolling off the sunlit highlights. */}
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <Vignette offset={0.3} darkness={VIGNETTE_DARKNESS} />
      </EffectComposer>
    </Canvas>
  );
}

/** The same photographic surroundings illuminate the laptop and sign reflections. */
function StudioReflections({ atmosphere }: { atmosphere: Atmosphere }) {
  const lighting = useMemo(() => lightingFor(atmosphere), [atmosphere]);
  return (
    <Environment
      key={`${atmosphere.phase}:${atmosphere.cloudCover.toFixed(2)}`}
      resolution={256}
      frames={1}
    >
      <Exterior atmosphere={atmosphere} />
      <Lightformer
        form="circle"
        intensity={lighting.sunIntensity * 5.3}
        color={lighting.sun}
        position={SUN_DIRECTION.clone().multiplyScalar(-14).toArray()}
        scale={1.6}
      />
      <Lightformer
        form="rect"
        intensity={lighting.indoor * 2.5}
        color="#FFE0B5"
        position={[4.5, 2.65, 0]}
        rotation-x={Math.PI / 2}
        scale={[4, 1.2]}
      />
    </Environment>
  );
}

/** Reports asset loading (models, textures, font) to the page's loading bar. */
function LoadProgress({
  onProgress,
}: {
  onProgress?: (percent: number) => void;
}) {
  const progress = useProgress((state) => state.progress);
  useEffect(() => onProgress?.(progress), [progress, onProgress]);
  return null;
}

const sample: ShotSample = {
  position: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  fov: 40,
  exposure: 0,
  screen: 0,
};
const lookTarget = new THREE.Vector3();
const lookDirection = new THREE.Vector3();

/** Moves the camera along the shot list as the page scrolls, with a little cursor parallax. */
function CameraRig() {
  const sampler = useMemo(() => createShotSampler(SHOTS), []);
  const invalidate = useThree((state) => state.invalidate);
  const progress = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const follow = useRef({ x: 0, y: 0 });
  const introClock = useRef(0);

  // Scroll changes and cursor moves wake the render loop.
  useEffect(() => subscribeProgress(() => invalidate()), [invalidate]);
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [invalidate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_FRAME_DELTA);
    const goal = experience.progress;
    const p = THREE.MathUtils.damp(
      progress.current ?? goal,
      goal,
      SCROLL_DAMPING,
      dt,
    );
    progress.current = p;

    sampler(p, sample);
    rig.progress = p;
    rig.exposure = sample.exposure;
    rig.screen = sample.screen;

    // Load sequence: the sun sweeps in across the logo while the camera eases in.
    introClock.current += dt;
    rig.intro = introAt(introClock.current);
    const introRunning = introClock.current < INTRO_DELAY + INTRO_DURATION;
    const dolly = INTRO_DOLLY * (1 - rig.intro);

    const f = follow.current;
    f.x = THREE.MathUtils.damp(f.x, pointer.current.x, PARALLAX_DAMPING, dt);
    f.y = THREE.MathUtils.damp(f.y, pointer.current.y, PARALLAX_DAMPING, dt);

    const yaw = sample.yaw - f.x * PARALLAX_YAW;
    const pitch = THREE.MathUtils.clamp(
      sample.pitch + f.y * PARALLAX_PITCH,
      -1.555,
      1.555,
    );
    const camera = state.camera as THREE.PerspectiveCamera;
    lookDirection.set(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    );
    camera.position
      .copy(sample.position)
      .addScaledVector(lookDirection, -dolly);
    camera.lookAt(lookTarget.copy(camera.position).add(lookDirection));

    const fov = fitFov(sample.fov, state.size.width / state.size.height);
    if (Math.abs(camera.fov - fov) > 0.001) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const moving =
      introRunning ||
      Math.abs(p - goal) > SETTLE_EPSILON ||
      Math.abs(f.x - pointer.current.x) > SETTLE_EPSILON ||
      Math.abs(f.y - pointer.current.y) > SETTLE_EPSILON;
    if (moving) state.invalidate();
  }, -1);

  return null;
}
