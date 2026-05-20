// Build marker — confirms which version of generation/diagnostic code is live.
// Increment BUILD_MARKER whenever the diagnostic pipeline or pipeline timeouts change.

import { createFileRoute } from "@tanstack/react-router";

export const BUILD_MARKER = "core-v3-1-structured-2026-05-20-4";

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
          deployed_at_check: new Date().toISOString(),
        }),
    },
  },
});
