// BUNDLE-B generation core — turn a material packet into a rendered per-module artifact.
//
// context (MATERIAL-PACK-1) -> staged prompt (MODULE-PROMPT-1) -> model call -> strict schema
// validation -> standalone HTML (ADDON-RENDERER-1). The model call is INJECTABLE so this is
// fully testable with a mock (no real AI). The real default only runs with ANTHROPIC_API_KEY.
// STAGED · not wired into the live pipeline. No Stripe/FreeAstroAPI.

import type { DarrowChartData } from "@/lib/astro/types";
import type { ModuleCode } from "@/lib/modules";
import {
  buildReportContextForModule,
  type ReportContext,
} from "@/lib/report-context/build-report-context";
import { buildAddonModulePrompt } from "./addon-prompt";
import { addonModuleSchema, ADDON_SECTION_KEYS, type AddonModule } from "./addon-schema";
import { renderAddonModuleHtmlSafe } from "@/lib/pdf/addon-template";

export const ADDON_DEFAULT_MODEL = "claude-sonnet-4-6";

export class AddonGenerationError extends Error {}

// Injectable model call — returns the raw tool/JSON payload (validated by us afterwards).
export type AddonModelCall = (args: { userPrompt: string; model: string }) => Promise<unknown>;

// Generates + strictly validates one add-on module from its material packet.
export async function generateAddonModule(
  module: ModuleCode,
  ctx: ReportContext,
  opts: { call: AddonModelCall; model?: string; first_name?: string | null },
): Promise<AddonModule> {
  const prompt = buildAddonModulePrompt(module, ctx, {
    first_name: opts.first_name ?? ctx.customer.first_name,
  });
  const raw = await opts.call({ userPrompt: prompt, model: opts.model ?? ADDON_DEFAULT_MODEL });
  const parsed = addonModuleSchema(module).safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).slice(0, 8);
    throw new AddonGenerationError(`Invalid ${module} add-on payload: ${issues.join("; ")}`);
  }
  return parsed.data;
}

export interface AddonArtifact {
  module: ModuleCode;
  payload: AddonModule;
  html: string;
}

// Full per-module artifact: chart -> packet -> generate -> render (standalone HTML).
export async function buildAddonArtifact(
  module: ModuleCode,
  chart: Partial<DarrowChartData>,
  opts: { call: AddonModelCall; model?: string; first_name?: string | null; clientName?: string },
): Promise<AddonArtifact> {
  const ctx = buildReportContextForModule(module, chart, { first_name: opts.first_name ?? null });
  const payload = await generateAddonModule(module, ctx, opts);
  const html = renderAddonModuleHtmlSafe(
    module,
    payload,
    opts.clientName ?? opts.first_name ?? "you",
  );
  return { module, payload, html };
}

// Real default model call (Anthropic tool_use). Only runs when ANTHROPIC_API_KEY is set;
// tests inject a mock instead. Mirrors the existing core-split tool-call shape.
export function createAnthropicAddonCall(module: ModuleCode): AddonModelCall {
  const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
  const toolName = `emit_${module.toLowerCase()}_module`;
  const inputSchema = {
    type: "object",
    required: ["schema_version", "module_code", "cover_tagline", "sections"],
    properties: {
      schema_version: { type: "string", enum: ["addon_v1"] },
      module_code: { type: "string", enum: [module] },
      cover_tagline: { type: "string" },
      sections: {
        type: "object",
        properties: Object.fromEntries(
          ADDON_SECTION_KEYS[module].map((k) => [k, { type: "object" }]),
        ),
      },
    },
  };
  return async ({ userPrompt, model }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 8000,
        temperature: 0.75,
        tools: [
          {
            name: toolName,
            description: `Emit the ${module} focused chapter as JSON.`,
            input_schema: inputSchema,
          },
        ],
        tool_choice: { type: "tool", name: toolName },
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Anthropic ${res.status} (${toolName}): ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as any;
    const tool = (data?.content ?? []).find(
      (b: any) => b?.type === "tool_use" && b?.name === toolName,
    );
    if (!tool) throw new Error(`Anthropic returned no tool_use block for ${toolName}`);
    return tool.input;
  };
}
