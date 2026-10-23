"use client";

// The live studio for the home page. Loaded on demand via next/dynamic, so
// three.js, drei and postprocessing stay out of the initial bundle.

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  useGLTF,
  useProgress,
} from "@react-three/drei";
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
import { look, trackLook } from "./look";
import { MacBook } from "./MacBook";
import { Office } from "./Office";
import { Precipitation } from "./Precipitation";
import {
  PROFILES,
  startingDpr,
  type LiveTier,
  type RenderProfile,
} from "./profile";
import { lightingFor } from "./lighting";
import { INTRO_DELAY, INTRO_DURATION, introAt, rig } from "./rig";
import { SHOTS, createShotSampler, fitShot, type ShotSample } from "./shots";

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */

const BACKGROUND = "#E9D9C4"; // never really seen: the sky dome surrounds everything

// How closely the camera follows the scroll: SCROLL_DAMPING in ../camera-motion.ts.
const POINTER_YAW = 0.045; // radians the view turns with the cursor
const POINTER_PITCH = 0.025;
const TILT_YAW = 0.06; // radians the view turns as a phone tilts
const TILT_PITCH = 0.035;
// The look spring: a little overshoot, like a camera on a gimbal.
const LOOK_FREQUENCY = 6; // higher = snappier
const LOOK_DAMPING = 0.78; // 1 = no overshoot
const INTRO_DOLLY = 0.9; // meters the camera eases forward during the load sequence

// Camera dynamics while travelling between shots. Both fade to nothing as it lands.
const BANK = 0.032; // radians the view rolls into a turn, at most (~1.8°)
const BANK_RESPONSE = 0.2; // turn rate (radians per second) that reaches ~20% of the bank
const RUSH_FOV = 2.6; // degrees the lens widens at speed, at most
const RUSH_RESPONSE = 0.07; // speed (meters per second) that reaches ~7% of the widening
const DYNAMICS_DAMPING = 5;

const MSAA_SAMPLES = 4; // desktop; phones use the browser's own antialiasing
const BLOOM_INTENSITY = 0.24;
const BLOOM_THRESHOLD = 1.05;
const VIGNETTE_DARKNESS = 0.32; // phones draw the same vignette in CSS (Stage)

// The frame-rate guard. The live scene only fades in once it holds a frame
// rate; a slow device first renders fewer pixels, then gets the stills.
const GUARD_SAMPLES = 20; // frames per check
const GUARD_WARMUP = 8; // first frames skipped (shaders compiling, textures uploading)
const SLOW_FRAME_MS = 36; // slower than ~28 fps: render fewer pixels
const GIVE_UP_FRAME_MS = 52; // still slower than ~19 fps at the lowest ratio: stills
const HOPELESS_FRAME_MS = 100; // under 10 fps: stills straight away
const IDLE_GAP_MS = 200; // a longer gap means the loop was resting, not slow
const MIN_DPR = 1;
const DPR_STEP = 0.25;

const SETTLE_EPSILON = 0.0004;

/* ════════════════════════════════════════════════════════════════════════ */

export type OfficeSceneProps = {
  tier: LiveTier;
  projects: readonly WorkProject[];
  atmosphere: Atmosphere;
  /** False while the tab or page hides the canvas: rendering stops. */
  active: boolean;
  /** The scene is drawing and holds a smooth frame rate: show it. */
  onReady?: () => void;
  onProgress?: (percent: number) => void;
  onContextLost?: () => void;
  /** The device can't hold a usable frame rate even at the lowest resolution. */
  onTooSlow?: () => void;
};

export default function OfficeScene({
  tier,
  projects,
  atmosphere,
  active,
  onReady,
  onProgress,
  onContextLost,
  onTooSlow,
}: OfficeSceneProps) {
  const profile = PROFILES[tier];
  // Start decoding this tier's office before the canvas mounts (the page has
  // already started downloading it).
  useState(() => useGLTF.preload(profile.officeUrl));
  const [dpr, setDpr] = useState(() => startingDpr(profile));
  const dprRef = useRef(dpr);
  const passed = useRef(false);

  // Each check's median frame time. A smooth one reveals the scene; a slow
  // device trades sharpness for frame rate before giving up on 3D.
  const handleFrameTime = useCallback(
    (frameMs: number) => {
      const pass = () => {
        if (passed.current) return;
        passed.current = true;
        onReady?.();
      };
      if (frameMs <= SLOW_FRAME_MS) return pass();
      const lowest = dprRef.current <= MIN_DPR + 0.01;
      if (frameMs > HOPELESS_FRAME_MS || (lowest && frameMs > GIVE_UP_FRAME_MS))
        return onTooSlow?.();
      if (lowest) return pass(); // 19–28 fps: still a smooth glide
      const next =
        frameMs > SLOW_FRAME_MS * 2
          ? MIN_DPR
          : Math.max(MIN_DPR, dprRef.current - DPR_STEP);
      dprRef.current = next;
      setDpr(next);
    },
    [onReady, onTooSlow],
  );

  const gl = useMemo(
    () =>
      profile.composer
        ? {
            antialias: false, // the composer does MSAA instead
            stencil: false,
            powerPreference: "high-performance" as const,
          }
        : {
            antialias: true,
            stencil: false,
            powerPreference: "high-performance" as const,
            // No composer: the renderer tone maps, matching the desktop look.
            toneMapping: THREE.NeutralToneMapping,
          },
    [profile.composer],
  );

  return (
    <Canvas
      dpr={dpr}
      // Renders only while the camera, cursor or a fade is moving.
      frameloop={active ? "demand" : "never"}
      camera={{
        position: SHOTS[0]!.position,
        fov: SHOTS[0]!.fov,
        near: 0.03,
        far: 260,
      }}
      gl={gl}
      // Soft-edged shadow maps for the sun (window frames, desk, plants, sign).
      shadows="percentage"
    >
      <color attach="background" args={[BACKGROUND]} />
      <LoadProgress onProgress={onProgress} />
      <Daylight atmosphere={atmosphere} shadowMapSize={profile.shadowMapSize} />

      <Suspense fallback={null}>
        <Exterior atmosphere={atmosphere} octaves={profile.skyOctaves} />
        <StudioReflections atmosphere={atmosphere} profile={profile} />
        <Office url={profile.officeUrl} />
        <MacBook projects={projects} />
        <LogoSign probeResolution={profile.reflectionSize} />
        {atmosphere.precipitation !== "none" && (
          <Precipitation
            kind={atmosphere.precipitation}
            count={profile.rainDrops}
          />
        )}
        <CameraRig profile={profile} />
        <FrameGuard onFrameTime={handleFrameTime} />
        <SceneSignals active={active} onContextLost={onContextLost} />
      </Suspense>

      {profile.composer && (
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
      )}
    </Canvas>
  );
}

/** The same photographic surroundings illuminate the laptop and sign reflections. */
function StudioReflections({
  atmosphere,
  profile,
}: {
  atmosphere: Atmosphere;
  profile: RenderProfile;
}) {
  const lighting = useMemo(() => lightingFor(atmosphere), [atmosphere]);
  return (
    <Environment
      key={`${atmosphere.phase}:${atmosphere.cloudCover.toFixed(2)}`}
      resolution={profile.reflectionSize}
      frames={1}
    >
      <Exterior atmosphere={atmosphere} octaves={profile.skyOctaves} />
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

/**
 * Times frames while the scene is moving and reports the median of each batch.
 * With an on-demand loop, a long gap between frames usually means the scene
 * was at rest, so those only count during the load sequence, which always
 * runs (and is when the first verdict lands).
 */
function FrameGuard({
  onFrameTime,
}: {
  onFrameTime: (frameMs: number) => void;
}) {
  const dpr = useThree((state) => state.viewport.dpr);
  const samples = useRef<number[]>([]);
  const last = useRef(0);
  const skip = useRef(GUARD_WARMUP);

  // A new resolution reallocates buffers: start counting afresh.
  useEffect(() => {
    samples.current = [];
    skip.current = GUARD_WARMUP;
    last.current = 0;
  }, [dpr]);

  useFrame(() => {
    const now = performance.now();
    const gap = last.current ? now - last.current : 0;
    last.current = now;
    if (!gap) return;
    if (skip.current > 0) {
      skip.current--;
      return;
    }
    if (gap > IDLE_GAP_MS && rig.intro >= 1) return;
    samples.current.push(gap);
    if (samples.current.length < GUARD_SAMPLES) return;
    const sorted = samples.current.sort((a, b) => a - b);
    const median = sorted[sorted.length >> 1]!;
    samples.current = [];
    onFrameTime(median);
  });

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
const lastPosition = new THREE.Vector3();

type Spring = { x: number; v: number };

/** One step of a damped spring toward `target`. Returns true while it's still moving. */
function stepSpring(spring: Spring, target: number, dt: number) {
  const stiffness = LOOK_FREQUENCY * LOOK_FREQUENCY;
  const damping = 2 * LOOK_DAMPING * LOOK_FREQUENCY;
  spring.v += (stiffness * (target - spring.x) - damping * spring.v) * dt;
  spring.x += spring.v * dt;
  return (
    Math.abs(target - spring.x) > SETTLE_EPSILON ||
    Math.abs(spring.v) > SETTLE_EPSILON
  );
}

/**
 * Moves the camera along the shot list as the page scrolls. On the way it
 * banks into turns and the lens widens slightly with speed; at rest it turns
 * toward the cursor, a finger drag or the phone's tilt.
 */
function CameraRig({ profile }: { profile: RenderProfile }) {
  const sampler = useMemo(() => createShotSampler(SHOTS), []);
  const invalidate = useThree((state) => state.invalidate);
  const progress = useRef<number | null>(null);
  const yawSpring = useRef<Spring>({ x: 0, v: 0 });
  const pitchSpring = useRef<Spring>({ x: 0, v: 0 });
  const introClock = useRef(0);
  const lastYaw = useRef<number | null>(null);
  const turnRate = useRef(0);
  const speed = useRef(0);

  // Scroll changes, the cursor, fingers and tilt wake the render loop.
  useEffect(() => subscribeProgress(() => invalidate()), [invalidate]);
  useEffect(
    () =>
      trackLook({
        onChange: () => invalidate(),
        touch: profile.fingerLook > 0,
      }),
    [invalidate, profile.fingerLook],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_FRAME_DELTA);
    const camera = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / state.size.height;
    const goal = experience.progress;
    const p = THREE.MathUtils.damp(
      progress.current ?? goal,
      goal,
      SCROLL_DAMPING,
      dt,
    );
    progress.current = p;

    sampler(p, sample, aspect);
    fitShot(sample, aspect);
    rig.progress = p;
    rig.exposure = sample.exposure;
    rig.screen = sample.screen;

    // Load sequence: the sun sweeps in across the logo while the camera eases in.
    introClock.current += dt;
    rig.intro = introAt(introClock.current);
    const introRunning = introClock.current < INTRO_DELAY + INTRO_DURATION;
    const dolly = INTRO_DOLLY * (1 - rig.intro);

    // How fast the camera is turning and travelling, smoothed.
    if (dt > 0 && lastYaw.current !== null) {
      turnRate.current = THREE.MathUtils.damp(
        turnRate.current,
        (sample.yaw - lastYaw.current) / dt,
        DYNAMICS_DAMPING,
        dt,
      );
      speed.current = THREE.MathUtils.damp(
        speed.current,
        lastPosition.distanceTo(sample.position) / dt,
        DYNAMICS_DAMPING,
        dt,
      );
    }
    lastYaw.current = sample.yaw;
    lastPosition.copy(sample.position);

    const lookX =
      look.pointer.x * POINTER_YAW +
      look.tilt.x * TILT_YAW +
      look.drag * profile.fingerLook;
    const lookY = look.pointer.y * POINTER_PITCH + look.tilt.y * TILT_PITCH;
    const yawMoving = stepSpring(yawSpring.current, lookX, dt);
    const pitchMoving = stepSpring(pitchSpring.current, lookY, dt);

    const yaw = sample.yaw - yawSpring.current.x;
    const pitch = THREE.MathUtils.clamp(
      sample.pitch + pitchSpring.current.x,
      -1.555,
      1.555,
    );
    lookDirection.set(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    );
    camera.position
      .copy(sample.position)
      .addScaledVector(lookDirection, -dolly);
    camera.lookAt(lookTarget.copy(camera.position).add(lookDirection));
    // Bank into the turn: turning left rolls the view left, like a drone.
    camera.rotateZ(BANK * Math.tanh(turnRate.current * BANK_RESPONSE));

    const fov =
      sample.fov + RUSH_FOV * Math.tanh(speed.current * RUSH_RESPONSE);
    if (Math.abs(camera.fov - fov) > 0.001) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const moving =
      introRunning ||
      Math.abs(p - goal) > SETTLE_EPSILON ||
      Math.abs(turnRate.current) > 0.002 ||
      speed.current > 0.002 ||
      yawMoving ||
      pitchMoving;
    if (moving) state.invalidate();
  }, -1);

  return null;
}
