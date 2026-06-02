# Darrow Code — Lovable Build Reference (v3)

Status: CURRENT. Replaces `src/lib/brand/darrowcode_lovable_prompt.md` (archived as `docs/archive/darrowcode_lovable_prompt_v1.md`).

## Active runtime

- AI prompt: `src/lib/ai/darrowcode_ai_system_prompt.md` (v3 merged, with quality examples appended inside the cacheable block).
- User prompt builder: `src/lib/ai/user-prompt.ts`.
- Schema (Zod + Anthropic tool JSON): `src/lib/ai/schema.ts` — CORE v3 (17 sections + `schema_version: "core_v3"`).
- PDF renderer (active): `renderReportHtmlSafe` in `src/lib/pdf/template.ts`. APITemplate-safe (inline CSS, no @page rules, no base64 in CSS, no header/footer).
- Legacy renderer `renderReportHtml` is deprecated and NOT wired into the pipeline.
- Astro provider: FreeAstroAPI (see `src/lib/astro/FREEASTROAPI_REFERENCE.md`).

## CORE v3 targets

- 18–20 PDF pages, 3,000–3,600 words, 17 sections.
- Section keys in order: `cover_tagline, orientation, core_architecture, battery, social_interface, numerology_code, cognitive_style, drive_and_rhythm, professional_archetype, money_and_value, relationship_baseline, vitality_baseline, environment_and_resonance, shadow_and_friction, before_after, executive_summary, next_step`.

## Add-on modules

- Legacy shape retained for runtime compatibility. v3 add-on spec lives at `src/lib/ai/darrowcode_addon_modules_spec.md` (saved, not yet wired).

## Out of scope for this migration

- Checkout, Stripe, pricing, numerology, Moon Phase / BaZi Flow, Resend email, APITemplate integration, token routes, Supabase/no-login model, purchase logic, add-on generation runtime — all unchanged.
