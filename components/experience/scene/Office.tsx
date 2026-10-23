"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { OFFICE_URL } from "./models";
import { rig } from "./rig";

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */

// Window glass: barely there, a hint of sky.
const GLASS_COLOR = "#F5F8FF";
// Ceiling light panels: off in daylight, just a soft white.
const LAMP_COLOR = "#F4F1EA";
// The wall added to close the open side of the model. The logo hangs on it.
const BACK_WALL_COLOR = "#86837F"; // mid-grey plaster: silver "Bell" and violet "Ops" both read on it
// A touch of warmth over the model's cool textures.
const INTERIOR_TINT = "#FFF4E8";
const CEILING_LIGHTS: [number, number, number][] = [
  [2.4, 2.6, -1.9],
  [2.4, 2.6, 1.9],
  [6.7, 2.6, -1.9],
  [6.7, 2.6, 1.9],
];

// Rain on the glass: beads clinging to the panes and drops running down them.
const BEADS_PER_METER = 26; // bead grid; higher = smaller, denser beads
const RUN_LANES_PER_METER = 9; // how many running drops across each meter of glass
const RUN_SPEED: [number, number] = [0.12, 0.32]; // meters per second, slowest to fastest
const WET_STRENGTH = 0.5; // how visible the water is at full rain

/* ════════════════════════════════════════════════════════════════════════ */

const glassVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const glassFragment = /* glsl */ `
  uniform vec3 uTint;
  uniform float uOpacity;
  uniform float uWet;
  uniform float uTime;
  varying vec3 vWorld;
  varying vec3 vNormal;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // One bead per cell, at a random spot and size; some cells stay dry.
  // Returns the bead body and its small bright highlight, like a tiny lens.
  vec2 beads(vec2 uv, float density) {
    vec2 cell = floor(uv * density);
    vec2 f = fract(uv * density) - 0.5;
    if (hash(cell) < 0.45) return vec2(0.0);
    vec2 center = (vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5) * 0.45;
    float size = mix(0.1, 0.3, hash(cell + 1.9));
    float d = length((f - center) * vec2(1.0, 0.82));
    float body = smoothstep(size, size * 0.55, d);
    float spark = smoothstep(size * 0.32, 0.0, length(f - center - vec2(-0.3, 0.35) * size));
    return vec2(body, spark);
  }

  // A drop sliding down each lane, wobbling slightly, with a wet trail above it.
  vec2 runs(vec2 uv) {
    float lane = floor(uv.x * ${RUN_LANES_PER_METER.toFixed(1)});
    float r = hash(vec2(lane, 4.2));
    float laneX = (lane + 0.5 + (r - 0.5) * 0.6) / ${RUN_LANES_PER_METER.toFixed(1)};
    float x = uv.x - laneX + sin(uv.y * 9.0 + r * 6.0) * 0.006;
    float speed = mix(${RUN_SPEED[0].toFixed(2)}, ${RUN_SPEED[1].toFixed(2)}, r);
    float cycle = 5.0;
    float headY = 2.9 - mod(uTime * speed + r * cycle, cycle);
    float dy = uv.y - headY;
    float head = smoothstep(0.016, 0.008, length(vec2(x, dy * 0.75)));
    float spark = smoothstep(0.006, 0.0, length(vec2(x + 0.004, dy - 0.004)));
    float trail = smoothstep(0.004, 0.0, abs(x)) * step(0.0, dy) * (1.0 - smoothstep(0.0, 0.6, dy));
    return vec2(head + trail * 0.5, spark);
  }

  void main() {
    vec2 water = vec2(0.0);
    if (uWet > 0.01) {
      // Glass in the x = 0 wall runs along z; the side panes run along x.
      vec3 n = abs(vNormal);
      vec2 uv = n.x > n.z ? vec2(vWorld.z, vWorld.y) : vec2(vWorld.x, vWorld.y);
      water = beads(uv, ${BEADS_PER_METER.toFixed(1)})
        + beads(uv + 0.37, ${(BEADS_PER_METER * 1.9).toFixed(1)}) * 0.7
        + runs(uv);
      water = clamp(water, 0.0, 1.0) * uWet;
    }
    // Drops darken what's behind them a little and catch a bright highlight,
    // which is what makes them read as water rather than white dots.
    vec3 body = vec3(0.3, 0.34, 0.4);
    vec3 color = mix(uTint, body, water.x * 0.8);
    color = mix(color, vec3(1.0), water.y);
    float alpha = uOpacity + (water.x * 0.55 + water.y * 0.9) * ${WET_STRENGTH.toFixed(2)};
    gl_FragColor = vec4(color, alpha);
  }
`;

function createGlassMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: glassVertex,
    fragmentShader: glassFragment,
    uniforms: {
      uTint: { value: new THREE.Color(GLASS_COLOR) },
      uOpacity: { value: 0.012 },
      uWet: { value: 0 },
      uTime: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/** The room keeps its baked surface detail, with daylight and practical lamps added live. */
function relight(root: THREE.Object3D) {
  const disposable: THREE.Material[] = [];
  const glass: THREE.Mesh[] = [];
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const source = object.material as THREE.MeshStandardMaterial;
    const name = source.name;
    let material: THREE.Material;

    if (name === "Background") {
      // The model's misty backdrop; the afternoon sky dome replaces it.
      object.visible = false;
      return;
    } else if (name === "Glass") {
      material = createGlassMaterial();
      glass.push(object);
      object.castShadow = false; // sunlight passes through the panes
    } else if (name === "LightEmission") {
      material = new THREE.MeshBasicMaterial({ color: LAMP_COLOR });
    } else {
      material = new THREE.MeshLambertMaterial({
        map: source.emissiveMap ?? source.map,
        color: INTERIOR_TINT,
        side: source.side,
      });
      object.castShadow = true;
      object.receiveShadow = true;
    }
    object.material = material;
    disposable.push(material);
  });
  return { materials: disposable, glass };
}

let glassTime = 0;

/** Imperative Three.js material updates, outside React's render state. */
function updateGlass(mesh: THREE.Mesh) {
  // Clear glazing, with rain on it when it's wet outside.
  const uniforms = (mesh.material as THREE.ShaderMaterial).uniforms;
  uniforms.uOpacity!.value = 0.008 + rig.night * 0.008 + rig.wet * 0.018;
  uniforms.uWet!.value = rig.wet;
  uniforms.uTime!.value = glassTime;
}

/** The office model; `url` picks the full or the phone-sized textures. */
export function Office({ url = OFFICE_URL }: { url?: string }) {
  const ceilingLights = useRef<(THREE.SpotLight | null)[]>([]);
  const panels = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const originalPanels = useRef<THREE.MeshBasicMaterial[]>([]);
  const wallPanels = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const sconces = useRef<(THREE.PointLight | null)[]>([]);
  const windowPanes = useRef<THREE.Mesh[]>([]);
  const ceilingTargets = useMemo(
    () => CEILING_LIGHTS.map(() => new THREE.Object3D()),
    [],
  );
  const gltf = useGLTF(url);
  // A private copy, so remounts never stack material swaps on the cached original.
  const { office, materials, glass } = useMemo(() => {
    const copy = gltf.scene.clone(true);
    return { office: copy, ...relight(copy) };
  }, [gltf.scene]);

  useEffect(() => {
    windowPanes.current = glass;
    originalPanels.current = materials.filter(
      (material): material is THREE.MeshBasicMaterial =>
        material instanceof THREE.MeshBasicMaterial && !material.transparent,
    );
  }, [materials, glass]);
  useFrame((_, delta) => {
    // Drops only run while frames are drawn (rain keeps the loop going).
    if (rig.wet > 0.01) glassTime += Math.min(delta, 1 / 30);
    ceilingLights.current.forEach((light) => {
      if (light) light.intensity = rig.indoor * 32;
    });
    const panelLevel = 0.45 + rig.indoor * 1.0;
    for (const material of panels.current)
      material?.color.setRGB(1, 0.9, 0.75).multiplyScalar(panelLevel);
    for (const material of originalPanels.current)
      material.color.setRGB(1, 0.9, 0.75).multiplyScalar(panelLevel);
    wallPanels.current.forEach((material) => {
      if (material) {
        material.opacity = rig.indoor;
        material.color.setRGB(1.2, 1.02, 0.78);
      }
    });
    sconces.current.forEach((light) => {
      if (light) light.intensity = rig.indoor * 1.1;
    });
    for (const mesh of windowPanes.current) {
      updateGlass(mesh);
    }
  });

  useEffect(
    () => () => {
      materials.forEach((material) => material.dispose());
    },
    [materials],
  );

  return (
    <>
      <primitive object={office} />
      {CEILING_LIGHTS.map((position, index) => (
        <group key={index} position={position}>
          <spotLight
            target={ceilingTargets[index]}
            angle={0.95}
            penumbra={1}
            ref={(light) => {
              ceilingLights.current[index] = light;
            }}
            color="#FFF0D8"
            intensity={0}
            distance={7}
            decay={2}
          />
          <primitive object={ceilingTargets[index]} position={[0, -4, 0]} />
          <mesh position-y={0.16}>
            <boxGeometry args={[0.85, 0.025, 0.28]} />
            <meshBasicMaterial
              ref={(material) => {
                panels.current[index] = material;
              }}
              color="#EFE8DF"
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side, index) => (
        <group key={side} position={[2.47, 1.76, side * 3.72]}>
          <mesh rotation-y={side === 1 ? Math.PI : 0}>
            <planeGeometry args={[0.22, 0.44]} />
            <meshBasicMaterial
              ref={(material) => {
                wallPanels.current[index] = material;
              }}
              color="#FFE0B2"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            ref={(light) => {
              sconces.current[index] = light;
            }}
            position-z={side * -0.18}
            color="#FFE6C5"
            intensity={0}
            distance={4}
            decay={2}
          />
        </group>
      ))}
      {/* Closes the open side of the model; the logo sign hangs here. */}
      <mesh position={[9.16, 0.705, 0]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[8.8, 4.32]} />
        <meshLambertMaterial color={BACK_WALL_COLOR} />
      </mesh>
    </>
  );
}

// Each tier preloads its own model as soon as it's chosen (see Stage).
