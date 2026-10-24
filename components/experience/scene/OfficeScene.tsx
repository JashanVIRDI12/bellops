"use client";

// The live studio for the home page. Loaded on demand via next/dynamic, so
// three.js, drei and postprocessing stay out of the initial bundle.

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
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
const MAX_INTRO_HOLD = 20; // seconds the load sequence waits to be shown, at most

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
// rate; a slower device first renders fewer pixels, then gets the stills.
// Frame times are averaged with the slowest tenth left out, so one hiccup
// doesn't count but a steady struggle does.
const GUARD_SAMPLES = 20; // frames per check
const GUARD_WARMUP = 8; // first frames skipped after the warm-up and after each change
const SLOW_FRAME_MS = 22; // slower than ~45 fps: render fewer pixels
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
  /** The scene is warmed up and holds a smooth frame rate: show it. */
  onReady?: () => void;
  onProgress?: (percent: number) => void;
  /** 0–1: shots drawn during the warm-up. */
  onWarmup?: (fraction: number) => void;
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
  onWarmup,
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
  /** A lower resolution waiting for the camera to rest (resizing stalls a frame). */
  const pendingDpr = useRef<number | null>(null);

  // Each check's typical frame time. A smooth one reveals the scene; a slow
  // device trades sharpness for frame rate before giving up on 3D.
  const handleFrameTime = useCallback(
    (frameMs: number) => {
      if (pendingDpr.current !== null) return;
      const pass = () => {
        if (passed.current) return;
        passed.current = true;
        rig.revealed = true;
        onReady?.();
      };
      if (frameMs <= SLOW_FRAME_MS) return pass();
      const lowest = dprRef.current <= MIN_DPR + 0.01;
      if (frameMs > HOPELESS_FRAME_MS || (lowest && frameMs > GIVE_UP_FRAME_MS))
        return onTooSlow?.();
      if (lowest) return pass(); // 19–45 fps at the lowest ratio: still a steady glide
      const next =
        frameMs > SLOW_FRAME_MS * 2
          ? MIN_DPR
          : Math.max(MIN_DPR, dprRef.current - DPR_STEP);
      dprRef.current = next;
      // Hidden, it can switch straight away; on screen, at the next rest.
      if (passed.current) pendingDpr.current = next;
      else setDpr(next);
    },
    [onReady, onTooSlow],
  );
  const applyPendingDpr = useCallback(() => {
    if (pendingDpr.current === null) return;
    setDpr(pendingDpr.current);
    pendingDpr.current = null;
  }, []);

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
        <Warmup onProgress={onWarmup} />
        <FrameGuard onFrameTime={handleFrameTime} />
        <AtRest onRest={applyPendingDpr} />
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
 * Times frames while the scene is moving and reports each batch's typical
 * frame time. With an on-demand loop, a long gap between frames usually means
 * the scene was at rest, so those only count during the load sequence, which
 * always runs (and is when the first verdict lands). The warm-up's frames are
 * slow on purpose and never count.
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
    if (rig.warmShot !== null) {
      skip.current = GUARD_WARMUP;
      last.current = 0;
      return;
    }
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
    const kept = sorted.slice(0, Math.ceil(sorted.length * 0.9));
    const typical = kept.reduce((sum, gap) => sum + gap, 0) / kept.length;
    samples.current = [];
    onFrameTime(typical);
  });

  return null;
}

/**
 * Prepares everything the tour shows before the visitor sees any of it: every
 * texture goes to the GPU and every shader compiles, then each shot is drawn
 * once, hidden, with nothing skipped for being out of view (some things, like
 * the sign's screws, only appear between shots). Without this, the first
 * visit to each shot stalls the camera while the device prepares what just
 * came into view.
 */
function Warmup({ onProgress }: { onProgress?: (fraction: number) => void }) {
  const getState = useThree((state) => state.get);
  const flying = useRef(false);
  const culled = useRef<THREE.Object3D[]>([]);

  const restoreCulling = useCallback(() => {
    for (const object of culled.current) object.frustumCulled = true;
    culled.current = [];
  }, []);

  // Before the first frame: hold the camera on the first shot.
  useLayoutEffect(() => {
    rig.warmShot = 0;
    rig.revealed = false;
    return () => {
      rig.warmShot = null;
    };
  }, []);

  useEffect(() => {
    const { gl, scene, camera, invalidate } = getState();
    let cancelled = false;
    scene.traverse((object) => {
      const material = (object as THREE.Mesh).material;
      if (!material) return;
      for (const entry of [material].flat())
        for (const value of Object.values(entry))
          if (value instanceof THREE.Texture) gl.initTexture(value);
    });
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        scene.traverse((object) => {
          if (!object.frustumCulled) return;
          object.frustumCulled = false;
          culled.current.push(object);
        });
        flying.current = true;
        invalidate();
      });
    return () => {
      cancelled = true;
      restoreCulling();
    };
  }, [getState, restoreCulling]);

  useFrame((state) => {
    if (!flying.current || rig.warmShot === null) return;
    // The camera rig posed this frame at rig.warmShot; it's drawn after this.
    const next = rig.warmShot + 1;
    onProgress?.(next / SHOTS.length);
    rig.warmShot = next < SHOTS.length ? next : null;
    if (rig.warmShot === null) {
      flying.current = false;
      // This last frame still draws everything; culling is back from the next.
      requestAnimationFrame(restoreCulling);
    }
    state.invalidate();
  });

  return null;
}

/** Calls `onRest` on every frame where the camera has come to rest. */
function AtRest({ onRest }: { onRest: () => void }) {
  useFrame(() => {
    if (!rig.moving && rig.warmShot === null) onRest();
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
  const introHold = useRef(0);

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

    // Warming up: stand exactly on the shot being prepared, nothing else.
    if (rig.warmShot !== null) {
      const shot = Math.min(rig.warmShot, SHOTS.length - 1);
      sampler(shot, sample, aspect);
      fitShot(sample, aspect);
      rig.progress = shot;
      rig.exposure = sample.exposure;
      rig.screen = sample.screen;
      rig.moving = true;
      aim(camera, sample.yaw, sample.pitch, 0, sample.position);
      setFov(camera, sample.fov);
      // Afterwards the camera picks up from the visitor's scroll position.
      progress.current = null;
      lastYaw.current = null;
      turnRate.current = speed.current = 0;
      return;
    }

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

    // Load sequence: the sun sweeps in across the logo while the camera eases
    // in. It waits until the scene is shown, so it plays as the scene fades in.
    if (rig.revealed || introHold.current > MAX_INTRO_HOLD)
      introClock.current += dt;
    else introHold.current += dt;
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

    // Bank into the turn: turning left rolls the view left, like a drone.
    aim(
      camera,
      sample.yaw - yawSpring.current.x,
      sample.pitch + pitchSpring.current.x,
      BANK * Math.tanh(turnRate.current * BANK_RESPONSE),
      sample.position,
      dolly,
    );
    setFov(
      camera,
      sample.fov + RUSH_FOV * Math.tanh(speed.current * RUSH_RESPONSE),
    );

    const moving =
      introRunning ||
      Math.abs(p - goal) > SETTLE_EPSILON ||
      Math.abs(turnRate.current) > 0.002 ||
      speed.current > 0.002 ||
      yawMoving ||
      pitchMoving;
    rig.moving = moving;
    if (moving) state.invalidate();
  }, -1);

  return null;
}

/**
 * Points the camera along a yaw and pitch, rolled by `roll`. With a `from`
 * position, it stands there, eased back `dolly` meters along the view.
 */
function aim(
  camera: THREE.PerspectiveCamera,
  yaw: number,
  rawPitch: number,
  roll: number,
  from?: THREE.Vector3,
  dolly = 0,
) {
  const pitch = THREE.MathUtils.clamp(rawPitch, -1.555, 1.555);
  lookDirection.set(
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch),
  );
  if (from) camera.position.copy(from).addScaledVector(lookDirection, -dolly);
  camera.lookAt(lookTarget.copy(camera.position).add(lookDirection));
  if (roll) camera.rotateZ(roll);
}

function setFov(camera: THREE.PerspectiveCamera, fov: number) {
  if (Math.abs(camera.fov - fov) <= 0.001) return;
  camera.fov = fov;
  camera.updateProjectionMatrix();
}
