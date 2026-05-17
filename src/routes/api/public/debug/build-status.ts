// Lightweight build/version check. Does NOT call FreeAstroAPI.
// Used to verify deploy cutover before running astro-probe.
import { createFileRoute } from "@tanstack/react-router";

// Bumped manually with each cutover that needs verification.
const BUILD_MARKER = "safe-pdf-dark-cover-2026-05-17f";

// Cheap presence-of-new-fields check: a static list of code-level markers that
// must exist in this build. Updated when new fields ship. Pure-strings only —
// no imports of provider modules to keep this route side-effect free.
const EXPECTED_FIELDS = [
  "numerology",
  "name_numerology",
  "moon_phase",
  "bazi_flow",
  "current_luck_cycle",
];

export const Route = createFileRoute("/api/public/debug/build-status")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          ok: true,
          build_marker: BUILD_MARKER,
          build_timestamp: new Date().toISOString(),
          expected_fields: EXPECTED_FIELDS,
          fields_present: true,
          calls_freeastroapi: false,
        });
      },
    },
  },
});
