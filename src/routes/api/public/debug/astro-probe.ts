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
          return Response.json({
            ok: true,
            interpretation_leak: interpretationLeak,
            bazi_size_bytes: baziSize,
            data,
          });
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
