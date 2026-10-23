"use client";

// The live 3D scene for <WorkShowcase />. Loaded on demand via next/dynamic,
// so three.js and drei stay out of the initial bundle.

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  RoundedBox,
  useCursor,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import type { WorkProject } from "@/lib/work";
import { SceneSignals, getGlowTexture } from "./shared";

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */

// Colors
const ACCENT = "#7B5CFF"; // glow behind the project in focus
const DEVICE_COLOR = "#3A3A45"; // space-grey aluminium body
const DECK_COLOR = "#17171D"; // keyboard area on the laptop deck
const SCREEN_DIM = 0.3; // screen brightness of projects out of focus (0–1)

// Layout
const PROJECT_SPACING = 5.6; // vertical gap between projects, world units
const CAMERA_Z = 9.5;
const CAMERA_FOV = 30;
const CAMERA_SWAY = 0.7; // sideways arc the camera takes between projects
const CONTENT_LIFT = 0.4; // raises the devices so they clear the caption in the bottom left
const CONTENT_WIDTH = 5.8; // room the laptop + phone need; narrower canvases scale down
const LAPTOP_PITCH = 0.18; // radians the laptop leans toward the camera (shows the keyboard)
const LID_ANGLE = 0.22; // radians the lid leans back past vertical

// Motion
const SCROLL_DAMPING = 3.2; // how quickly the camera catches up with the scroll; higher = snappier
const TURN_AWAY = 0.55; // radians a project turns as it leaves focus
const TILT_PASS = 0.2; // radians it tips forward/back as it scrolls past
const SCALE_OUT = 0.12; // how much smaller projects are out of focus (0.12 = 12 %)
const HOVER_TILT = 0.14; // radians a hovered project tips toward the cursor
const HOVER_DAMPING = 6;
const FLOAT_AMPLITUDE = 0.06; // idle bob, world units (only when `float` is on)
const FLOAT_SPEED = 0.7;

// Glow
const GLOW_SIZE = 8.5; // world units
const GLOW_OPACITY = 0.3;

// Rendering
const DPR: [number, number] = [1, 1.75];
const MAX_FRAME_DELTA = 1 / 30; // clamps time steps after a tab switch so nothing jumps
const SETTLE_EPSILON = 0.0005; // below this, motion counts as finished and rendering stops

/* ════════════════════════════════════════════════════════════════════════ */

// Device dimensions. Screens match the screenshot ratios in lib/work.ts.
const LAPTOP = {
  width: 3.4,
  depth: 2.25,
  lidHeight: 2.2,
  screenW: 3.2,
  screenH: 2,
}; // 16:10
const PHONE = {
  width: 1,
  height: 2.07,
  depth: 0.07,
  screenW: 0.92,
  screenH: 1.99,
}; // ~9:19.5

export type WorkShowcaseSceneProps = {
  projects: readonly WorkProject[];
  /** The tall element whose scroll position drives the camera. */
  scrollTarget: RefObject<HTMLElement | null>;
  /** False while off screen: rendering stops completely. */
  active: boolean;
  reducedMotion: boolean;
  /** Gentle idle bob. Turning it off lets the canvas sleep between interactions. */
  float: boolean;
  /** Called when the visitor clicks the project in focus. */
  onOpen: (index: number) => void;
  onReady?: () => void;
  onContextLost?: () => void;
};

export default function WorkShowcaseScene({
  active,
  onReady,
  onContextLost,
  ...sceneProps
}: WorkShowcaseSceneProps) {
  return (
    <Canvas
      dpr={DPR}
      // Renders only when scroll, hover or float asks for a frame; never while off screen.
      frameloop={active ? "demand" : "never"}
      camera={{
        position: [0, 0, CAMERA_Z],
        fov: CAMERA_FOV,
        near: 0.1,
        far: 60,
      }}
      gl={{
        alpha: true, // transparent, so the page background shows through
        antialias: true,
        stencil: false,
        powerPreference: "high-performance",
      }}
    >
      <StudioLights />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={2} />
      <Suspense fallback={null}>
        <Showcase {...sceneProps} />
        <SceneSignals
          active={active}
          onReady={onReady}
          onContextLost={onContextLost}
        />
      </Suspense>
    </Canvas>
  );
}

/** Reflections for the device bodies, baked once from soft light cards. */
function StudioLights() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer
        form="rect"
        intensity={2}
        color="#FFFFFF"
        position={[0, 4, 5]}
        scale={[8, 2, 1]}
      />
      <Lightformer
        form="rect"
        intensity={3.5}
        color={ACCENT}
        position={[5, 0, 1]}
        scale={[1, 6, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.2}
        color="#A5B4FC"
        position={[-5, -1, 2]}
        scale={[1, 6, 1]}
      />
    </Environment>
  );
}

type DeviceKit = {
  laptopScreen: THREE.ShapeGeometry;
  phoneBody: THREE.ExtrudeGeometry;
  phoneScreen: THREE.ShapeGeometry;
  glowPlane: THREE.PlaneGeometry;
  body: THREE.MeshStandardMaterial;
  deck: THREE.MeshStandardMaterial;
  glow: THREE.Texture;
};

/** Geometry and materials shared by every project, built once. */
function useDeviceKit(): DeviceKit {
  const kit = useMemo<DeviceKit>(
    () => ({
      laptopScreen: screenGeometry(LAPTOP.screenW, LAPTOP.screenH, 0.03),
      phoneBody: phoneBodyGeometry(),
      phoneScreen: screenGeometry(PHONE.screenW, PHONE.screenH, 0.11),
      glowPlane: new THREE.PlaneGeometry(1, 1),
      body: new THREE.MeshStandardMaterial({
        color: DEVICE_COLOR,
        metalness: 0.5,
        roughness: 0.4,
      }),
      deck: new THREE.MeshStandardMaterial({
        color: DECK_COLOR,
        metalness: 0.3,
        roughness: 0.65,
      }),
      glow: getGlowTexture(),
    }),
    [],
  );

  // Passed in as props, so fiber won't dispose them for us.
  useEffect(
    () => () => {
      kit.laptopScreen.dispose();
      kit.phoneBody.dispose();
      kit.phoneScreen.dispose();
      kit.glowPlane.dispose();
      kit.body.dispose();
      kit.deck.dispose();
    },
    [kit],
  );

  return kit;
}

type ShowcaseProps = Omit<
  WorkShowcaseSceneProps,
  "active" | "onReady" | "onContextLost"
>;

function Showcase({
  projects,
  scrollTarget,
  reducedMotion,
  float,
  onOpen,
}: ShowcaseProps) {
  const invalidate = useThree((state) => state.invalidate);
  const aspect = useThree((state) => state.size.width / state.size.height);
  const kit = useDeviceKit();

  const urls = useMemo(
    () => projects.flatMap((project) => [project.image, project.mobileImage]),
    [projects],
  );
  const textures = useTexture(urls, (loaded) => {
    for (const texture of [loaded].flat()) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8; // sharper screens at an angle; clamped to what the GPU supports
    }
  });

  // Scroll position in "project units": 0 = first project, 1 = second, …
  const target = useRef(0);
  // The same value, smoothed. Everything in the scene follows this one.
  const current = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const element = scrollTarget.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress =
        scrollable > 0
          ? THREE.MathUtils.clamp(-rect.top / scrollable, 0, 1)
          : 0;
      target.current = progress * Math.max(projects.length - 1, 0);
      invalidate();
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollTarget, projects.length, invalidate]);

  // Runs before the per-project frames (negative priority), so they all read
  // this frame's camera position.
  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_FRAME_DELTA);
    // Reduced motion: jump straight to the nearest project, no camera flight.
    const goal = reducedMotion ? Math.round(target.current) : target.current;
    const from = current.current ?? goal; // first frame: start where the page already is
    const next = reducedMotion
      ? goal
      : THREE.MathUtils.damp(from, goal, SCROLL_DAMPING, dt);
    current.current = next;

    const sway = reducedMotion ? 0 : Math.sin(next * Math.PI) * CAMERA_SWAY;
    const y = -next * PROJECT_SPACING - CONTENT_LIFT;
    state.camera.position.set(sway, y, CAMERA_Z);
    state.camera.lookAt(0, y, 0);

    const moving = Math.abs(next - goal) > SETTLE_EPSILON;
    if (moving || (float && !reducedMotion)) state.invalidate();
  }, -1);

  const visibleWidth =
    2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * aspect;
  const fit = Math.min(1, visibleWidth / CONTENT_WIDTH);

  return (
    <>
      {projects.map((project, index) => (
        <ProjectDevices
          key={project.slug}
          index={index}
          desktop={textures[index * 2]}
          mobile={textures[index * 2 + 1]}
          current={current}
          kit={kit}
          fit={fit}
          reducedMotion={reducedMotion}
          float={float}
          onOpen={onOpen}
        />
      ))}
    </>
  );
}

type ProjectDevicesProps = {
  index: number;
  desktop: THREE.Texture | undefined;
  mobile: THREE.Texture | undefined;
  current: RefObject<number | null>;
  kit: DeviceKit;
  fit: number;
  reducedMotion: boolean;
  float: boolean;
  onOpen: (index: number) => void;
};

function ProjectDevices({
  index,
  desktop,
  mobile,
  current,
  kit,
  fit,
  reducedMotion,
  float,
  onOpen,
}: ProjectDevicesProps) {
  const invalidate = useThree((state) => state.invalidate);
  const group = useRef<THREE.Group>(null);
  const laptopScreen = useRef<THREE.MeshBasicMaterial>(null);
  const phoneScreen = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const time = useRef(0);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Even projects put the phone on the right, odd ones on the left.
  const side = index % 2 === 0 ? 1 : -1;
  const isInFocus = () => Math.abs(index - (current.current ?? 0)) < 0.5;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, MAX_FRAME_DELTA);

    // 0 when this project is centered, ±1 one project away.
    const offset = index - (current.current ?? 0);
    const focus = 1 - Math.min(Math.abs(offset), 1);
    const eased = focus * focus * (3 - 2 * focus); // smoothstep

    // Tip toward the cursor while hovered.
    const canTilt = hovered && !reducedMotion;
    const goalX = canTilt ? -state.pointer.y * HOVER_TILT : 0;
    const goalY = canTilt ? state.pointer.x * HOVER_TILT : 0;
    tilt.current.x = THREE.MathUtils.damp(
      tilt.current.x,
      goalX,
      HOVER_DAMPING,
      dt,
    );
    tilt.current.y = THREE.MathUtils.damp(
      tilt.current.y,
      goalY,
      HOVER_DAMPING,
      dt,
    );

    const floating = float && !reducedMotion;
    if (floating) time.current += dt;
    const bob = floating
      ? Math.sin(time.current * FLOAT_SPEED + index * 1.3) * FLOAT_AMPLITUDE
      : 0;

    g.position.set(0, -index * PROJECT_SPACING + bob, 0);
    g.rotation.set(
      offset * TILT_PASS + tilt.current.x,
      side * (1 - eased) * TURN_AWAY + tilt.current.y,
      0,
    );
    g.scale.setScalar(fit * (1 - SCALE_OUT * (1 - eased)));

    const brightness = SCREEN_DIM + (1 - SCREEN_DIM) * eased;
    laptopScreen.current?.color.setScalar(brightness);
    phoneScreen.current?.color.setScalar(brightness);
    if (glow.current) glow.current.opacity = GLOW_OPACITY * eased;

    // Keep drawing until the hover tilt has settled.
    const settling =
      Math.abs(tilt.current.x - goalX) > SETTLE_EPSILON ||
      Math.abs(tilt.current.y - goalY) > SETTLE_EPSILON;
    if (settling) state.invalidate();
  });

  return (
    <group
      ref={group}
      onPointerMove={(event) => {
        event.stopPropagation();
        setHovered(isInFocus());
        invalidate();
      }}
      onPointerLeave={() => setHovered(false)}
      onClick={(event) => {
        event.stopPropagation();
        if (isInFocus()) onOpen(index);
      }}
    >
      {/* Soft purple glow, only visible on the project in focus. */}
      <mesh
        geometry={kit.glowPlane}
        position={[0, 0, -2]}
        scale={GLOW_SIZE}
        raycast={() => null}
      >
        <meshBasicMaterial
          ref={glow}
          map={kit.glow}
          color={ACCENT}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Laptop, shifted away from the phone's side. */}
      <group position={[-side * 0.55, 0, 0]} rotation-x={LAPTOP_PITCH}>
        <group position={[0, -0.85, -0.75]}>
          <RoundedBox
            args={[LAPTOP.width, 0.08, LAPTOP.depth]}
            radius={0.035}
            smoothness={3}
            position={[0, -0.04, LAPTOP.depth / 2]}
            material={kit.body}
          />
          {/* Keyboard area and trackpad. */}
          <mesh
            position={[0, 0.001, LAPTOP.depth * 0.33]}
            rotation-x={-Math.PI / 2}
            material={kit.deck}
          >
            <planeGeometry args={[LAPTOP.width - 0.6, LAPTOP.depth * 0.42]} />
          </mesh>
          <mesh
            position={[0, 0.001, LAPTOP.depth * 0.78]}
            rotation-x={-Math.PI / 2}
            material={kit.deck}
          >
            <planeGeometry args={[1.1, LAPTOP.depth * 0.3]} />
          </mesh>
          {/* Lid, hinged on the back edge of the base. */}
          <group rotation-x={-LID_ANGLE}>
            <RoundedBox
              args={[LAPTOP.width, LAPTOP.lidHeight, 0.06]}
              radius={0.03}
              smoothness={3}
              position={[0, LAPTOP.lidHeight / 2, -0.03]}
              material={kit.body}
            />
            <mesh
              geometry={kit.laptopScreen}
              position={[0, LAPTOP.lidHeight / 2 + 0.03, 0.002]}
            >
              <meshBasicMaterial
                ref={laptopScreen}
                map={desktop}
                toneMapped={false}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Phone, in front and turned toward the laptop. */}
      <group
        position={[side * 2.15, -0.3, 0.9]}
        rotation={[0.06, -side * 0.32, side * 0.04]}
      >
        <mesh geometry={kit.phoneBody} material={kit.body} />
        <mesh
          geometry={kit.phoneScreen}
          position={[0, 0, PHONE.depth / 2 + 0.002]}
        >
          <meshBasicMaterial
            ref={phoneScreen}
            map={mobile}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ── Geometry helpers ───────────────────────────────────────────────────── */

function roundedRect(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

/** A flat rounded rectangle with UVs stretched 0–1, so a screenshot fills it exactly. */
function screenGeometry(width: number, height: number, radius: number) {
  const geometry = new THREE.ShapeGeometry(
    roundedRect(width, height, radius),
    8,
  );
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  if (position && uv) {
    for (let i = 0; i < position.count; i++) {
      uv.setXY(
        i,
        position.getX(i) / width + 0.5,
        position.getY(i) / height + 0.5,
      );
    }
    uv.needsUpdate = true;
  }
  return geometry;
}

/** Thin slab with rounded corners and soft bevelled edges, centered on the origin. */
function phoneBodyGeometry() {
  const bevel = 0.012;
  const geometry = new THREE.ExtrudeGeometry(
    roundedRect(PHONE.width - bevel * 2, PHONE.height - bevel * 2, 0.14),
    {
      depth: PHONE.depth - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 12,
    },
  );
  geometry.center();
  return geometry;
}
