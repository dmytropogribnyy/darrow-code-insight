// Shared auth check for /api/public/jobs/* endpoints.
// Two accepted credentials:
//   1. Authorization: Bearer <JOB_DISPATCH_SECRET>  (or x-job-secret header)
//   2. apikey: <SUPABASE_PUBLISHABLE_KEY>           (the project anon JWT — used by pg_cron)
//
// If neither matches, the request is unauthenticated.
//
// This file is the SINGLE SOURCE OF TRUTH for worker auth. Do not inline
// duplicate auth checks in route handlers — the bug we are guarding
// against is exactly that: an inlined check that drops the apikey path
// and silently breaks the cron sweeper.

export type AuthOutcome =
  | { ok: true; mode: "service_secret" | "anon_apikey" }
  | { ok: false; code: "AUTH_REQUIRED"; message: string };

export interface AuthEnv {
  JOB_DISPATCH_SECRET?: string | null;
  SUPABASE_PUBLISHABLE_KEY?: string | null;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string | null;
  SUPABASE_PROJECT_ID?: string | null;
  VITE_SUPABASE_PROJECT_ID?: string | null;
  SUPABASE_URL?: string | null;
}

function readEnv(): AuthEnv {
  return {
    JOB_DISPATCH_SECRET: process.env.JOB_DISPATCH_SECRET ?? null,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY ?? null,
    VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? null,
    SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID ?? null,
    VITE_SUPABASE_PROJECT_ID: process.env.VITE_SUPABASE_PROJECT_ID ?? null,
    SUPABASE_URL: process.env.SUPABASE_URL ?? null,
  };
}

function isProjectAnonKey(token: string, env: AuthEnv): boolean {
  if (!token.includes(".")) return false;
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    );
    const expectedRef =
      env.SUPABASE_PROJECT_ID ||
      env.VITE_SUPABASE_PROJECT_ID ||
      env.SUPABASE_URL?.match(/^https:\/\/([^.]+)\./)?.[1];
    return !!expectedRef && json?.role === "anon" && json?.ref === expectedRef;
  } catch {
    return false;
  }
}

export function checkWorkerAuth(headers: Headers, envOverride?: AuthEnv): AuthOutcome {
  const env = envOverride ?? readEnv();
  const auth = headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const xJobSecret = headers.get("x-job-secret") ?? "";
  const provided = bearer || xJobSecret;
  const apikey = headers.get("apikey") ?? "";

  // Mode 1: service secret.
  if (env.JOB_DISPATCH_SECRET && provided && provided === env.JOB_DISPATCH_SECRET) {
    return { ok: true, mode: "service_secret" };
  }

  // Mode 2: project anon JWT, either passed via apikey header (cron) or Bearer.
  const publishable = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (publishable && apikey && apikey === publishable) {
    return { ok: true, mode: "anon_apikey" };
  }
  if (apikey && isProjectAnonKey(apikey, env)) {
    return { ok: true, mode: "anon_apikey" };
  }
  if (provided && isProjectAnonKey(provided, env)) {
    return { ok: true, mode: "anon_apikey" };
  }

  return {
    ok: false,
    code: "AUTH_REQUIRED",
    message: "Missing or invalid worker credentials. Provide Authorization: Bearer <JOB_DISPATCH_SECRET> or apikey: <publishable key>.",
  };
}

export function unauthorizedResponse(outcome: Extract<AuthOutcome, { ok: false }>): Response {
  return new Response(
    JSON.stringify({ error: "unauthorized", code: outcome.code, message: outcome.message }),
    { status: 401, headers: { "content-type": "application/json" } },
  );
}
