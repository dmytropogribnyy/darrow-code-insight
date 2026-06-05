# Local Secrets

Local-only API keys for the manual CORE v4 diagnostic CLI (and future provider work).
**Real keys live only in `.env.local`, which is gitignored — never commit them.**

## 1 · Purpose

Keep your local Anthropic (and optional OpenAI) keys in the project so the diagnostic
CLI can run, without ever putting real secrets in Git.

## 2 · Current AI provider status

- **Anthropic** is the provider used by the B5.2 / B5.3 diagnostic CLI.
- Default diagnostic model: **`claude-sonnet-4-6`** (override with `CORE_V4_MODEL`).
- **OpenAI is optional/future only** — no OpenAI / GPT fallback is implemented yet.
  `OPENAI_API_KEY` may be set for later work but does nothing today.

## 3 · Create your local `.env.local`

Copy `.env.example` → `.env.local` and fill in real values:

```bash
ANTHROPIC_API_KEY=<your-anthropic-key>   # your real key
OPENAI_API_KEY=                          # optional, future only
CORE_V4_MODEL=claude-sonnet-4-6
```

## 4 · Verify it is ignored (never staged)

```bash
git check-ignore -v .env.local        # prints the matching ignore rule → ignored
git status --short                    # .env.local must NOT appear
```

## 5 · Run the diagnostic — plan-only (no AI, default)

```bash
npm run diagnostic:core-v4
```

## 6 · Run an approved Anthropic diagnostic (uses tokens)

```bash
CORE_V4_APPROVE_AI=1 CORE_V4_RENDER=html,pdf npm run diagnostic:core-v4
```

> Vitest (the CLI runner) does **not** auto-load `.env.local`. Provide the key to the
> command via your shell session, e.g. export it first or pass it inline for the run.
> Re-render an existing JSON with no AI call: `CORE_V4_FROM_JSON=<path> ...`.

## 7 · Safety

- Never commit `.env.local` (or any file with real keys).
- Never paste API keys into docs, tests, or commit messages.
- Rotate a key immediately if it is ever exposed (e.g. shared in chat).
- **Production** secrets belong in hosting secret storage (Cloudflare Workers
  `wrangler secret` / Lovable), **not** in Git.
