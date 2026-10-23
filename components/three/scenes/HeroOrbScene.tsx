"use client";

// The live 3D scene for <HeroOrb />. Loaded on demand via next/dynamic, so
// three.js, drei and postprocessing stay out of the initial bundle.

import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshDistortMaterial,
  PerformanceMonitor,
} from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { SceneSignals, getGlowTexture } from "./shared";

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */

// Colors
const ACCENT = "#7B5CFF"; // brand purple: ring, halo, rim light
const ORB_COLOR = "#6A4BFF"; // glossy body, close to the accent so the lit side reads as brand purple
const ORB_EMISSIVE = "#1C1052"; // faint self-glow that keeps the shadow side from going black
const SHARD_COLOR = "#C9BDFF"; // glass shards
const RING_BEAD_COLOR = "#E9E4FF"; // the small light travelling around the ring

// Orb surface
const DISTORT = 0.3; // 0 = perfect sphere, ~0.6 = very blobby
const DISTORT_SPEED = 1.1; // how fast the surface noise flows
const DISTORT_PULSE = 0.06; // extra distortion at the top of each breath
const ORB_ROUGHNESS = 0.2; // 0 = mirror, 1 = matte

// Breathing
const BREATH_PERIOD = 5.5; // seconds per breath
const BREATH_SCALE = 0.03; // ±3 % size

// Mouse follow (all damped, so it never jitters)
const TILT = 0.32; // max tilt toward the cursor, radians
const DRIFT = 0.16; // max drift toward the cursor, world units
const FOLLOW_DAMPING = 2.4; // higher = snappier, lower = floatier

// Orbit ring
const RING_RADIUS = 1.72;
const RING_THICKNESS = 0.0045;
const RING_TILT: Vec3 = [1.22, 0.16, -0.12]; // radians; x controls how "open" the ellipse looks
const RING_SPEED = 0.14; // radians per second
const RING_GLOW = 2.6; // >1 pushes the ring above the bloom threshold
const RING_OPACITY = 0.75;

// Glass shards
const SHARD_FLOAT = 0.07; // bob height, world units
const SHARD_FLOAT_SPEED = 0.55; // bob speed
const SHARD_SPIN = 0.12; // radians per second
const SHARD_PARALLAX = 0.22; // how much shards shift with the cursor (scaled by their depth)

// Soft halo sprite behind the orb
const HALO_SIZE = 5.2; // world units
const HALO_OPACITY = 0.2;

// Lights
const KEY_LIGHT = 2.2; // white light from the top left that shapes the orb

// Bloom (multiplied by the `intensity` prop)
const BLOOM_INTENSITY = 1;
const BLOOM_THRESHOLD = 0.6; // only pixels brighter than this glow
const BLOOM_SMOOTHING = 0.3;
const BLOOM_RADIUS = 0.72; // 0–1, spread of the glow

// Camera and rendering
const CAMERA_Z = 6;
const CAMERA_FOV = 35;
const DPR: [number, number] = [1, 1.75];
const MSAA_SAMPLES = 4; // anti-aliasing inside the effect composer; 0 to save GPU
const FIT_ASPECT = 1.15; // below this width/height ratio the scene scales down to stay in frame
const MAX_FRAME_DELTA = 1 / 30; // clamps time steps after a tab switch so nothing jumps

type Vec3 = [number, number, number];

type Shard = {
  position: Vec3; // z > 0 sits in front of the orb and moves more with the cursor
  scale: Vec3; // long and slightly flat reads as a shard
  rotation: Vec3;
  seed: number; // phase offset for the bob
};

const SHARDS: Shard[] = [
  {
    position: [-2.05, 0.95, 0.6],
    scale: [0.1, 0.19, 0.07],
    rotation: [0.4, 0.2, 0.6],
    seed: 0,
  },
  {
    position: [2.2, 0.6, -0.5],
    scale: [0.08, 0.15, 0.06],
    rotation: [-0.3, 0.8, -0.4],
    seed: 1.7,
  },
  {
    position: [1.5, -1.15, 0.9],
    scale: [0.12, 0.22, 0.085],
    rotation: [0.9, -0.4, 0.2],
    seed: 3.1,
  },
  {
    position: [-1.75, -1.0, -0.7],
    scale: [0.07, 0.13, 0.05],
    rotation: [-0.6, 0.3, -0.9],
    seed: 4.4,
  },
  {
    position: [0.5, 1.7, -0.9],
    scale: [0.06, 0.11, 0.045],
    rotation: [0.2, -0.7, 0.4],
    seed: 5.9,
  },
  {
    position: [-0.85, -1.35, 1.1],
    scale: [0.05, 0.09, 0.04],
    rotation: [1.1, 0.5, -0.2],
    seed: 7.2,
  },
];

/* ════════════════════════════════════════════════════════════════════════ */

export type HeroOrbSceneProps = {
  size: number;
  intensity: number;
  interactive: boolean;
  /** False while off screen: rendering stops completely. */
  active: boolean;
  reducedMotion: boolean;
  onReady?: () => void;
  onContextLost?: () => void;
};

export default function HeroOrbScene({
  size,
  intensity,
  interactive,
  active,
  reducedMotion,
  onReady,
  onContextLost,
}: HeroOrbSceneProps) {
  const [dpr, setDpr] = useState<number | [number, number]>(DPR);
  const animate = !reducedMotion;

  return (
    <Canvas
      dpr={dpr}
      // Off screen: no frames at all. Reduced motion: one static frame, redrawn
      // only when something changes. Otherwise the orb is always alive.
      frameloop={!active ? "never" : animate ? "always" : "demand"}
      camera={{
        position: [0, 0, CAMERA_Z],
        fov: CAMERA_FOV,
        near: 0.1,
        far: 40,
      }}
      gl={{
        antialias: false, // the composer does MSAA instead
        alpha: true, // transparent, so the page background shows through
        stencil: false,
        powerPreference: "high-performance",
      }}
      // Decorative layer: never block clicks on content above or below it.
      style={{ pointerEvents: "none" }}
    >
      <SceneSignals
        active={active}
        onReady={onReady}
        onContextLost={onContextLost}
      />
      {animate && (
        // Drops to 1× pixel ratio if the device can't hold a steady frame rate.
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(DPR)}
          onFallback={() => setDpr(1)}
        />
      )}

      <StudioLights />
      <directionalLight position={[-3, 4, 5]} intensity={KEY_LIGHT} />
      <OrbRig
        size={size}
        intensity={intensity}
        interactive={interactive}
        animate={animate}
      />

      <EffectComposer multisampling={MSAA_SAMPLES}>
        <Bloom
          mipmapBlur
          intensity={BLOOM_INTENSITY * intensity}
          luminanceThreshold={BLOOM_THRESHOLD}
          luminanceSmoothing={BLOOM_SMOOTHING}
          radius={BLOOM_RADIUS}
        />
        {/* Neutral keeps the brand purple true while rolling off bright highlights. */}
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </Canvas>
  );
}

/** Reflections, baked once from soft light cards (no HDR download). */
function StudioLights() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Key: large round softbox, top left. Main highlight on the orb. */}
      <Lightformer
        form="circle"
        intensity={2.2}
        color="#FFFFFF"
        position={[-3, 3, 4]}
        scale={3}
      />
      {/* Small second highlight, top right. */}
      <Lightformer
        form="circle"
        intensity={1.4}
        color="#E4DEFF"
        position={[3.5, 3, 2.5]}
        scale={1}
      />
      {/* Rim: tall purple strip, right. Gives the purple edge glow. */}
      <Lightformer
        form="rect"
        intensity={5}
        color={ACCENT}
        position={[4, 0, -1.5]}
        scale={[1.2, 6, 1]}
      />
      {/* Back-left purple wash. */}
      <Lightformer
        form="rect"
        intensity={3}
        color="#4B2BFF"
        position={[-4, -1, -3]}
        scale={[2, 5, 1]}
      />
      {/* Cool fill from below. */}
      <Lightformer
        form="rect"
        intensity={0.8}
        color="#A5B4FC"
        position={[0, -4, 2]}
        scale={[8, 1.5, 1]}
      />
    </Environment>
  );
}

type OrbRigProps = {
  size: number;
  intensity: number;
  interactive: boolean;
  animate: boolean;
};

const CENTER = { x: 0, y: 0 };

function OrbRig({ size, intensity, interactive, animate }: OrbRigProps) {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const fit = Math.min(1, aspect / FIT_ASPECT);

  const rig = useRef<THREE.Group>(null);
  const orb = useRef<THREE.Mesh>(null);
  const distortMaterial =
    useRef<ComponentRef<typeof MeshDistortMaterial>>(null);
  const ringSpin = useRef<THREE.Group>(null);
  const shards = useRef<(THREE.Mesh | null)[]>([]);

  const pointer = useRef({ x: 0, y: 0 }); // raw cursor, -1..1
  const follow = useRef({ x: 0, y: 0 }); // damped cursor
  const time = useRef(0);

  const [glow] = useState(getGlowTexture);
  const ringColor = useMemo(
    () => new THREE.Color(ACCENT).multiplyScalar(RING_GLOW * intensity),
    [intensity],
  );

  // Track the cursor across the whole window, not just the canvas, so text
  // layered over the hero doesn't interrupt the follow.
  useEffect(() => {
    if (!interactive || !animate) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    // Ease back to center when the cursor leaves the window.
    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget === null) pointer.current = { x: 0, y: 0 };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, [interactive, animate]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_FRAME_DELTA);
    if (animate) time.current += dt;
    const t = time.current;

    // Frame-rate independent smoothing toward the cursor.
    const target = interactive && animate ? pointer.current : CENTER;
    const f = follow.current;
    f.x = THREE.MathUtils.damp(f.x, target.x, FOLLOW_DAMPING, dt);
    f.y = THREE.MathUtils.damp(f.y, target.y, FOLLOW_DAMPING, dt);

    if (rig.current) {
      rig.current.rotation.set(-f.y * TILT * 0.8, f.x * TILT, 0);
      rig.current.position.set(f.x * DRIFT, f.y * DRIFT, 0);
    }

    const breath = animate ? Math.sin((t / BREATH_PERIOD) * Math.PI * 2) : 0;
    orb.current?.scale.setScalar(1 + breath * BREATH_SCALE);
    if (distortMaterial.current) {
      distortMaterial.current.distort = animate
        ? DISTORT + breath * DISTORT_PULSE
        : 0;
    }

    if (ringSpin.current) ringSpin.current.rotation.z = t * RING_SPEED;

    SHARDS.forEach((shard, i) => {
      const mesh = shards.current[i];
      if (!mesh) return;
      const [x, y, z] = shard.position;
      const bob = Math.sin(t * SHARD_FLOAT_SPEED + shard.seed) * SHARD_FLOAT;
      // Front shards slide with the cursor, back shards against it: cheap parallax.
      mesh.position.set(
        x + f.x * SHARD_PARALLAX * z,
        y + bob + f.y * SHARD_PARALLAX * z,
        z,
      );
      mesh.rotation.set(
        shard.rotation[0] + t * SHARD_SPIN * 0.6,
        shard.rotation[1] + t * SHARD_SPIN,
        shard.rotation[2],
      );
    });
  });

  return (
    <group scale={size * fit}>
      <group ref={rig}>
        {/* Halo: a soft purple glow behind everything. */}
        <mesh position={[0, 0, -1.4]} scale={HALO_SIZE}>
          <planeGeometry />
          <meshBasicMaterial
            map={glow}
            color={ACCENT}
            transparent
            opacity={HALO_OPACITY * intensity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={orb}>
          {/* Dense mesh so the distortion stays smooth. */}
          <sphereGeometry args={[1, 128, 128]} />
          <MeshDistortMaterial
            ref={distortMaterial}
            color={ORB_COLOR}
            emissive={ORB_EMISSIVE}
            emissiveIntensity={0.5 * intensity}
            roughness={ORB_ROUGHNESS}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
            iridescence={0.55}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 380]}
            envMapIntensity={1.2}
            distort={animate ? DISTORT : 0}
            speed={animate ? DISTORT_SPEED : 0}
          />
        </mesh>

        {/* Orbit ring with a small light travelling along it. */}
        <group rotation={RING_TILT}>
          <group ref={ringSpin}>
            <mesh>
              <torusGeometry args={[RING_RADIUS, RING_THICKNESS, 6, 256]} />
              <meshBasicMaterial
                color={ringColor}
                transparent
                opacity={RING_OPACITY}
              />
            </mesh>
            <mesh position={[RING_RADIUS, 0, 0]}>
              <sphereGeometry args={[0.032, 16, 16]} />
              <meshBasicMaterial color={RING_BEAD_COLOR} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Shards stay outside the rig, so they parallax against the orb. */}
      {SHARDS.map((shard, i) => (
        <mesh
          key={shard.seed}
          ref={(mesh) => {
            shards.current[i] = mesh;
          }}
          position={shard.position}
          rotation={shard.rotation}
          scale={shard.scale}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color={SHARD_COLOR}
            transmission={0.85}
            metalness={0.25}
            thickness={0.8}
            roughness={0.02}
            ior={1.7}
            attenuationColor={ACCENT}
            attenuationDistance={0.6}
            clearcoat={1}
            clearcoatRoughness={0}
            iridescence={1}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[200, 800]}
            envMapIntensity={3}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}
