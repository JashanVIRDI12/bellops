"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Center, RoundedBox, useFont } from "@react-three/drei";
import * as THREE from "three";
import {
  Wordmark,
  WORDMARK_FONT_URL,
  WORDMARK_LETTER_SPACING,
} from "@/components/Logo3D";
import { rig } from "./rig";

const WALL_X = 9.16;
const WALL_GAP = 0.105;
const HEIGHT = 0.42;
const SCALE = 0.46;
const PANEL_WIDTH = 2.28;
const PANEL_HEIGHT = 0.83;
const LETTER_Z = 0.19;
const PROBE_POSITION: [number, number, number] = [8.4, HEIGHT, 0];

type Probe = { camera: THREE.CubeCamera; target: THREE.WebGLCubeRenderTarget };
type SignFont = ReturnType<typeof useFont>;

/** A fixed light spill, traced from the same outlines as the extruded letters. */
function letterHalo(font: SignFont) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 384;
  const context = canvas.getContext("2d")!;
  const bellWidth = [..."Bell"].reduce(
    (width, letter) =>
      width +
      font.data.glyphs[letter].ha / font.data.resolution +
      WORDMARK_LETTER_SPACING,
    0,
  );
  const parts = [
    { text: "Bell", offset: 0, color: "#DCE4FF" },
    { text: "Ops", offset: bellWidth, color: "#8D49FF" },
  ].map((part) => ({
    ...part,
    shapes: font.generateShapes(part.text, 1, {
      letterSpacing: WORDMARK_LETTER_SPACING,
    }),
  }));
  const bounds = new THREE.Box2();
  for (const part of parts) {
    for (const shape of part.shapes) {
      for (const point of shape.getPoints(24)) {
        bounds.expandByPoint(new THREE.Vector2(point.x + part.offset, point.y));
      }
    }
  }
  const center = bounds.getCenter(new THREE.Vector2());

  for (const [blur, opacity] of [
    [22, 0.65],
    [7, 0.85],
  ]) {
    context.filter = `blur(${blur}px)`;
    context.globalAlpha = opacity;
    for (const part of parts) {
      context.fillStyle = part.color;
      for (const shape of part.shapes) {
        const points = shape.extractPoints(24);
        context.beginPath();
        for (const ring of [points.shape, ...points.holes]) {
          ring.forEach((point, index) => {
            const x =
              (((point.x + part.offset - center.x) * SCALE) / PANEL_WIDTH +
                0.5) *
              canvas.width;
            const y =
              (0.5 - ((point.y - center.y) * SCALE) / PANEL_HEIGHT) *
              canvas.height;
            if (index === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          });
          context.closePath();
        }
        context.fill("evenodd");
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Soft LED bounce behind the board; the opaque panel occludes its center. */
function wallHalo() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 384;
  const context = canvas.getContext("2d")!;
  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#ADB9DC");
  gradient.addColorStop(0.48, "#AAA1DD");
  gradient.addColorStop(1, "#8A3BFF");
  context.fillStyle = gradient;
  context.filter = "blur(24px)";
  context.beginPath();
  context.roundRect(82, 76, 604, 232, 18);
  context.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Fine horizontal tooling marks on the powder-coated aluminium face. */
function panelGrain() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const pixels = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    const stripe = Math.sin(y * 17.31) * 12;
    for (let x = 0; x < canvas.width; x++) {
      const value = 128 + stripe + Math.sin(x * 73.13 + y * 31.7) * 8;
      const index = (y * canvas.width + x) * 4;
      pixels.data[index] = value;
      pixels.data[index + 1] = value;
      pixels.data[index + 2] = value;
      pixels.data[index + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

/** Points a panel material at the probe's reflections once they exist. */
function attachReflections(
  material: THREE.MeshStandardMaterial | null,
  reflections: THREE.Texture | null,
) {
  if (!material || material.envMap === reflections) return;
  material.envMap = reflections;
  material.needsUpdate = true;
}

/**
 * Opal LED channel letters, metal returns and a standoff-mounted signboard.
 * `probeResolution` is the size of the cube map its metal reflects.
 */
export function LogoSign({
  probeResolution = 256,
}: {
  probeResolution?: number;
}) {
  const sign = useRef<THREE.Group>(null);
  const bell = useRef<THREE.MeshPhysicalMaterial>(null);
  const ops = useRef<THREE.MeshPhysicalMaterial>(null);
  const letterLight = useRef<THREE.MeshBasicMaterial>(null);
  const wallLight = useRef<THREE.MeshBasicMaterial>(null);
  const panelRim = useRef<THREE.MeshPhysicalMaterial>(null);
  const panelFace = useRef<THREE.MeshStandardMaterial>(null);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const font = useFont(WORDMARK_FONT_URL);
  const textures = useMemo(
    () => ({
      letters: letterHalo(font),
      wall: wallHalo(),
      grain: panelGrain(),
    }),
    [font],
  );
  const probe = useRef<Probe | null>(null);
  const reflections = useRef<THREE.Texture | null>(null);
  const captured = useRef(0);
  const reflectionMood = useRef("");

  useEffect(() => {
    const target = new THREE.WebGLCubeRenderTarget(probeResolution, {
      type: THREE.HalfFloatType,
    });
    const camera = new THREE.CubeCamera(0.05, 260, target);
    camera.position.set(...PROBE_POSITION);
    probe.current = { camera, target };
    reflections.current = target.texture;
    captured.current = 0;
    return () => {
      probe.current = null;
      reflections.current = null;
      target.dispose();
    };
  }, [probeResolution]);

  useEffect(
    () => () => Object.values(textures).forEach((texture) => texture.dispose()),
    [textures],
  );

  useFrame((state) => {
    // A smooth driver fade, with no flashing or flicker at startup.
    const power = THREE.MathUtils.smoothstep(rig.intro, 0.08, 0.8);
    if (bell.current) bell.current.emissiveIntensity = 0.08 + power * 0.8;
    if (ops.current) ops.current.emissiveIntensity = 0.15 + power * 1.8;
    if (letterLight.current) letterLight.current.opacity = power * 0.72;
    if (wallLight.current) wallLight.current.opacity = power * 0.24;

    attachReflections(panelRim.current, reflections.current);
    attachReflections(panelFace.current, reflections.current);

    // Reflect the actual windows and room twice, then stop updating the probe.
    // A capture draws the room six times, so after the first one (during the
    // warm-up) they wait for the camera to come to rest.
    const current = probe.current;
    if (!current) return;
    if (captured.current > 0 && rig.moving && rig.warmShot === null) return;
    if (reflectionMood.current !== rig.environmentKey) {
      reflectionMood.current = rig.environmentKey;
      captured.current = 0;
    }
    const stage = rig.intro >= 1 && rig.lightingSettled ? 2 : 1;
    if (captured.current >= stage) return;
    captured.current = stage;
    const group = sign.current;
    if (group) group.visible = false;
    current.camera.update(gl, scene);
    current.target.texture.needsPMREMUpdate = true;
    if (group) group.visible = true;
    // The probe may have drawn the kept shadows without the sign: redraw them.
    state.gl.shadowMap.needsUpdate = true;
  });

  return (
    <group
      ref={sign}
      position={[WALL_X - WALL_GAP, HEIGHT, 0]}
      rotation-y={-Math.PI / 2}
    >
      <mesh position-z={-WALL_GAP + 0.002}>
        <planeGeometry args={[3.08, 1.42]} />
        <meshBasicMaterial
          ref={wallLight}
          map={textures.wall}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <RoundedBox
        args={[PANEL_WIDTH, PANEL_HEIGHT, 0.08]}
        radius={0.024}
        smoothness={4}
        castShadow
        receiveShadow={false}
      >
        <meshPhysicalMaterial
          ref={panelRim}
          color="#333641"
          metalness={0.85}
          roughness={0.3}
          envMapIntensity={0.65}
        />
      </RoundedBox>
      <RoundedBox
        args={[PANEL_WIDTH - 0.024, PANEL_HEIGHT - 0.024, 0.018]}
        position-z={0.041}
        radius={0.012}
        smoothness={4}
        receiveShadow={false}
      >
        <meshStandardMaterial
          ref={panelFace}
          color="#11131C"
          metalness={0.35}
          roughness={0.55}
          bumpMap={textures.grain}
          bumpScale={0.0006}
          envMapIntensity={0.45}
        />
      </RoundedBox>

      <mesh position-z={0.052}>
        <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
        <meshBasicMaterial
          ref={letterLight}
          map={textures.letters}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {[-1, 1].flatMap((x) =>
        [-1, 1].map((y) => (
          <group
            key={`${x}:${y}`}
            position={[
              x * (PANEL_WIDTH / 2 - 0.095),
              y * (PANEL_HEIGHT / 2 - 0.095),
              0.053,
            ]}
          >
            <mesh rotation-x={Math.PI / 2} castShadow>
              <cylinderGeometry args={[0.011, 0.013, 0.006, 16]} />
              <meshStandardMaterial
                color="#9A9CA5"
                metalness={1}
                roughness={0.3}
              />
            </mesh>
            <mesh position-z={0.0035} rotation-z={x * y * 0.35}>
              <boxGeometry args={[0.014, 0.002, 0.001]} />
              <meshStandardMaterial color="#25262B" roughness={0.7} />
            </mesh>
          </group>
        )),
      )}

      <group scale={SCALE} position-z={LETTER_Z}>
        <Center>
          <Wordmark
            illuminated
            receiveShadow={false}
            glow={1.95}
            opsReflections={0.65}
            envMapRef={reflections}
            bellMaterialRef={bell}
            opsMaterialRef={ops}
          />
        </Center>
      </group>
    </group>
  );
}
