// Darrow Report JSON schema — both Zod (runtime) and JSON Schema (Anthropic tool).
import { z } from "zod";

export const DarrowReportSchema = z.object({
  meta: z.object({
    title: z.string().min(1).max(160),
    subtitle: z.string().min(1).max(240),
    prepared_for: z.string().min(1).max(160),
    voice_note: z.string().min(1).max(400),
  }),
  opening: z.object({
    body: z.string().min(200),
  }),
  chapters: z.array(
    z.object({
      module: z.enum(["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"]),
      title: z.string().min(1),
      sections: z.array(
        z.object({
          heading: z.string().min(1),
          body: z.string().min(80),
        })
      ).min(2),
    })
  ).min(1),
  closing: z.object({
    body: z.string().min(80),
  }),
});

export type DarrowReport = z.infer<typeof DarrowReportSchema>;

// JSON Schema mirrored for Anthropic tool input_schema.
export const darrowReportJsonSchema = {
  type: "object",
  required: ["meta", "opening", "chapters", "closing"],
  additionalProperties: false,
  properties: {
    meta: {
      type: "object",
      required: ["title", "subtitle", "prepared_for", "voice_note"],
      additionalProperties: false,
      properties: {
        title: { type: "string", minLength: 1, maxLength: 160 },
        subtitle: { type: "string", minLength: 1, maxLength: 240 },
        prepared_for: { type: "string", minLength: 1, maxLength: 160 },
        voice_note: { type: "string", minLength: 1, maxLength: 400 },
      },
    },
    opening: {
      type: "object",
      required: ["body"],
      additionalProperties: false,
      properties: { body: { type: "string", minLength: 200 } },
    },
    chapters: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["module", "title", "sections"],
        additionalProperties: false,
        properties: {
          module: { type: "string", enum: ["CORE", "LOVE", "MONEY", "BODY", "YEAR", "STYLE", "PLACE"] },
          title: { type: "string", minLength: 1 },
          sections: {
            type: "array",
            minItems: 2,
            items: {
              type: "object",
              required: ["heading", "body"],
              additionalProperties: false,
              properties: {
                heading: { type: "string", minLength: 1 },
                body: { type: "string", minLength: 80 },
              },
            },
          },
        },
      },
    },
    closing: {
      type: "object",
      required: ["body"],
      additionalProperties: false,
      properties: { body: { type: "string", minLength: 80 } },
    },
  },
} as const;
