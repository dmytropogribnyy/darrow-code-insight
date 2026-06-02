// Build marker — confirms which version of generation/diagnostic code is live.
// Increment BUILD_MARKER whenever the diagnostic pipeline or pipeline timeouts change.

import { createFileRoute } from "@tanstack/react-router";

export const BUILD_MARKER = "core-v3-1-layout-foundation-2026-06-02-2";

export const Route = createFileRoute("/api/public/debug/build-marker")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          build_marker: BUILD_MARKER,
          step_timeout_ms: 15 * 60 * 1000,
          generation_mode: "core_v3_split",
          production_split_mode: "sequential",
          diagnostic_split_modes_supported: ["sequential", "parallel"],
          diagnostic_default_split_mode: "sequential",
          diagnostic_validation: "warn_only",
          core_schema_version: "core_v3",
          core_report_version: "v3.1",
          structured_callouts: {
            sections_with_protocols: [
              "core_architecture",
              "battery",
              "social_interface",
              "numerology_code",
              "cognitive_style",
              "drive_and_rhythm",
              "professional_archetype",
              "money_and_value",
              "relationship_baseline",
              "vitality_baseline",
              "environment_and_resonance",
            ],
            sections_with_warning_signals: [
              "battery",
              "professional_archetype",
              "shadow_and_friction",
            ],
            prose_only_sections: [
              "cover_tagline",
              "orientation",
              "before_after",
              "executive_summary",
              "next_step",
            ],
          },
          word_target_range: [3800, 4600],
          word_hard_cap: 5000,
          pdf_page_soft_cap: 25,
          paper_background: "#FAF7F2",
          pdf_layout: {
            apitemplate_margins: "0 (HTML owns layout)",
            cover_closing_bleed: "full A4, no cream strip",
            body_padding:
              "22mm top, 20mm sides, 20mm bottom (stamp text top ~15.2mm; 4.8mm clearance; reduced from 26mm to prevent blank stub pages)",
            page_numbers: "stamped post-process via pdf-lib (cover + closing skipped)",
            page_break_strategy:
              "no break-inside:avoid at section level; break-inside:avoid on individual callout blocks only",
            proof_placement:
              "embedded inside last callout (warning > protocol > standalone); never a standalone trailing div",
            blank_page_prune:
              "pdf-lib text-operator scan (Tj/TJ) before stampPageNumbers; node:zlib FlateDecode; minGlyphs=3; cover+closing protected",
            overflow_protection: "global box-sizing + overflow-wrap:break-word",
          },
          quality_gate: {
            enabled: true,
            mode: "warn_only",
            heuristics: [
              "recognition_first (no opening placement-led sentence)",
              "dossier_tone (banned phrases: 'placed in the Xth house', 'Day Master is')",
              "technical_density (raw degree/orb strings outside proof tags)",
            ],
          },
          deployed_at_check: new Date().toISOString(),
        }),
    },
  },
});
