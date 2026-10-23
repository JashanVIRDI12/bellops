"use client";

import {
  Center,
  Environment,
  Lightformer,
  Text3D,
  useFont,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Ref,
  type RefObject,
} from "react";
import {
  ACESFilmicToneMapping,
  MathUtils,
  type Group,
  type Mesh,
  type MeshPhysicalMaterial,
  type Texture,
} from "three";
import { SceneSignals } from "@/components/three/scenes/shared";

export const WORDMARK_FONT_URL = "/fonts/outfit-bold.typeface.json";
const FONT_URL = WORDMARK_FONT_URL;
const STUDIO_HDR = "/hdri/studio_small_03_1k.hdr";

const TEXT_SIZE = 1;
export const WORDMARK_LETTER_SPACING = -0.015;
const LETTER_SPACING = WORDMARK_LETTER_SPACING;
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
  /** Stops rendering entirely, e.g. while scrolled off screen. */
  paused?: boolean;
  /** Fired once the wordmark's first frame is on screen. */
  onReady?: () => void;
  /** Fired if the browser drops the WebGL context. */
  onContextLost?: () => void;
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

/*
 * Materials, made to read as real sign metal rather than plastic: no clear
 * plastic-like coat, fully metallic surfaces whose look comes from what they
 * reflect, and a brushed grain that stretches highlights sideways.
 * "Bell" is brushed stainless steel; "Ops" is deep-violet anodized aluminium.
 */
const BELL_STEEL = "#CDD0D4";
const OPS_COLOR = "#4A2FC4";
const OPS_GLOW = "#2A1580";

/** The extruded "BellOps" wordmark. Also used as the wall sign in the studio scene. */
export function Wordmark({
  glow = 0.12,
  opsReflections = 0.7,
  envMap,
  envMapRef,
  illuminated = false,
  receiveShadow = true,
  bellMaterialRef,
  opsMaterialRef,
}: {
  glow?: number;
  /**
   * How strongly "Ops" mirrors its surroundings. Lower keeps it darker under
   * bright studio light; dimmer scenes can raise it.
   */
  opsReflections?: number;
  /** What the letters reflect. The studio sign passes a capture of the real room. */
  envMap?: Texture | null;
  /** A scene can fill its reflection probe after mounting without a React render. */
  envMapRef?: RefObject<Texture | null>;
  /** Opal LED faces with separate metal returns for a mounted channel-letter sign. */
  illuminated?: boolean;
  receiveShadow?: boolean;
  bellMaterialRef?: Ref<MeshPhysicalMaterial>;
  /** Lets a scene animate the "Ops" glow. */
  opsMaterialRef?: Ref<MeshPhysicalMaterial>;
}) {
  const font = useFont(FONT_URL) as FontMetrics;
  const bellWidth = measure(font, "Bell");

  // three.js ignores a material's envMapIntensity when it's lit by the shared
  // scene.environment (it uses scene.environmentIntensity instead). Pointing
  // the letters at their environment directly makes their own strength count.
  const bellMesh = useRef<Mesh>(null);
  const opsMesh = useRef<Mesh>(null);
  useFrame(({ scene }) => {
    const reflections = envMapRef?.current ?? envMap ?? scene.environment;
    for (const mesh of [bellMesh.current, opsMesh.current]) {
      const materials = mesh
        ? Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]
        : [];
      for (const entry of materials) {
        const material = entry as MeshPhysicalMaterial;
        if (material.envMap !== reflections) {
          material.envMap = reflections;
          material.needsUpdate = true;
        }
      }
    }
  });

  return (
    <>
      <Text3D
        ref={bellMesh}
        font={FONT_URL}
        size={TEXT_SIZE}
        castShadow
        receiveShadow={receiveShadow}
        {...EXTRUDE}
      >
        Bell
        {illuminated ? (
          <>
            <meshPhysicalMaterial
              attach="material-0"
              ref={bellMaterialRef}
              color="#D9DEEA"
              metalness={0.35}
              roughness={0.24}
              emissive="#DEE5FF"
              emissiveIntensity={0.8}
              envMapIntensity={0.65}
            />
            <meshPhysicalMaterial
              attach="material-1"
              color="#868D9D"
              metalness={1}
              roughness={0.26}
              envMapIntensity={1.2}
            />
          </>
        ) : (
          <meshPhysicalMaterial
            ref={bellMaterialRef}
            color={BELL_STEEL}
            metalness={1}
            roughness={0.3}
            anisotropy={0.75}
            anisotropyRotation={0}
            envMapIntensity={1}
          />
        )}
      </Text3D>
      <Text3D
        ref={opsMesh}
        font={FONT_URL}
        size={TEXT_SIZE}
        position={[bellWidth, 0, 0]}
        castShadow
        receiveShadow={receiveShadow}
        {...EXTRUDE}
      >
        Ops
        {illuminated ? (
          <>
            <meshPhysicalMaterial
              attach="material-0"
              ref={opsMaterialRef}
              color="#6329DC"
              metalness={0.2}
              roughness={0.24}
              emissive="#7533FF"
              emissiveIntensity={glow}
              envMapIntensity={opsReflections}
            />
            <meshPhysicalMaterial
              attach="material-1"
              color="#3E286A"
              metalness={0.9}
              roughness={0.27}
              envMapIntensity={opsReflections}
            />
          </>
        ) : (
          <meshPhysicalMaterial
            ref={opsMaterialRef}
            color={OPS_COLOR}
            metalness={1}
            roughness={0.34}
            anisotropy={0.55}
            anisotropyRotation={0}
            emissive={OPS_GLOW}
            emissiveIntensity={glow}
            envMapIntensity={opsReflections}
          />
        )}
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
  paused = false,
  onReady,
  onContextLost,
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
        dpr={[1, 1.75]}
        frameloop={paused ? "never" : animate ? "always" : "demand"}
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
          <SceneSignals
            active={!paused}
            onReady={onReady}
            onContextLost={onContextLost}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useFont.preload(FONT_URL);
