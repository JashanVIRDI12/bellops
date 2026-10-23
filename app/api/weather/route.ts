import { weatherKind } from "@/lib/atmosphere";

type ForecastStep = {
  time: string;
  data: {
    instant: {
      details: { air_temperature: number; cloud_area_fraction: number };
    };
    next_1_hours?: { summary: { symbol_code: string } };
    next_6_hours?: { summary: { symbol_code: string } };
  };
};

type Forecast = {
  properties: { meta: { updated_at: string }; timeseries: ForecastStep[] };
};

/** A cached forecast older than this is fetched again before it's used. */
const MAX_FORECAST_AGE = 3 * 60 * 60 * 1000;

/**
 * MET Norway's forecast for a point. Cached for an hour, but a cache that sat
 * idle can hand back a much older copy once while it refreshes in the
 * background, so an old one is replaced straight away.
 */
async function loadForecast(url: URL) {
  const request = (fresh: boolean) =>
    fetch(url, {
      headers: {
        "User-Agent": "BellOps/1.0 (https://bellops.in)",
        Accept: "application/json",
      },
      ...(fresh
        ? { cache: "no-store" as const }
        : { next: { revalidate: 3600 } }),
      signal: AbortSignal.timeout(8000),
    });
  let response = await request(false);
  if (!response.ok) throw new Error("Weather provider unavailable");
  const cached = (await response.json()) as Forecast;
  const age = Date.now() - Date.parse(cached.properties?.meta?.updated_at);
  if (!(age > MAX_FORECAST_AGE)) return cached;
  try {
    response = await request(true);
    if (response.ok) return (await response.json()) as Forecast;
  } catch {
    /* the older copy is still better than none */
  }
  return cached;
}

const PRIVATE_IP =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|::ffff:127\.|f[cd][0-9a-f]{2}:|fe80:)/i;

/**
 * Coarse, city-level location from the visitor's IP via GeoJS (free, no key),
 * for hosts that don't add location headers. On a private or local address
 * (local development), GeoJS sees this machine's own public connection,
 * which is the visitor's too.
 */
async function locateByIp(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "";
  const lookup =
    !ip || PRIVATE_IP.test(ip)
      ? "https://get.geojs.io/v1/ip/geo.json"
      : `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`;
  try {
    const response = await fetch(lookup, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    const place = (await response.json()) as {
      latitude?: string;
      longitude?: string;
      city?: string;
    };
    if (!place.latitude || !place.longitude) return null;
    return { lat: place.latitude, lon: place.longitude, city: place.city };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  let lat = url.searchParams.get("lat");
  let lon = url.searchParams.get("lon");
  const automaticLocation = lat === null && lon === null;
  let location: string | undefined;

  // On Vercel, coarse edge geolocation matches the weather without a prompt.
  // Elsewhere (and locally), fall back to an IP lookup. If both fail, the
  // scene keeps following the visitor's clock.
  if (lat === null && lon === null) {
    if (process.env.VERCEL === "1") {
      lat = request.headers.get("x-vercel-ip-latitude");
      lon = request.headers.get("x-vercel-ip-longitude");
      const city = request.headers.get("x-vercel-ip-city");
      if (city) {
        try {
          location = decodeURIComponent(city);
        } catch {
          /* use a neutral label */
        }
      }
    }
    if (lat === null || lon === null) {
      const place = await locateByIp(request);
      if (place) {
        lat = place.lat;
        lon = place.lon;
        location = place.city || undefined;
      }
    }
    if (lat === null || lon === null) {
      return new Response(null, {
        status: 204,
        headers: { "Cache-Control": "no-store" },
      });
    }
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  if (
    !lat?.trim() ||
    !lon?.trim() ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return Response.json(
      { error: "Choose a valid location." },
      { status: 400 },
    );
  }

  // Round to a weather-sized grid and cache forecasts for an hour.
  const roundedLat = Math.round(latitude * 100) / 100;
  const roundedLon = Math.round(longitude * 100) / 100;
  const forecastUrl = new URL(
    "https://api.met.no/weatherapi/locationforecast/2.0/compact",
  );
  forecastUrl.searchParams.set("lat", String(roundedLat));
  forecastUrl.searchParams.set("lon", String(roundedLon));

  try {
    const forecast = await loadForecast(forecastUrl);
    const now = Date.now();
    const step = forecast.properties.timeseries.reduce<ForecastStep | null>(
      (nearest, item) =>
        !nearest ||
        Math.abs(Date.parse(item.time) - now) <
          Math.abs(Date.parse(nearest.time) - now)
          ? item
          : nearest,
      null,
    );
    if (
      !step ||
      !Number.isFinite(Date.parse(step.time)) ||
      Math.abs(Date.parse(step.time) - now) > 3 * 60 * 60 * 1000
    )
      throw new Error("Forecast is stale");
    const { air_temperature: temperature, cloud_area_fraction: clouds } =
      step.data.instant.details;
    if (!Number.isFinite(temperature) || !Number.isFinite(clouds))
      throw new Error("Incomplete forecast");
    const cloudCover = Math.min(1, Math.max(0, clouds / 100));
    const symbol =
      step.data.next_1_hours?.summary.symbol_code ??
      step.data.next_6_hours?.summary.symbol_code ??
      "";
    return Response.json(
      {
        latitude: roundedLat,
        longitude: roundedLon,
        location,
        temperature,
        cloudCover,
        condition: weatherKind(symbol, cloudCover),
        forecastAt: step.time,
        updatedAt: forecast.properties.meta.updated_at,
      },
      {
        headers: {
          "Cache-Control": automaticLocation
            ? "private, no-store"
            : "public, max-age=600, s-maxage=1200, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    // The area is still worth having: the page times day and night by the
    // sun there, even without a forecast.
    return Response.json(
      {
        error: "Weather is unavailable. Local time is still active.",
        latitude: roundedLat,
        longitude: roundedLon,
        location,
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
