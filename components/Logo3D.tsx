"use client";

import {
  Center,
  Environment,
  Lightformer,
  Text3D,
  useFont,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ACESFilmicToneMapping, MathUtils, type Group } from "three";

const FONT_URL = "/fonts/outfit-bold.typeface.json";
const STUDIO_HDR = "/hdri/studio_small_03_1k.hdr";

const TEXT_SIZE = 1;
const LETTER_SPACING = -0.015;
const EXTRUDE = {
  height: 0.34,
  bevelEnabled: true,
  bevelThickness: 0.04,
  bevelSize: 0.026,
  bevelOffset: 0,
  bevelSegments: 5,
  curveSegments: 14,
  letterSpacing: LETTER_SPACING,
} as const;

export type Logo3DProps = {
  /** How large the wordmark sits in the frame. `1` fills it with padding. */
  size?: number;
  /** Slow spin and float. Defaults to on. */
  autoRotate?: boolean;
  /** Tilt toward the pointer. Defaults to on. */
  interactive?: boolean;
  className?: string;
};

type FontMetrics = {
  data: {
    resolution: number;
    glyphs: Record<string, { ha: number } | undefined>;
  };
};

function measure(font: FontMetrics, text: string) {
  const scale = TEXT_SIZE / font.data.resolution;
  let width = 0;
  for (const character of text) {
    width += (font.data.glyphs[character]?.ha ?? 0) * scale + LETTER_SPACING;
  }
  return width;
}

function Wordmark() {
  const font = useFont(FONT_URL) as FontMetrics;
  const bellWidth = measure(font, "Bell");

  return (
    <>
      <Text3D font={FONT_URL} size={TEXT_SIZE} {...EXTRUDE}>
        Bell
        <meshPhysicalMaterial
          color="#f4f4f7"
          metalness={1}
          roughness={0.16}
          anisotropy={0.4}
          anisotropyRotation={Math.PI / 2}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          reflectivity={1}
          envMapIntensity={1.8}
        />
      </Text3D>
      <Text3D
        font={FONT_URL}
        size={TEXT_SIZE}
        position={[bellWidth, 0, 0]}
        {...EXTRUDE}
      >
        Ops
        <meshPhysicalMaterial
          color="#7B5CFF"
          metalness={0.22}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.06}
          emissive="#7B5CFF"
          emissiveIntensity={0.32}
          envMapIntensity={1.15}
          sheen={0.45}
          sheenRoughness={0.35}
          sheenColor="#d9ceff"
        />
      </Text3D>
    </>
  );
}

function Scene({
  size,
  autoRotate,
  interactive,
  reducedMotion,
}: Required<Pick<Logo3DProps, "size" | "autoRotate" | "interactive">> & {
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const yaw = useRef(0.42);
  const get = useThree((state) => state.get);
  const viewKey = useThree(
    (state) => `${state.size.width}x${state.size.height}`,
  );

  const onCentered = useCallback(
    ({ width, height }: { width: number; height: number }) => {
      const { camera, size: view } = get();
      if (!("isPerspectiveCamera" in camera) || !camera.isPerspectiveCamera)
        return;
      const aspect = view.width / Math.max(view.height, 1);
      const fov = (camera.fov * Math.PI) / 180;
      const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
      const distanceForWidth = width / 2 / Math.tan(horizontalFov / 2);
      const distanceForHeight = height / 2 / Math.tan(fov / 2);
      const distance =
        (Math.max(distanceForWidth, distanceForHeight) * 1.7) /
        Math.max(size, 0.05);
      camera.position.set(0, 0, distance);
      camera.near = Math.max(distance / 100, 0.01);
      camera.far = distance * 20;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    },
    [get, size],
  );

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;

    const motion = !reducedMotion;
    const spin = motion && autoRotate;
    const tilt = motion && interactive;

    if (spin) yaw.current += delta * 0.18;
    else yaw.current = MathUtils.damp(yaw.current, 0, 4, delta);

    const targetYaw = yaw.current + (tilt ? state.pointer.x * 0.28 : 0);
    const targetPitch = tilt ? -state.pointer.y * 0.16 : 0;
    const targetFloat = spin
      ? Math.sin(state.clock.elapsedTime * 0.65) * 0.06
      : 0;

    node.rotation.y = MathUtils.damp(node.rotation.y, targetYaw, 3.2, delta);
    node.rotation.x = MathUtils.damp(node.rotation.x, targetPitch, 3.2, delta);
    node.position.y = MathUtils.damp(node.position.y, targetFloat, 3, delta);
  });

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 8]} intensity={3.5} color="#ffffff" />
      <directionalLight position={[-6, 2, 5]} intensity={1.6} color="#f3f3f7" />
      <Environment
        files={STUDIO_HDR}
        environmentIntensity={1.6}
        environmentRotation={[0, 0.55, 0]}
        resolution={256}
      >
        <Lightformer
          form="rect"
          intensity={6}
          color="#ffffff"
          position={[0, 1.5, 6]}
          scale={[10, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color="#ffffff"
          position={[-5, 3, 2]}
          scale={[5, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#efeefe"
          position={[5, 2, 3]}
          scale={[4, 6, 1]}
          target={[0, 0, 0]}
        />
      </Environment>
      <group ref={group} rotation={[0, 0.42, 0]}>
        <Center cacheKey={`${size}:${viewKey}`} onCentered={onCentered}>
          <Wordmark />
        </Center>
      </group>
    </>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function Logo3D({
  size = 1,
  autoRotate = true,
  interactive = true,
  className,
}: Logo3DProps) {
  const reducedMotion = usePrefersReducedMotion();
  const animate = !reducedMotion && (autoRotate || interactive);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%" }}
      role="img"
      aria-label="BellOps"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 32 }}
        dpr={[1, 2]}
        frameloop={animate ? "always" : "demand"}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.28;
        }}
      >
        <Suspense fallback={null}>
          <Scene
            size={size}
            autoRotate={autoRotate}
            interactive={interactive}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useFont.preload(FONT_URL);
