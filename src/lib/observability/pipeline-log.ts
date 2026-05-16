// Structured logging for the paid-order generation pipeline.
// Emits one JSON line per stage so a single order can be traced from
// webhook → email by grepping worker logs for its order_id.

export type PipelineStage =
  | "webhook_received"
  | "job_enqueued"
  | "worker_claimed"
  | "astro_data_generated"
  | "ai_generation_started"
  | "ai_generation_completed"
  | "pdf_generated"
  | "email_sent"
  | "status_updated"
  | "alert_sent"
  | "recovery_run";

export type StageResult = "success" | "retry" | "failed" | "skipped";

export interface StageLogInput {
  order_id?: string | null;
  stripe_session_id?: string | null;
  generation_job_id?: string | null;
  stage: PipelineStage;
  duration_ms?: number | null;
  result: StageResult;
  error?: string | null;
  extra?: Record<string, unknown>;
}

export function logStage(input: StageLogInput): void {
  const payload = {
    log: "pipeline",
    ts: new Date().toISOString(),
    stage: input.stage,
    result: input.result,
    order_id: input.order_id ?? null,
    stripe_session_id: input.stripe_session_id ?? null,
    generation_job_id: input.generation_job_id ?? null,
    duration_ms: input.duration_ms ?? null,
    error: input.error ? String(input.error).slice(0, 500) : null,
    ...(input.extra ?? {}),
  };
  // Single-line JSON — easy to grep, parse, and ship to log aggregators later.
  console.log(JSON.stringify(payload));
}

/** Wrap an async step, automatically logging start (via caller) and timing/result. */
export async function timeStage<T>(
  base: Omit<StageLogInput, "duration_ms" | "result" | "error">,
  fn: () => Promise<T>,
): Promise<T> {
  const t0 = Date.now();
  try {
    const out = await fn();
    logStage({ ...base, duration_ms: Date.now() - t0, result: "success" });
    return out;
  } catch (e: any) {
    logStage({
      ...base,
      duration_ms: Date.now() - t0,
      result: "failed",
      error: e?.message ?? String(e),
    });
    throw e;
  }
}
