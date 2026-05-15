import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type PlaceSuggestion = {
  display: string;
  latitude: number;
  longitude: number;
  timezone: string;
  resolved_name: string;
  country: string | null;
};

export const searchPlaces = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      query: z.string().trim().min(2).max(120),
    }).parse,
  )
  .handler(async ({ data }): Promise<{ results: PlaceSuggestion[] }> => {
    const key = process.env.GEOAPIFY_API_KEY;
    if (!key) return { results: [] };
    const url =
      `https://api.geoapify.com/v1/geocode/autocomplete` +
      `?text=${encodeURIComponent(data.query)}&limit=6&format=json&type=city&apiKey=${key}`;
    const res = await fetch(url);
    if (!res.ok) return { results: [] };
    const json = (await res.json()) as any;
    const hits = Array.isArray(json?.results) ? json.results : [];
    const seen = new Set<string>();
    const results: PlaceSuggestion[] = [];
    for (const h of hits) {
      const lat = typeof h.lat === "number" ? h.lat : Number(h.lat);
      const lon = typeof h.lon === "number" ? h.lon : Number(h.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      const parts = [h.city || h.name, h.state, h.country].filter(Boolean);
      const display = parts.join(", ") || h.formatted || "";
      if (!display) continue;
      // Dedupe by display + coarse coordinates (Geoapify often returns city + admin boundary).
      const key = `${display.toLowerCase()}|${lat.toFixed(2)}|${lon.toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        display,
        latitude: lat,
        longitude: lon,
        timezone: h.timezone?.name ?? "UTC",
        resolved_name: h.formatted ?? display,
        country: h.country ?? null,
      });
      if (results.length >= 5) break;
    }
    return { results };
  });
