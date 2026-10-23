"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertex = /* glsl */ `
  attribute float aSeed;
  attribute float aOpacity;
  uniform float uTime;
  uniform float uSpeed;
  varying float vOpacity;
  void main() {
    vec3 p = position;
    p.y += mod(aSeed - uTime * uSpeed, 1.0) * 7.0 - 2.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 3.0;
    vOpacity = aOpacity;
  }
`;
const fragment = /* glsl */ `
  uniform float uSnow;
  varying float vOpacity;
  void main() {
    if (uSnow > 0.5 && distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;
    gl_FragColor = vec4(mix(vec3(0.78, 0.84, 0.9), vec3(0.9, 0.94, 1.0), uSnow), vOpacity);
  }
`;

/** Rain stays beyond the window wall, so no particles fall inside the office. */
export function Precipitation({ kind }: { kind: "rain" | "snow" }) {
  const shader = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const count = kind === "snow" ? 320 : 1500;
    const positions = new Float32Array(count * 2 * 3);
    const seeds = new Float32Array(count * 2);
    const opacity = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const seed = (Math.sin(i * 73.17 + 1) * 9431.7) % 1;
      const x = -0.4 - Math.abs(Math.sin(i * 32.8)) * 11;
      const z = Math.sin(i * 19.61) * 12;
      for (let end = 0; end < 2; end++) {
        const index = i * 2 + end;
        positions.set(
          [
            x + end * 0.008,
            // Rain falls fast, so the eye sees streaks, not drops.
            end * (kind === "snow" ? 0.015 : 0.28 + Math.abs(seed) * 0.24),
            z,
          ],
          index * 3,
        );
        seeds[index] = seed;
        opacity[index] = kind === "snow" ? 0.35 : 0.1 + Math.abs(seed) * 0.2;
      }
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    result.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    result.setAttribute("aOpacity", new THREE.BufferAttribute(opacity, 1));
    return result;
  }, [kind]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: kind === "snow" ? 0.07 : 1.25 },
      uSnow: { value: kind === "snow" ? 1 : 0 },
    }),
    [kind],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((state, delta) => {
    if (shader.current)
      shader.current.uniforms.uTime.value += Math.min(delta, 0.05);
    state.invalidate();
  });
  const Particles = kind === "snow" ? "points" : "lineSegments";
  return (
    <Particles geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={shader}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </Particles>
  );
}
