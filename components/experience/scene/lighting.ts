import * as THREE from "three";
import type { Atmosphere } from "@/lib/atmosphere";

export function lightingFor(atmosphere: Atmosphere) {
  const night = atmosphere.phase === "night";
  const dusk = atmosphere.phase === "dusk";
  const overcast = THREE.MathUtils.smoothstep(
    atmosphere.cloudCover,
    0.45,
    0.98,
  );
  return {
    sun: new THREE.Color(night ? "#BCCBDD" : dusk ? "#FFD0A1" : "#FFE0B4"),
    sky: new THREE.Color(night ? "#AFBED0" : dusk ? "#CBD0E2" : "#E1E7EF"),
    ground: new THREE.Color(night ? "#B4A99A" : "#BBA58F"),
    // At night, practical room lights provide the illumination; no fake moon spotlight.
    sunIntensity: (night ? 0.015 : dusk ? 1.15 : 3.1) * (1 - overcast * 0.96),
    fillIntensity: night ? 0.3 : dusk ? 0.55 : 0.84,
    indoor: night ? 1 : dusk ? 0.55 : overcast * 0.45,
    night: night ? 1 : 0,
    wet: atmosphere.precipitation === "rain" ? 1 : 0,
  };
}
