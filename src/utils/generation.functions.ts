// Generation pipeline stubs.
// PROMPT 1C will fill these in (astro-data → AI report → PDF → email).
// For now they only mark the report row so the UI can progress.

import { createClient } from "@supabase/supabase-js";

let _sb: ReturnType<typeof createClient> | null = null;
export function adminClient() {
  if (!_sb) {
    _sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _sb;
}

export async function generateAstroData(_intake_id: string) {
  // STUB — implemented in PROMPT 1C
  return { ok: true, stub: true };
}

export async function generateReport(_intake_id: string, _modules: string[]) {
  // STUB — implemented in PROMPT 1C
  return { ok: true, stub: true };
}

export async function generatePdf(_report_id: string) {
  // STUB — implemented in PROMPT 1C
  return { ok: true, stub: true };
}

export async function sendReportEmail(_report_id: string) {
  // STUB — implemented in PROMPT 1C
  return { ok: true, stub: true };
}
