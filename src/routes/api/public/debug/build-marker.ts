// Build marker — confirms which version of generation/diagnostic code is live.
// Increment BUILD_MARKER whenever the diagnostic pipeline or pipeline timeouts change.

import { createFileRoute } from "@tanstack/react-router";

export const BUILD_MARKER = "core-v3-split-sequential-2026-05-20-3";

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
          deployed_at_check: new Date().toISOString(),
        }),
    },
  },
});
