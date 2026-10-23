"use client";

// Outside the windows: the studio sits high above a slow sea of clouds.
//
// It's rendered, not photographed, so perspective, depth and light match the
// room from every camera angle (a photo on a dome never does). Each view ray is
// intersected with a cloud layer far below the floor, which gives true
// perspective and parallax and an endless horizon with no geometry at all.
// Day, dusk, night, overcast and rain blend smoothly into one another.

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Atmosphere } from "@/lib/atmosphere";
import { SUN_DIRECTION } from "./Daylight";

/* ════════════════════════════════════════════════════════════════════════
 * Tweakable values
 * ════════════════════════════════════════════════════════════════════════ */

type Palette = {
  zenith: string; // sky overhead
  horizon: string; // the band where sky meets the cloud sea
  cloudLit: string; // cloud-sea tops facing the sun (or moon)
  cloudShade: string; // the valleys between them
  deckLit: string; // clouds overhead: thin, sunlit parts
  deckShade: string; // clouds overhead: thick undersides
  glow: string; // sun or moon glow
};

type Phase = Palette & {
  sun: number; // glow strength
  stars: number; // 0 = none, 1 = a clear night
  city: number; // warm city light glowing up through the cloud sea
  deck: number; // how much of the sky the clouds overhead cover in fair weather
};

const PHASES: Record<Atmosphere["phase"], Phase> = {
  // 4pm: a clear blue sky with a few white clouds; warmth only around the sun.
  day: {
    zenith: "#3B7BD0",
    horizon: "#C3DAF0",
    cloudLit: "#FFFFFF",
    cloudShade: "#90A5C6",
    deckLit: "#FFFFFF",
    deckShade: "#B8C6D9",
    glow: "#FFD9A4",
    sun: 1,
    stars: 0,
    city: 0,
    deck: 0.3,
  },
  // Blue hour: violet sky, peach horizon, clouds blushing pink.
  dusk: {
    zenith: "#2C3170",
    horizon: "#F4A982",
    cloudLit: "#FFC6A6",
    cloudShade: "#4B3F80",
    deckLit: "#FFB79A",
    deckShade: "#5F4E8C",
    glow: "#FFB07A",
    sun: 0.85,
    stars: 0.18,
    city: 0.25,
    deck: 0.32,
  },
  // Night: deep navy, moonlit clouds, the city glowing underneath.
  night: {
    zenith: "#060A1B",
    horizon: "#1D2442",
    cloudLit: "#6B7A9C",
    cloudShade: "#0F152A",
    deckLit: "#323D5C",
    deckShade: "#0D1224",
    glow: "#A9BCDD",
    sun: 0.22,
    stars: 1,
    city: 0.38,
    deck: 0.25,
  },
};

// Weather palettes, for daylight. Dusk and night dim and tint them.
const OVERCAST: Palette = {
  zenith: "#68737F",
  horizon: "#9AA3AD",
  cloudLit: "#AAB2BC",
  cloudShade: "#616B78",
  deckLit: "#A9B0B9",
  deckShade: "#5B6471",
  glow: "#FFF1DD",
};
const RAIN: Palette = {
  zenith: "#3A424D",
  horizon: "#67717D",
  cloudLit: "#7E8893",
  cloudShade: "#3B434E",
  deckLit: "#6E7782",
  deckShade: "#2F363F",
  glow: "#D9E1EC",
};
const WEATHER_LIGHT: Record<Atmosphere["phase"], [number, string]> = {
  day: [1, "#FFFFFF"],
  dusk: [0.58, "#FFD7C2"], // dimmer and warmer
  night: [0.12, "#7F93C2"], // nearly dark, moon-blue
};

const CITY_GLOW = "#FFB46A"; // amber, so it reads as streetlight through cloud, not pink
const CLOUD_LAYER_Y = -55; // meters below the floor (floor is y = -1.45)
const CLOUD_LAYER_Y_OVERCAST = -38; // cloud cover rises toward the windows
const CLOUD_LAYER_Y_RAIN = -20; // in rain the cloud is almost at the glass
const HAZE = 0.0011; // aerial haze per meter; higher = shorter view
const HAZE_OVERCAST = 0.0021;
const HAZE_RAIN = 0.0036;
const DRIFT: [number, number] = [2.2, 0.7]; // cloud drift, meters per second (only while rendering)

/* ════════════════════════════════════════════════════════════════════════ */

const vertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uCloudLit;
  uniform vec3 uCloudShade;
  uniform vec3 uDeckLit;
  uniform vec3 uDeckShade;
  uniform vec3 uGlow;
  uniform vec3 uCityGlow;
  uniform vec3 uToSun;
  uniform float uSun;
  uniform float uStars;
  uniform float uCity;
  uniform float uCover;
  uniform float uLayerY;
  uniform float uHaze;
  uniform float uDeckCover;
  uniform float uDeckDark;
  uniform float uOvercast;
  uniform vec2 uDrift;
  varying vec3 vWorld;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float value = 0.0, amplitude = 0.5;
    mat2 rotate = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotate * p * 2.02 + 3.1;
      amplitude *= 0.5;
    }
    return value;
  }

  // Cloud density on the layer, 0 = clear gap, 1 = thick billow.
  float clouds(vec2 p) {
    vec2 q = (p + uDrift) * 0.0052;
    vec2 warp = vec2(fbm(q * 0.45), fbm(q * 0.45 + 17.3));
    float d = fbm(q + warp * 1.3);
    // A mostly continuous blanket with gentle relief, not islands.
    return smoothstep(0.24 - uCover * 0.2, 0.74 - uCover * 0.2, d);
  }

  void main() {
    vec3 dir = normalize(vWorld - cameraPosition);
    float h = dir.y;

    // Sky: a pale band at the horizon that turns blue quickly, so the view
    // through the windows reads as blue sky, with warmth only around the sun.
    vec3 sky = mix(uHorizon, uZenith, smoothstep(-0.02, 0.34, h));
    vec2 flatDir = normalize(dir.xz + 0.0001);
    vec2 flatSun = normalize(uToSun.xz + 0.0001);
    float sunSide = pow(max(dot(flatDir, flatSun), 0.0), 5.0);
    sky = mix(sky, uGlow, sunSide * (1.0 - smoothstep(0.0, 0.28, h)) * 0.38 * uSun);

    // Clouds overhead: scattered in fair weather, a textured ceiling when
    // overcast, a dark low ceiling in rain.
    if (h > 0.0 && uDeckCover > 0.01) {
      float t = min((650.0 - cameraPosition.y) / max(h, 0.015), 14000.0);
      vec2 p = (cameraPosition + dir * t).xz * 0.0021 + uDrift * 0.004;
      vec2 warp = vec2(fbm(p * 0.6), fbm(p * 0.6 + 9.2));
      float n = fbm(p + warp * 0.9);
      float cover = smoothstep(1.0 - uDeckCover - 0.12, 1.0 - uDeckCover + 0.22, n);
      float thick = smoothstep(0.3, 0.8, n);
      vec3 deck = mix(uDeckLit, uDeckShade, thick * uDeckDark);
      // Edges facing the sun pick up a silver lining.
      float s0 = max(dot(dir, uToSun), 0.0);
      deck += uGlow * uSun * pow(s0, 10.0) * (1.0 - thick) * 0.7;
      // Far away the clouds melt into the horizon haze. Under full cover they
      // stay to lower in the sky, but still fade at the horizon itself.
      float fade = smoothstep(0.0, 0.1, h) * exp(-t * 0.00022);
      float lowFade = smoothstep(0.02, 0.09, h);
      sky = mix(sky, deck, cover * mix(fade, lowFade, uOvercast * 0.9));
    }

    // Stars on clear nights, thinning toward the horizon.
    if (uStars > 0.0 && h > 0.04) {
      vec2 cell = floor(vec2(atan(dir.z, dir.x) * 260.0, h * 420.0));
      float star = step(0.9965, hash(cell)) * hash(cell + 7.1);
      sky += vec3(0.85, 0.9, 1.0) * star * uStars * smoothstep(0.04, 0.3, h) * (1.0 - uCover);
    }

    vec3 color = sky;

    // Below the horizon: the sea of clouds.
    if (h < 0.015) {
      float down = max(-h, 0.0006);
      // Capped: far away the noise loses precision, and haze hides it anyway.
      float t = min((cameraPosition.y - uLayerY) / down, 14000.0);
      vec2 p = (cameraPosition + dir * t).xz;
      float d = clouds(p);
      // Billow shape from neighbouring samples: lit tops, shadowed sides.
      float e = 14.0;
      float dx = clouds(p + vec2(e, 0.0)) - d;
      float dz = clouds(p + vec2(0.0, e)) - d;
      vec3 normal = normalize(vec3(-dx * 4.0, 1.0, -dz * 4.0));
      vec3 light = normalize(uToSun + vec3(0.0, 0.35, 0.0));
      float lit = clamp(dot(normal, light) * 0.6 + 0.4, 0.0, 1.0);
      // Thick billow tops catch the light; thinner cloud sits in soft shade.
      vec3 cloud = mix(uCloudShade, uCloudLit * 1.08, lit * (0.35 + 0.65 * d));

      // Thin spots read as deeper mist, never as holes. At night the city
      // below lends that mist a faint warm glow.
      vec3 mist = mix(uCloudShade, uHorizon, 0.45);
      mist += uCityGlow * uCity * (0.6 + 0.4 * noise(p * 0.02)) * (1.0 - d) * 0.35;
      vec3 sea = mix(mist, cloud, smoothstep(0.0, 0.6, d));

      // Silver lining on billow edges facing the sun.
      float toward = pow(max(dot(flatDir, flatSun), 0.0), 6.0);
      sea += uGlow * uSun * toward * d * (1.0 - d) * 1.4;

      // Aerial perspective, so the sea melts into the horizon.
      float haze = 1.0 - exp(-t * uHaze);
      sea = mix(sea, uHorizon, haze);
      color = mix(sea, sky, smoothstep(-0.006, 0.015, h));
    }

    // The sun (or moon) and its glow.
    float s = max(dot(dir, uToSun), 0.0);
    color += uGlow * uSun * (1.0 - uCover * 0.85) *
      (pow(s, 1400.0) * 7.0 + pow(s, 28.0) * 0.55 + pow(s, 4.0) * 0.14);
    // Behind cloud the sun is only a soft bright patch.
    color += uGlow * pow(s, 2.5) * 0.16 * uOvercast;

    // A whisper of noise so smooth gradients (moon glow, haze) never band.
    color += (hash(gl_FragCoord.xy) - 0.5) / 160.0;
    gl_FragColor = vec4(color, 1.0);
  }
`;

type Target = {
  zenith: THREE.Color;
  horizon: THREE.Color;
  cloudLit: THREE.Color;
  cloudShade: THREE.Color;
  deckLit: THREE.Color;
  deckShade: THREE.Color;
  glow: THREE.Color;
  sun: number;
  stars: number;
  city: number;
  cover: number;
  layerY: number;
  haze: number;
  deckCover: number;
  deckDark: number;
  overcast: number;
};

const COLOR_KEYS = [
  "zenith",
  "horizon",
  "cloudLit",
  "cloudShade",
  "deckLit",
  "deckShade",
  "glow",
] as const;

function targetFor(atmosphere: Atmosphere): Target {
  const phase = PHASES[atmosphere.phase];
  const rain = atmosphere.precipitation === "rain" ? 1 : 0;
  // How far the weather has taken over: 0 = clear, 1 = fully overcast or raining.
  const weather = Math.max(
    THREE.MathUtils.smoothstep(atmosphere.cloudCover, 0.4, 0.95),
    rain,
  );
  const palette = rain ? RAIN : OVERCAST;
  const [level, tintHex] = WEATHER_LIGHT[atmosphere.phase];
  const tint = new THREE.Color(tintHex).multiplyScalar(level);
  const color = (key: (typeof COLOR_KEYS)[number]) =>
    new THREE.Color(phase[key]).lerp(
      new THREE.Color(palette[key]).multiply(tint),
      weather,
    );
  // At night a fuller blanket keeps the city glow to rare, small gaps.
  const blanket = atmosphere.phase === "night" ? 0.35 : 0;
  return {
    zenith: color("zenith"),
    horizon: color("horizon"),
    cloudLit: color("cloudLit"),
    cloudShade: color("cloudShade"),
    deckLit: color("deckLit"),
    deckShade: color("deckShade"),
    glow: color("glow"),
    sun: phase.sun * (1 - weather * 0.92),
    stars: phase.stars * (1 - weather),
    city: phase.city * (1 - weather * 0.6),
    cover: Math.max(weather * 0.8, blanket),
    layerY: THREE.MathUtils.lerp(
      CLOUD_LAYER_Y,
      rain ? CLOUD_LAYER_Y_RAIN : CLOUD_LAYER_Y_OVERCAST,
      weather,
    ),
    haze: THREE.MathUtils.lerp(HAZE, rain ? HAZE_RAIN : HAZE_OVERCAST, weather),
    deckCover: THREE.MathUtils.lerp(phase.deck, rain ? 1 : 0.95, weather),
    deckDark: THREE.MathUtils.lerp(0.25, rain ? 0.9 : 0.8, weather),
    overcast: weather,
  };
}

/** The sky and the sea of clouds outside the windows. Also lights the reflections. */
export function Exterior({ atmosphere }: { atmosphere: Atmosphere }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  const target = useMemo(() => targetFor(atmosphere), [atmosphere]);
  const [uniforms] = useState(() => ({
    uZenith: { value: target.zenith.clone() },
    uHorizon: { value: target.horizon.clone() },
    uCloudLit: { value: target.cloudLit.clone() },
    uCloudShade: { value: target.cloudShade.clone() },
    uDeckLit: { value: target.deckLit.clone() },
    uDeckShade: { value: target.deckShade.clone() },
    uGlow: { value: target.glow.clone() },
    uCityGlow: { value: new THREE.Color(CITY_GLOW) },
    uToSun: { value: SUN_DIRECTION.clone().negate() },
    uSun: { value: target.sun },
    uStars: { value: target.stars },
    uCity: { value: target.city },
    uCover: { value: target.cover },
    uLayerY: { value: target.layerY },
    uHaze: { value: target.haze },
    uDeckCover: { value: target.deckCover },
    uDeckDark: { value: target.deckDark },
    uOvercast: { value: target.overcast },
    uDrift: { value: new THREE.Vector2() },
  }));

  useEffect(() => invalidate(), [target, invalidate]);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const dt = Math.min(delta, 1 / 30);
    const factor = 1 - Math.exp(-3 * dt);
    let changing = false;
    for (const key of COLOR_KEYS) {
      const uniform = `u${key[0]!.toUpperCase()}${key.slice(1)}`;
      const value = u[uniform]!.value as THREE.Color;
      value.lerp(target[key], factor);
    }
    for (const [uniform, value] of [
      ["uSun", target.sun],
      ["uStars", target.stars],
      ["uCity", target.city],
      ["uCover", target.cover],
      ["uLayerY", target.layerY],
      ["uHaze", target.haze],
      ["uDeckCover", target.deckCover],
      ["uDeckDark", target.deckDark],
      ["uOvercast", target.overcast],
    ] as const) {
      const current = u[uniform]!.value as number;
      const next = THREE.MathUtils.lerp(current, value, factor);
      u[uniform]!.value = next;
      if (Math.abs(next - value) > Math.abs(value) * 0.002 + 0.0005)
        changing = true;
    }
    // Clouds drift only while frames are being drawn, so idle pages stay idle.
    (u.uDrift!.value as THREE.Vector2).x += DRIFT[0] * dt;
    (u.uDrift!.value as THREE.Vector2).y += DRIFT[1] * dt;
    if (changing) state.invalidate();
  });

  return (
    // Drawn after the room, so the shader only runs where the windows show it.
    <mesh position={[4, 0, 0]} scale={180} renderOrder={10}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
