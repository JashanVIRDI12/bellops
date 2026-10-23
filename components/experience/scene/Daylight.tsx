"use client";

// The room follows the visitor's daylight and weather, with a smooth transition.

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Atmosphere } from "@/lib/atmosphere";
import { lightingFor } from "./lighting";
import { rig } from "./rig";

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Direction the sunlight travels: in through the window wall (x = 0), low and
 * slightly from the left. Low enough (~11°) to reach across the room onto the logo.
 */
export const SUN_DIRECTION = new THREE.Vector3(0.94, -0.2, 0.28).normalize();
const SUN_COLOR = "#FFC384"; // golden late-afternoon sun
const SUN_INTENSITY = 3.4;
const SKY_FILL = "#DCE3EE"; // near-neutral sky light, so shadows stay soft but not blue
const GROUND_FILL = "#A88E74"; // warm light bouncing off the floor
const FILL_INTENSITY = 0.78;
const INTRO_SWEEP = 0.55; // radians the sun swings across the logo wall at load

/* ════════════════════════════════════════════════════════════════════════ */

const SUN_TARGET = new THREE.Vector3(4.6, -0.8, 0); // middle of the room
// Frames the shadows keep redrawing after the sun settles, so the last one
// lands on a frame with the whole room in it.
const SHADOW_SETTLE_FRAMES = 3;
const SUN_DISTANCE = 22;
const UP = new THREE.Vector3(0, 1, 0);
const direction = new THREE.Vector3();

/**
 * The sun and the sky's fill light. Dims with each shot's exposure.
 *
 * Nothing in the room moves and the sun only moves during the load sequence,
 * so the shadows are drawn while it sweeps in and then kept: every later frame
 * skips a whole extra pass over the scene.
 */
export function Daylight({
  atmosphere,
  shadowMapSize = 2048,
}: {
  atmosphere: Atmosphere;
  shadowMapSize?: number;
}) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.HemisphereLight>(null);
  const invalidate = useThree((state) => state.invalidate);
  const getState = useThree((state) => state.get);
  const target = useMemo(() => lightingFor(atmosphere), [atmosphere]);
  const environmentKey = `${atmosphere.phase}:${atmosphere.cloudCover.toFixed(2)}`;
  const shadowFrames = useRef(SHADOW_SETTLE_FRAMES);
  useEffect(() => invalidate(), [target, invalidate]);

  useEffect(() => {
    const { shadowMap } = getState().gl;
    shadowMap.autoUpdate = false;
    shadowMap.needsUpdate = true;
    return () => {
      shadowMap.autoUpdate = true;
    };
  }, [getState]);

  useFrame((state, delta) => {
    const light = sun.current;
    if (!light) return;
    // Redraw the shadows while the sun sweeps in, then a few frames more.
    if (rig.intro < 1) shadowFrames.current = SHADOW_SETTLE_FRAMES;
    if (shadowFrames.current > 0) {
      shadowFrames.current--;
      state.gl.shadowMap.needsUpdate = true;
    }
    // The sun swings into place and brightens at load, sweeping light across the logo.
    direction
      .copy(SUN_DIRECTION)
      .applyAxisAngle(UP, (1 - rig.intro) * INTRO_SWEEP);
    light.position.copy(SUN_TARGET).addScaledVector(direction, -SUN_DISTANCE);
    light.target.position.copy(SUN_TARGET);
    light.target.updateMatrixWorld();
    const dt = Math.min(delta, 1 / 30);
    const factor = 1 - Math.exp(-3 * dt);
    const intensity =
      target.sunIntensity * rig.exposure * (0.15 + 0.85 * rig.intro);
    light.intensity = THREE.MathUtils.damp(light.intensity, intensity, 3, dt);
    light.color.lerp(target.sun, factor);
    rig.night = THREE.MathUtils.damp(rig.night, target.night, 3, dt);
    rig.indoor = THREE.MathUtils.damp(rig.indoor, target.indoor, 3, dt);
    rig.wet = THREE.MathUtils.damp(rig.wet, target.wet, 3, dt);
    rig.environmentKey = environmentKey;
    rig.lightingSettled =
      Math.abs(rig.night - target.night) < 0.002 &&
      Math.abs(rig.indoor - target.indoor) < 0.002 &&
      Math.abs(rig.wet - target.wet) < 0.002 &&
      Math.abs(light.intensity - intensity) < 0.002;
    if (fill.current) {
      fill.current.intensity = THREE.MathUtils.damp(
        fill.current.intensity,
        target.fillIntensity * rig.exposure * (0.45 + 0.55 * rig.intro),
        3,
        dt,
      );
      fill.current.color.lerp(target.sky, factor);
      fill.current.groundColor.lerp(target.ground, factor);
    }
    if (!rig.lightingSettled) state.invalidate();
  });

  return (
    <>
      <hemisphereLight
        ref={fill}
        args={[SKY_FILL, GROUND_FILL, FILL_INTENSITY]}
      />
      <directionalLight
        ref={sun}
        color={SUN_COLOR}
        intensity={SUN_INTENSITY}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.035}
        shadow-radius={3}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-8, 8, 7, -7, 1, 46]}
        />
      </directionalLight>
    </>
  );
}
