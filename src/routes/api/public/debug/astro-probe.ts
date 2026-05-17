// TODO: REMOVE BEFORE PRODUCTION LAUNCH
// Temporary diagnostic route for verifying FreeAstroAPI integration.
// Disabled unless ENABLE_ASTRO_DEBUG=true AND a valid secret is provided.
// Secret: ASTRO_DEBUG_SECRET or JOB_DISPATCH_SECRET (header `x-debug-secret` or `?secret=`).
import { createFileRoute } from "@tanstack/react-router";
import { getAstroProvider } from "@/lib/astro/provider";
import type { NatalInput } from "@/lib/astro/types";

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function checkSecret(provided: string | null): boolean {
  if (!provided) return false;
  const candidates = [process.env.ASTRO_DEBUG_SECRET, process.env.JOB_DISPATCH_SECRET].filter(
    (x): x is string => !!x && x.length > 0,
  );
  return candidates.some((s) => timingSafeEq(provided, s));
}

function deepHasInterpretation(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  if (Array.isArray(obj)) return obj.some(deepHasInterpretation);
  const o = obj as Record<string, unknown>;
  if ("interpretation" in o || "interpretations" in o) return true;
  return Object.values(o).some(deepHasInterpretation);
}

export const Route = createFileRoute("/api/public/debug/astro-probe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (process.env.ENABLE_ASTRO_DEBUG !== "true") {
          return new Response("disabled", { status: 404 });
        }
        const url = new URL(request.url);
        const provided =
          request.headers.get("x-debug-secret") || url.searchParams.get("secret");
        if (!checkSecret(provided)) {
          return new Response("unauthorized", { status: 401 });
        }

        const input: NatalInput = {
          date_of_birth: "1990-05-15",
          birth_time: "10:00:00",
          birth_time_known: true,
          latitude: 48.1486,
          longitude: 17.1077,
          timezone: "Europe/Bratislava",
          full_name_for_numerology: "Alex Morgan",
          first_name: "Alex",
          bazi_sex: "M",
          birth_city: "Bratislava, Slovakia",
        };

        try {
          const provider = await getAstroProvider();
          const data = await provider.computeNatal(input);
          const interpretationLeak = deepHasInterpretation(data);
          const baziSize = JSON.stringify(data.bazi ?? {}).length;
          const natal = data.natal;
          const ascSign = natal.ascendant?.sign ?? null;
          const h1Sign = natal.houses?.[0]?.sign ?? null;
          const mcSign = natal.midheaven?.sign ?? null;
          const h10Sign = natal.houses?.[9]?.sign ?? null;
          const transitsAvail = (data.transits as any)?.available === true;
          const transitsAspects = transitsAvail ? (data.transits as any).aspects ?? [] : [];
          const highPriority = transitsAspects
            .filter((a: any) => a.high_priority === true)
            .slice(0, 5);
          const baziAvail = (data.bazi as any)?.available === true;
          const solarAvail = (data.solar_return as any)?.available === true;
          const summary = {
            provider_name: data.meta.provider_name,
            endpoint_timing_ms: data.meta.endpoint_timing_ms ?? {},
            endpoint_errors: data.meta.endpoint_errors ?? {},
            natal_planets_count: natal.planets?.length ?? 0,
            houses_count: natal.houses?.length ?? 0,
            asc_h1_match: ascSign != null && h1Sign != null && ascSign === h1Sign,
            asc_sign: ascSign,
            h1_sign: h1Sign,
            mc_h10_match: mcSign != null && h10Sign != null && mcSign === h10Sign,
            mc_sign: mcSign,
            h10_sign: h10Sign,
            bazi_available: baziAvail,
            bazi_day_master: baziAvail ? (data.bazi as any).day_master ?? null : null,
            current_luck_cycle: baziAvail ? (data.bazi as any).current_luck_cycle ?? null : null,
            transits_available: transitsAvail,
            transits_aspects_count: transitsAspects.length,
            high_priority_examples: highPriority,
            solar_return_available: solarAvail,
            solar_return_sr_asc: solarAvail
              ? (data.solar_return as any).angles_details?.asc ?? null
              : null,
            interpretation_leak: interpretationLeak,
            bazi_size_bytes: baziSize,
          };
          return Response.json({ ok: true, summary, data });
        } catch (e: any) {
          return Response.json(
            { ok: false, error: String(e?.message ?? e) },
            { status: 500 },
          );
        }
      },
    },
  },
});
