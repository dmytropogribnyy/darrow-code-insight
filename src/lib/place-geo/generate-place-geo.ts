// PLACE-GEO v1 — artifact generator: geo context → prompt → model call → strict schema →
// rendered HTML (addon template with geo section keys). Returns null when the geo path is not
// usable (flag off upstream / no birth time / all API calls failed) — caller falls back to the
// resonance PLACE. No Stripe/email/Supabase.

import type { NatalInput } from "@/lib/astro/types";
import type { AddonModelCall } from "@/lib/ai/addon-modules/generate-addon";
import { renderAddonModuleHtmlSafe } from "@/lib/pdf/addon-template";
import { buildPlaceGeoContext, type PlaceGeoContext } from "./place-geo-context";
import { buildPlaceGeoPrompt } from "./place-geo-prompt";
import { placeGeoSchema, PLACE_GEO_SECTION_KEYS, PLACE_GEO_DISCLAIMER } from "./place-geo-config";

export interface PlaceGeoArtifact {
  module: "PLACE";
  variant: "geo_v1";
  payload: any;
  html: string;
  context: PlaceGeoContext;
}

export class PlaceGeoGenerationError extends Error {
  issues: string[];
  constructor(message: string, issues: string[] = []) {
    super(message);
    this.issues = issues;
  }
}

export async function buildPlaceGeoArtifact(
  apiKey: string,
  natalInput: NatalInput,
  opts: {
    call: AddonModelCall;
    model?: string;
    first_name?: string | null;
    clientName?: string;
    contextOverride?: PlaceGeoContext; // tests / replay
  },
): Promise<PlaceGeoArtifact | null> {
  const ctx = opts.contextOverride ?? (await buildPlaceGeoContext(apiKey, natalInput));
  if (!ctx.usable) {
    console.warn("[place-geo] context not usable — falling back to resonance PLACE", {
      failedCalls: ctx.failedCalls,
    });
    return null;
  }

  const prompt = buildPlaceGeoPrompt(ctx, { first_name: opts.first_name ?? null });
  const raw = await opts.call({ userPrompt: prompt, model: opts.model ?? "claude-sonnet-4-6" });
  const parsed = placeGeoSchema().safeParse(raw);
  if (!parsed.success) {
    throw new PlaceGeoGenerationError(
      "PLACE-GEO payload failed schema validation",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }

  const html = renderAddonModuleHtmlSafe(
    "PLACE",
    parsed.data as any,
    opts.clientName ?? opts.first_name ?? "you",
    {
      sectionKeys: PLACE_GEO_SECTION_KEYS,
      disclaimer: PLACE_GEO_DISCLAIMER,
      title: "Place Code · Your Geography",
    },
  );
  return { module: "PLACE", variant: "geo_v1", payload: parsed.data, html, context: ctx };
}
