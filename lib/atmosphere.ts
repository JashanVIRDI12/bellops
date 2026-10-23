import { getPosition } from "suncalc";

export const sceneModes = [
  "auto",
  "day",
  "dusk",
  "night",
  "overcast",
  "rain",
] as const;
export type SceneMode = (typeof sceneModes)[number];
export type ScenePhase = "day" | "dusk" | "night";
export type StillMood = "day" | "dusk" | "night" | "overcast" | "rain";
export type WeatherKind = "clear" | "cloudy" | "rain" | "snow" | "fog";

export type SceneLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

export type WeatherReading = {
  latitude: number;
  longitude: number;
  temperature: number;
  cloudCover: number;
  condition: WeatherKind;
  forecastAt: string;
  updatedAt: string;
  location?: string;
};

export type Atmosphere = {
  phase: ScenePhase;
  cloudCover: number;
  precipitation: "none" | "rain" | "snow";
  still: StillMood;
};

export const defaultAtmosphere: Atmosphere = {
  phase: "day",
  cloudCover: 0.3,
  precipitation: "none",
  still: "day",
};

export function resolveAtmosphere(
  date: Date,
  mode: SceneMode,
  location: SceneLocation | null,
  weather: WeatherReading | null,
): Atmosphere {
  let phase: ScenePhase;
  if (location) {
    // SunCalc v2 returns degrees and handles polar day/night as well as Delhi.
    const altitude = getPosition(
      date,
      location.latitude,
      location.longitude,
    ).altitude;
    phase = altitude < -6 ? "night" : altitude < 6 ? "dusk" : "day";
  } else {
    const hour = date.getHours() + date.getMinutes() / 60;
    phase =
      hour < 6 || hour >= 19
        ? "night"
        : hour < 8 || hour >= 17
          ? "dusk"
          : "day";
  }

  if (mode !== "auto") {
    return {
      phase: mode === "night" ? "night" : mode === "dusk" ? "dusk" : "day",
      cloudCover:
        mode === "rain"
          ? 0.98
          : mode === "overcast"
            ? 0.92
            : mode === "night"
              ? 0.18
              : 0.3,
      precipitation: mode === "rain" ? "rain" : "none",
      still: mode,
    };
  }

  const cloudCover =
    weather?.condition === "fog"
      ? Math.max(0.92, weather.cloudCover)
      : (weather?.cloudCover ?? 0.3);
  const precipitation =
    weather?.condition === "rain" || weather?.condition === "snow"
      ? weather.condition
      : "none";
  return {
    phase,
    cloudCover,
    precipitation,
    still:
      phase === "night"
        ? "night"
        : precipitation === "rain"
          ? "rain"
          : cloudCover > 0.7 ||
              weather?.condition === "fog" ||
              precipitation === "snow"
            ? "overcast"
            : phase === "dusk"
              ? "dusk"
              : "day",
  };
}

export function weatherKind(symbol: string, cloudCover: number): WeatherKind {
  if (/snow|sleet/.test(symbol)) return "snow";
  if (/rain|thunder/.test(symbol)) return "rain";
  if (/fog/.test(symbol)) return "fog";
  return cloudCover > 0.55 ? "cloudy" : "clear";
}
