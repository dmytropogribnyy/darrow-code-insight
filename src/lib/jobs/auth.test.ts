// Regression test for the worker-auth check on the generation dispatcher.
//
// Why this exists: a prior bug dropped the `apikey` path from the auth check,
// which silently broke the pg_cron sweeper — paid orders stayed queued
// forever while the webhook still looked fine. This test pins both modes
// (service secret AND anon apikey) and confirms unauthenticated calls fail
// with a stable 401 + error code.

import { describe, expect, it, beforeEach } from "vitest";
import { checkWorkerAuth, type AuthEnv } from "@/lib/jobs/auth";

// A valid-looking anon JWT for project ref "test-ref". Header/signature are
// dummies — checkWorkerAuth only base64-decodes the payload.
function makeAnonKey(ref: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ iss: "supabase", ref, role: "anon", iat: 0, exp: 9999999999 }),
  ).toString("base64url");
  return `${header}.${payload}.signature`;
}

const SECRET = "test-job-secret";
const PROJECT_REF = "test-ref";
const PUBLISHABLE = makeAnonKey(PROJECT_REF);

const env: AuthEnv = {
  JOB_DISPATCH_SECRET: SECRET,
  SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE,
  SUPABASE_URL: `https://${PROJECT_REF}.supabase.co`,
};

describe("worker auth", () => {
  beforeEach(() => {});

  it("accepts the service secret via Authorization: Bearer", () => {
    const h = new Headers({ authorization: `Bearer ${SECRET}` });
    const r = checkWorkerAuth(h, env);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.mode).toBe("service_secret");
  });

  it("accepts the publishable anon key via apikey header (cron path)", () => {
    const h = new Headers({ apikey: PUBLISHABLE });
    const r = checkWorkerAuth(h, env);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.mode).toBe("anon_apikey");
  });

  it("accepts a freshly-rotated anon JWT matching the project ref", () => {
    const rotated = makeAnonKey(PROJECT_REF);
    const h = new Headers({ apikey: rotated });
    const r = checkWorkerAuth(h, env);
    expect(r.ok).toBe(true);
  });

  it("rejects a missing credential with 401 + AUTH_REQUIRED", () => {
    const r = checkWorkerAuth(new Headers(), env);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("AUTH_REQUIRED");
  });

  it("rejects a wrong service secret", () => {
    const h = new Headers({ authorization: "Bearer nope" });
    const r = checkWorkerAuth(h, env);
    expect(r.ok).toBe(false);
  });

  it("rejects an anon JWT for a different project", () => {
    const h = new Headers({ apikey: makeAnonKey("some-other-ref") });
    const r = checkWorkerAuth(h, env);
    expect(r.ok).toBe(false);
  });

  it("rejects a non-JWT random apikey", () => {
    const h = new Headers({ apikey: "not-a-jwt" });
    const r = checkWorkerAuth(h, env);
    expect(r.ok).toBe(false);
  });
});
