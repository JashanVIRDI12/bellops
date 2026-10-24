"use client";

// The studio's time of day and weather, chosen automatically for each visitor:
// - Time: their device clock, or the sun's real altitude once their area is known.
// - Area: a coarse, IP-based city from /api/weather (no prompt). If the visitor
//   already granted this site their location before, that is used instead.
//   An IP-based area that disagrees with the device's clock (a VPN, a roaming
//   SIM) is ignored, and the scene follows the clock.
// - Weather: MET Norway's forecast for that area, refreshed every 30 minutes
//   (retried after 5 if it fails; the last good reading stays meanwhile).
// `?scene=day|dusk|night|overcast|rain` forces a mood, for previews and stills.

import { useSyncExternalStore } from "react";
import {
  defaultAtmosphere,
  resolveAtmosphere,
  sceneModes,
  type Atmosphere,
  type SceneLocation,
  type SceneMode,
  type WeatherReading,
} from "@/lib/atmosphere";

type EnvironmentState = {
  mode: SceneMode;
  atmosphere: Atmosphere;
  location: SceneLocation | null;
  weather: WeatherReading | null;
  /** The first weather lookup has finished, with or without a result. */
  settled: boolean;
};

const WEATHER_REFRESH = 30 * 60 * 1000;
const WEATHER_RETRY = 5 * 60 * 1000;
const WEATHER_TIMEOUT = 12000;
/** Hours an area's sun time may differ from the device's clock time zone. Real
 *  time zones stray up to ~3 hours from sun time (western China, Spain). */
const MAX_CLOCK_GAP = 3.5;

const initialState: EnvironmentState = {
  mode: "auto",
  atmosphere: defaultAtmosphere,
  location: null,
  weather: null,
  settled: false,
};

/** A `?scene=` preview mood in the address, if any. */
function previewMode(): SceneMode | null {
  const preview = new URL(window.location.href).searchParams.get("scene");
  return sceneModes.includes(preview as SceneMode)
    ? (preview as SceneMode)
    : null;
}

// The server renders the default mood (it can't know the visitor's clock);
// in the browser the store starts from the device clock straight away, so the
// first image asked for after hydration is already the right one.
let state: EnvironmentState =
  typeof window === "undefined"
    ? initialState
    : (() => {
        const mode = previewMode() ?? "auto";
        return {
          ...initialState,
          mode,
          atmosphere: resolveAtmosphere(new Date(), mode, null, null),
        };
      })();
let initialized = false;
let nextWeatherAt = 0;
let pending = false;
let controller: AbortController | null = null;
let timer: number | null = null;
const listeners = new Set<() => void>();

const sameAtmosphere = (a: Atmosphere, b: Atmosphere) =>
  a.phase === b.phase &&
  a.cloudCover === b.cloudCover &&
  a.precipitation === b.precipitation &&
  a.still === b.still;

/** Applies a change and re-reads the clock. Listeners hear only real changes. */
function update(patch: Partial<EnvironmentState> = {}) {
  const next = { ...state, ...patch };
  const atmosphere = resolveAtmosphere(
    new Date(),
    next.mode,
    next.location,
    next.weather,
  );
  const sameSky = sameAtmosphere(atmosphere, state.atmosphere);
  if (sameSky && Object.keys(patch).length === 0) return;
  // Keep the same object while nothing changed, so the scene doesn't redo work.
  state = { ...next, atmosphere: sameSky ? state.atmosphere : atmosphere };
  listeners.forEach((listener) => listener());
}

/** Whether a place's sun time roughly matches the device's clock. */
function matchesClock(longitude: number) {
  const device = -new Date().getTimezoneOffset() / 60;
  const gap = Math.abs(device - longitude / 15) % 24;
  return Math.min(gap, 24 - gap) <= MAX_CLOCK_GAP;
}

const isCoordinate = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/**
 * Fetches the forecast. With no location, the server works out the visitor's
 * area from their IP address, and sends it back even when the forecast fails.
 */
async function requestWeather(location: SceneLocation | null) {
  controller?.abort();
  const request = new AbortController();
  controller = request;
  pending = true;
  nextWeatherAt = Date.now() + WEATHER_RETRY; // brought forward only on success
  const timeout = window.setTimeout(() => request.abort(), WEATHER_TIMEOUT);
  const query = location
    ? `?lat=${Math.round(location.latitude * 100) / 100}&lon=${Math.round(location.longitude * 100) / 100}`
    : "";
  try {
    const response = await fetch(`/api/weather${query}`, {
      signal: request.signal,
    });
    // 204: the area couldn't be worked out; the scene keeps following the clock.
    if (response.status === 204) {
      nextWeatherAt = Date.now() + WEATHER_REFRESH;
      return;
    }
    const reading = (await response.json()) as Partial<WeatherReading>;
    if (request.signal.aborted) return;

    let area = location;
    if (!area) {
      const { latitude, longitude } = reading;
      if (!isCoordinate(latitude) || !isCoordinate(longitude)) return;
      if (!matchesClock(longitude)) {
        // Somewhere else entirely: its weather and daylight don't apply.
        nextWeatherAt = Date.now() + WEATHER_REFRESH;
        return;
      }
      area = { name: reading.location || "Near you", latitude, longitude };
    }

    const forecast =
      response.ok &&
      isCoordinate(reading.temperature) &&
      isCoordinate(reading.cloudCover)
        ? (reading as WeatherReading)
        : null;
    if (forecast) nextWeatherAt = Date.now() + WEATHER_REFRESH;
    // Without a new forecast, keep the last one: it's still the best guess.
    update({ location: area, weather: forecast ?? state.weather });
  } catch {
    // Offline or blocked: time of day still drives the scene.
  } finally {
    window.clearTimeout(timeout);
    // A request replaced by a newer one (a precise location) leaves it to that one.
    if (controller === request) {
      pending = false;
      if (!state.settled) update({ settled: true });
    }
  }
}

/** Uses a precise location only if this site was already granted it; never prompts. */
async function applyGrantedLocation() {
  try {
    const permission = await navigator.permissions?.query({
      name: "geolocation",
    });
    if (permission?.state !== "granted") return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        void requestWeather({
          name: "Your location",
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      () => {},
      {
        enableHighAccuracy: false,
        maximumAge: WEATHER_REFRESH,
        timeout: 10000,
      },
    );
  } catch {
    /* permissions API unavailable: the IP-based area is enough */
  }
}

function tick() {
  if (document.visibilityState === "hidden") return;
  update();
  if (state.mode === "auto" && !pending && Date.now() >= nextWeatherAt) {
    void requestWeather(state.location);
  }
}

function initialize() {
  if (!listeners.size) return;
  if (initialized) {
    tick();
    return;
  }
  initialized = true;
  const preview = previewMode();
  if (preview) {
    update({ mode: preview, settled: true });
    return;
  }
  update();
  void requestWeather(null);
  void applyGrantedLocation();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    queueMicrotask(initialize);
    timer = window.setInterval(tick, 60000);
    document.addEventListener("visibilitychange", tick);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", tick);
    }
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => initialState;

/** For code outside React (the start-up loader). */
export { getSnapshot as getEnvironment, subscribe as subscribeEnvironment };
export const useEnvironment = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
