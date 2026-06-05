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
- **Production** secrets belong in hosting secret storage (Lovable / Supabase / Cloudflare),
  **not** in Git.

## 8 · Full secret checklist (local + production)

`.env.local` is **local-only and gitignored** — for running diagnostics / the support CLI
on your machine. **Production** values live in hosting secret storage (Lovable / Supabase /
Cloudflare), never in Git. Do not put real values in this doc; do not paste secrets in chat.

| Secret | Used for | Needed locally? | Production home |
|---|---|---|---|
| `SUPABASE_URL` | Supabase project URL | yes (ships in tracked `.env`) | Lovable/Supabase env |
| `SUPABASE_SERVICE_ROLE_KEY` | `support:report` read-only lookups (server-side) | **yes for `support:report`** — add to `.env.local` | Supabase/hosting secret |
| `ANTHROPIC_API_KEY` | AI report generation + v4 diagnostic | yes for approved diagnostic | Lovable secret |
| `RESEND_API_KEY` | report-ready / order emails (via Lovable connector) | no (prod email only) | Lovable Resend connector secret |
| `STRIPE_SECRET_KEY` | checkout / payment (server) | no | Lovable/hosting secret |
| `STRIPE_WEBHOOK_SECRET` | verify Stripe webhook signatures | no | Lovable/hosting secret |
| `JOB_DISPATCH_SECRET` | auth for internal job routes (resend / process-generation) | no | Lovable/hosting secret |
| `OPENAI_API_KEY` | **future / optional only** — no OpenAI fallback implemented | no | n/a (future) |

Rules:
- `SUPABASE_URL` is non-secret config and already in the tracked `.env`; the **service-role**
  key is a secret — keep it out of Git.
- Add only what a given local task needs (e.g. `SUPABASE_SERVICE_ROLE_KEY` for `support:report`).
- Verify ignored: `git check-ignore -v .env.local` → ignored; `git status --short` → not listed.
