// B5.3-S — local secrets hygiene checks.
//
// Verifies the env-secret guardrails are in place and that no real API key has
// leaked into tracked source/docs/tests. Needle prefixes are built by string
// concatenation so this test file does not match itself.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const read = (p: string) => readFileSync(join(repoRoot, p), "utf8");

// Real-key prefixes, assembled so the literal never appears in this file.
const ANTHROPIC_KEY_PREFIX = "sk-" + "ant-api";
const OPENAI_PROJ_PREFIX = "sk-" + "proj-";
const ANTHROPIC_ASSIGN = "ANTHROPIC_API_KEY=" + "sk-";
const OPENAI_ASSIGN = "OPENAI_API_KEY=" + "sk-";
const NEEDLES = [ANTHROPIC_KEY_PREFIX, OPENAI_PROJ_PREFIX, ANTHROPIC_ASSIGN, OPENAI_ASSIGN];

describe("B5.3-S — .env.example is a placeholder template", () => {
  const example = read(".env.example");

  it(".env.example exists and names the keys", () => {
    expect(example).toContain("ANTHROPIC_API_KEY=");
    expect(example).toContain("OPENAI_API_KEY=");
    expect(example).toContain("CORE_V4_MODEL=claude-sonnet-4-6");
  });

  it(".env.example contains NO real key values", () => {
    for (const n of NEEDLES) expect(example).not.toContain(n);
  });
});

describe("B5.3-S — .gitignore protects local env files", () => {
  const gi = read(".gitignore");
  for (const rule of [".env.local", ".env.*.local", "*.env", "!.env.example"]) {
    it(`.gitignore includes ${rule}`, () => {
      expect(gi).toContain(rule);
    });
  }
});

describe("B5.3-S — no real secrets in tracked source/docs", () => {
  // Recursively collect text files under a dir, skipping heavy/ignored paths.
  const SKIP = new Set(["node_modules", "outputs", ".git", "dist", ".wrangler", ".tanstack"]);
  function walk(dir: string, acc: string[] = []): string[] {
    let entries: string[] = [];
    try {
      entries = readdirSync(join(repoRoot, dir));
    } catch {
      return acc;
    }
    for (const name of entries) {
      if (SKIP.has(name)) continue;
      const rel = join(dir, name);
      const st = statSync(join(repoRoot, rel));
      if (st.isDirectory()) walk(rel, acc);
      else if (/\.(ts|tsx|js|mjs|md|json|txt)$/.test(name)) acc.push(rel);
    }
    return acc;
  }

  it("no tracked file under src/ or docs/ contains a real key prefix", () => {
    const thisFile = "secrets-hygiene.test.ts";
    const files = [...walk("src"), ...walk("docs")];
    const offenders: string[] = [];
    for (const f of files) {
      if (f.endsWith(thisFile)) continue; // skip self (holds the needle parts)
      const text = read(f);
      for (const n of NEEDLES) {
        if (text.includes(n)) offenders.push(`${f} :: ${n}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

// Sanity: the example file is present at the repo root (not accidentally ignored away).
it("B5.3-S — .env.example file is present on disk", () => {
  expect(existsSync(join(repoRoot, ".env.example"))).toBe(true);
});
