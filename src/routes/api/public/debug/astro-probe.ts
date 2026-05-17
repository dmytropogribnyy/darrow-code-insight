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

// Detect provider prose anywhere in enrichment blocks (Moon Phase, BaZi Flow).
function deepHasProse(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  if (Array.isArray(obj)) return obj.some(deepHasProse);
  const o = obj as Record<string, unknown>;
  const proseKeys = [
    "interpretation",
    "interpretations",
    "rationale",
    "advice",
    "summary_text",
    "description",
    "long_description",
    "explanation",
    "narrative",
    "ai_summary",
  ];
  for (const k of proseKeys) if (k in o) return true;
  return Object.values(o).some(deepHasProse);
}

// In-memory cooldown cache. 60s TTL. Survives within a single worker
// instance; cold starts reset it, which is acceptable for a debug route.
const PROBE_CACHE_TTL_MS = 60_000;
type ProbeCache = { at: number; body: Record<string, unknown> };
let cachedProbe: ProbeCache | null = null;

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

        const force = url.searchParams.get("force") === "1";
        if (!force && cachedProbe && Date.now() - cachedProbe.at < PROBE_CACHE_TTL_MS) {
          return Response.json({
            cached: true,
            cached_age_ms: Date.now() - cachedProbe.at,
            ...(cachedProbe.body as object),
          });
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
          const moonAvail = (data.moon_phase as any)?.available === true;
          const baziFlowAvail = (data.bazi_flow as any)?.available === true;
          const numerology = (data as any).numerology ?? null;
          const nameNum = numerology?.name_numerology ?? null;
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
            numerology: numerology
              ? {
                  life_path: numerology.life_path,
                  birth_day_number: numerology.birth_day_number,
                  personal_year: numerology.personal_year,
                  personal_year_master_marker: numerology.personal_year_master_marker,
                  name_numerology_available: !!nameNum?.available,
                  name_numerology_reason: nameNum?.reason ?? null,
                  expression: nameNum?.expression ?? null,
                  soul_urge: nameNum?.soul_urge ?? null,
                  personality: nameNum?.personality ?? null,
                  maturity: nameNum?.maturity ?? null,
                  hidden_passion_numbers: nameNum?.hidden_passion_numbers ?? null,
                  karmic_lessons: nameNum?.karmic_lessons ?? null,
                  normalized_name: nameNum?.normalized_name ?? null,
                  name_letters_used: nameNum?.name_letters_used ?? null,
                }
              : null,
            moon_phase_available: moonAvail,
            moon_phase: moonAvail
              ? {
                  phase_name: (data.moon_phase as any).phase?.name ?? null,
                  illumination: (data.moon_phase as any).phase?.illumination ?? null,
                  is_waxing: (data.moon_phase as any).phase?.is_waxing ?? null,
                  zodiac_sign: (data.moon_phase as any).zodiac?.sign ?? null,
                  is_supermoon:
                    (data.moon_phase as any).special_moon?.is_supermoon ?? null,
                  is_eclipse: (data.moon_phase as any).eclipse?.is_eclipse ?? null,
                  days_until_full_moon:
                    (data.moon_phase as any).forecast?.days_until_full_moon ?? null,
                  days_until_new_moon:
                    (data.moon_phase as any).forecast?.days_until_new_moon ?? null,
                }
              : null,
            moon_phase_has_prose: moonAvail
              ? deepHasProse((data as any).moon_phase)
              : false,
            bazi_flow_available: baziFlowAvail,
            bazi_flow: baziFlowAvail
              ? {
                  target_year: (data.bazi_flow as any).target_year ?? null,
                  annual_pillar: (data.bazi_flow as any).annual_pillar ?? null,
                  monthly_pillars_count:
                    (data.bazi_flow as any).monthly_pillars?.length ?? 0,
                  interactions_count:
                    (data.bazi_flow as any).interactions?.length ?? 0,
                  stars_count: (data.bazi_flow as any).stars?.length ?? 0,
                  time_confidence: (data.bazi_flow as any).time_confidence ?? null,
                }
              : null,
            bazi_flow_has_prose: baziFlowAvail
              ? deepHasProse((data as any).bazi_flow)
              : false,
            any_hit_429: Object.values(data.meta.endpoint_timing_ms ?? {}).some(() => false), // placeholder
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
