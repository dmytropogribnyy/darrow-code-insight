// Geoapify-backed geocoding with timezone resolution.

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  timezone: string;
  resolved_name: string;
  country: string | null;
  provider: "geoapify";
}

export async function geocodeCityGeoapify(city: string): Promise<GeocodeResult | null> {
  const key = process.env.GEOAPIFY_API_KEY;
  if (!key) throw new Error("GEOAPIFY_API_KEY is not configured");
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&limit=1&format=json&apiKey=${key}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[geocode] Geoapify HTTP", res.status, body.slice(0, 300));
    return null;
  }
  const data = (await res.json()) as any;
  const hit = data?.results?.[0];
  if (!hit) {
    console.error(
      "[geocode] Geoapify no results for",
      city,
      "raw:",
      JSON.stringify(data).slice(0, 400),
    );
    return null;
  }
  const lat = typeof hit.lat === "number" ? hit.lat : Number(hit.lat);
  const lon = typeof hit.lon === "number" ? hit.lon : Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    console.error("[geocode] Geoapify hit missing lat/lon:", JSON.stringify(hit).slice(0, 400));
    return null;
  }
  return {
    latitude: lat,
    longitude: lon,
    timezone: hit.timezone?.name ?? "UTC",
    resolved_name: hit.formatted ?? [hit.city, hit.state, hit.country].filter(Boolean).join(", "),
    country: hit.country ?? null,
    provider: "geoapify",
  };
}
