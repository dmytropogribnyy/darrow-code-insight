// CONTINUUM generation core — context -> prompt -> model -> continuum_v1 schema -> render.
// Injectable model call (testable with a mock; real default key-guarded). STAGED · not production.

import type { DarrowChartData } from "@/lib/astro/types";
import type { AddonModelCall } from "@/lib/ai/addon-modules/generate-addon";
import { buildContinuumContext, type ContinuumContext } from "./continuum-context";
import { buildContinuumPrompt } from "./continuum-prompt";
import { continuumSchema, CONTINUUM_SECTION_KEYS, type ContinuumPayload } from "./continuum-schema";
import { renderContinuumHtmlSafe } from "./continuum-template";
import { type ContinuumType } from "./continuum-config";

export const CONTINUUM_DEFAULT_MODEL = "claude-sonnet-4-6";
export class ContinuumGenerationError extends Error {}

export async function generateContinuum(
  ctx: ContinuumContext,
  opts: { call: AddonModelCall; model?: string; first_name?: string | null },
): Promise<ContinuumPayload> {
  const prompt = buildContinuumPrompt(ctx, {
    first_name: opts.first_name ?? ctx.customer.first_name,
  });
  const raw = await opts.call({ userPrompt: prompt, model: opts.model ?? CONTINUUM_DEFAULT_MODEL });
  const parsed = continuumSchema(ctx.type).safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).slice(0, 8);
    throw new ContinuumGenerationError(
      `Invalid CONTINUUM ${ctx.type} payload: ${issues.join("; ")}`,
    );
  }
  return parsed.data;
}

export interface ContinuumArtifact {
  type: ContinuumType;
  payload: ContinuumPayload;
  html: string;
  period: ContinuumContext["period"];
}

export async function buildContinuumArtifact(
  type: ContinuumType,
  chart: Partial<DarrowChartData>,
  opts: {
    call: AddonModelCall;
    generatedAt: Date;
    model?: string;
    first_name?: string | null;
    clientName?: string;
  },
): Promise<ContinuumArtifact> {
  const ctx = buildContinuumContext(type, chart, {
    generatedAt: opts.generatedAt,
    first_name: opts.first_name ?? null,
  });
  const payload = await generateContinuum(ctx, opts);
  const html = renderContinuumHtmlSafe(
    type,
    payload,
    ctx.period,
    opts.clientName ?? opts.first_name ?? "you",
  );
  return { type, payload, html, period: ctx.period };
}

// Real default model call (Anthropic tool_use), key-guarded. Tests inject a mock.
export function createAnthropicContinuumCall(type: ContinuumType): AddonModelCall {
  const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
  const toolName = `emit_continuum_${type}`;
  const sectionSchema = {
    type: "object",
    required: ["prose"],
    properties: {
      opening_line: { type: "string", maxLength: 280 },
      scenario: { type: "string" },
      prose: { type: "string" },
      key_insight: { type: "string" },
      protocols: {
        type: "array",
        items: {
          type: "object",
          required: ["title", "body"],
          properties: { title: { type: "string" }, body: { type: "string" } },
        },
      },
      warning_signals: { type: "array", items: { type: "string" } },
      proof_tags: { type: "array", items: { type: "string" }, maxItems: 5 },
    },
  };
  const inputSchema = {
    type: "object",
    required: ["schema_version", "continuum_type", "cover_tagline", "sections"],
    properties: {
      schema_version: { type: "string", enum: ["continuum_v1"] },
      continuum_type: { type: "string", enum: [type] },
      cover_tagline: { type: "string" },
      sections: {
        type: "object",
        required: CONTINUUM_SECTION_KEYS[type],
        properties: Object.fromEntries(CONTINUUM_SECTION_KEYS[type].map((k) => [k, sectionSchema])),
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
            description: `Emit the CONTINUUM ${type} timing brief as JSON.`,
            input_schema: inputSchema,
          },
        ],
        tool_choice: { type: "tool", name: toolName },
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok)
      throw new Error(
        `Anthropic ${res.status} (${toolName}): ${(await res.text().catch(() => "")).slice(0, 300)}`,
      );
    const data = (await res.json()) as any;
    const tool = (data?.content ?? []).find(
      (b: any) => b?.type === "tool_use" && b?.name === toolName,
    );
    if (!tool) throw new Error(`Anthropic returned no tool_use block for ${toolName}`);
    return tool.input;
  };
}
