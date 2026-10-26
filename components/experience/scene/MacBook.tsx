"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { shot } from "@/lib/content";
import { projects as defaultProjects, type WorkProject } from "@/lib/work";
import { MACBOOK_URL } from "./models";
import { rig } from "./rig";

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */

// On the desk, keyboard toward the chair. The model is in centimeters.
const POSITION: [number, number, number] = [3.86, -0.6294, 0];
const SCALE = 0.01;
const SCREEN_INTENSITY = 2.1; // bright enough to hold its own in daylight; above ~1 it blooms
const SWITCH_SPEED = 6; // how quickly the screen fades back in after changing project
const FIRST_WORK_BEAT = shot("work"); // the camera beat that shows the first project

/* ════════════════════════════════════════════════════════════════════════ */

export function MacBook({ projects }: { projects: readonly WorkProject[] }) {
  const gltf = useGLTF(MACBOOK_URL);

  // A private copy with its own screen material, so we can swap what it shows.
  const { laptop, screen } = useMemo(() => {
    const copy = gltf.scene.clone(true);
    let screenMaterial: THREE.MeshStandardMaterial | null = null;
    copy.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const material = object.material as THREE.MeshStandardMaterial;
      if (material.emissiveMap) {
        screenMaterial = material.clone();
        object.material = screenMaterial;
      }
    });
    return {
      laptop: copy,
      screen: screenMaterial as THREE.MeshStandardMaterial | null,
    };
  }, [gltf.scene]);

  // The frame loop edits the screen through a ref (React treats memo values as frozen).
  const screenRef = useRef<THREE.MeshStandardMaterial | null>(null);
  useEffect(() => {
    screenRef.current = screen;
    return () => {
      screenRef.current = null;
      screen?.dispose();
    };
  }, [screen]);

  const urls = useMemo(() => screenUrls(projects), [projects]);
  const textures = useTexture(urls, prepareScreens);

  const shown = useRef(-1);
  const fade = useRef(1);

  useFrame((state, delta) => {
    const screen = screenRef.current;
    if (!screen || textures.length === 0) return;
    const dt = Math.min(delta, 1 / 30);
    const wanted = THREE.MathUtils.clamp(
      Math.round(rig.progress) - FIRST_WORK_BEAT,
      0,
      textures.length - 1,
    );
    if (wanted !== shown.current) {
      // Cut to black, swap, fade back in: reads as the screen changing page.
      shown.current = wanted;
      fade.current = 0;
      screen.emissiveMap = textures[wanted] ?? null;
    }
    fade.current = THREE.MathUtils.damp(fade.current, 1, SWITCH_SPEED, dt);
    screen.emissiveIntensity = SCREEN_INTENSITY * rig.screen * fade.current;
    if (fade.current < 0.995) state.invalidate();
  });

  return (
    <primitive
      object={laptop}
      position={POSITION}
      rotation-y={-Math.PI / 2}
      scale={SCALE}
    />
  );
}

/** The screenshots the laptop shows, in order. */
function screenUrls(list: readonly WorkProject[]) {
  return list.map((project) => project.image);
}

/** Screenshots are sRGB and stay sharp at an angle. */
function prepareScreens(loaded: THREE.Texture | THREE.Texture[]) {
  for (const texture of [loaded].flat()) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }
}

// Start every download as this module loads, not while React renders: a load
// that starts mid-render updates the loading bar (useProgress) mid-render,
// which React reports as "Cannot update a component while rendering a
// different component". Projects other than these would still load on render.
useGLTF.preload(MACBOOK_URL);
useTexture.preload(screenUrls(defaultProjects));
