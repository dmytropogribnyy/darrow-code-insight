# Darrow Code — Domain Public QA Report

**Date:** 2026-06-03
**Phase:** FAQ-PRICING-COPY-FIX + DOMAIN-PUBLISH-QA
**Current commit:** `330900b`

---

## 1. Files changed this session

| File | Change |
|---|---|
| `src/components/FaqBlock.tsx` | FAQ savings wording — replaced `save $X vs $Y` with `regular separate price $Y · you save $X` for all 10 bundle rows |

No pricing logic, Stripe, checkout, schema, prompts, PDF generation, or runtime changes.

---

## 2. Pricing copy updated

### Before → After (all bundle rows in "Do I save if I add multiple chapters?")

**Focused Chapters only (no CORE)**

| Line | Before | After |
|---|---|---|
| 2 chapters | `(save $0.99)` | `(regular separate price $5.98 · you save $0.99)` |
| 3 chapters | `(save $1.98)` | `(regular separate price $8.97 · you save $1.98)` |
| 4 chapters | `(save $2.97)` | `(regular separate price $11.96 · you save $2.97)` |
| 5 chapters | `(save $4.96)` | `(regular separate price $14.95 · you save $4.96)` |
| All 6 chapters | `(save $7.94 vs $17.94)` | `(regular separate price $17.94 · you save $7.94)` |

**CORE Report + Focused Chapters**

| Line | Before | After |
|---|---|---|
| CORE + 2 chapters | `(save $0.99)` | `(regular separate price $10.97 · you save $0.99)` |
| CORE + 3 chapters | `(save $1.98)` | `(regular separate price $13.96 · you save $1.98)` |
| CORE + 4 chapters | `(save $2.97)` | `(regular separate price $16.95 · you save $2.97)` |
| CORE + 5 chapters | `(save $4.96)` | `(regular separate price $19.94 · you save $4.96)` |
| CORE Complete | `(save $7.94 vs $22.93)` | `(regular separate price $22.93 · you save $7.94)` |

---

## 3. Commands run and results

| Command | Result |
|---|---|
| `git pull` | Fast-forward from 1daf3cf → 7dff93f (5 new Lovable commits pulled) |
| `npx tsc --noEmit` (baseline) | **Clean** (0 errors) |
| `npx tsc --noEmit` (after changes) | **Clean** (0 errors) |
| `npm run lint` (baseline) | 379 pre-existing errors (prettier formatting from Lovable commits), 7 warnings |
| `npm run lint` (after changes) | 389 errors pre-commit; **auto-fixed by pre-commit hook at commit time** |
| `npm run build` | **FAIL — pre-existing, unrelated to changes** |
| pre-commit hook | **OK — auto-fixes applied and staged** |

### Build failure (pre-existing, not caused by this change)

```
Error: Node.js 20.12.2 — Vite requires Node.js 20.19+ or 22.12+
ERR_REQUIRE_ESM: require() of ES Module lovable-tagger/dist/index.js not supported
```

**Classification:** Environment issue — local Node.js version is below Lovable/Vite requirement.
Lovable builds in the cloud via its own pipeline. This local build failure does not affect production or the copy change.

---

## 4. Expected app copy signals — repo verification

| Signal | Present in repo? |
|---|---|
| "Your zodiac sign is only the surface" | ✅ `src/routes/index.tsx` |
| "More than a horoscope. Your private birth code." | ✅ `src/routes/index.tsx`, `src/lib/generation.server.ts` |
| CORE Report $4.99 | ✅ `src/lib/modules.ts`, `src/components/FaqBlock.tsx` |
| Focused Chapters $2.99 | ✅ `src/lib/modules.ts` |
| CORE Complete $14.99 | ✅ `src/lib/modules.ts`, `src/components/ProductSelector.tsx` |
| "delivered separately" | ✅ `src/components/ProductSelector.tsx` |
| No "compiled into a single PDF" | ✅ removed in UI-COPY1 |
| MONEY: "wealth, work & business mechanism" | ✅ `src/components/ProductSelector.tsx`, `src/routes/result.$reportToken.tsx` |
| YEAR: "year pattern, pressure & opportunity" | ✅ same files |
| PLACE: "where you lose energy" | ✅ same files |
| FAQ: bundles as separate focused PDFs | ✅ `src/components/FaqBlock.tsx` |
| "regular separate price" in FAQ savings | ✅ added this session |

---

## 5. Public domain QA

### Commands and results

```
curl -I https://darrowcode.com
→ HTTP/1.1 200 OK · Server: Squarespace · Age: 7346

curl -I https://www.darrowcode.com
→ HTTP/1.1 302 Found · Location: https://darrowcode.com/ · Server: cloudflare

curl -L https://darrowcode.com/?v=domain-qa-2026-06-03
→ <!-- This is Squarespace. --> (Squarespace HTML confirmed in response body)
```

### Per-signal check (public HTML vs repo)

| Signal | darrowcode.com (public) |
|---|---|
| "Your zodiac sign is only the surface" | ❌ NOT found — Squarespace page |
| "CORE Report" | ❌ NOT found |
| "$4.99" | ❌ NOT found (Squarespace pricing if any) |
| "CORE Complete" | ❌ NOT found |
| "$14.99" | ❌ NOT found |
| "delivered separately" | ❌ NOT found |
| Server header | `Server: Squarespace` |

### Root domain (`darrowcode.com`)
- Serves: **Squarespace content** (confirmed by `Server: Squarespace` header and `<!-- This is Squarespace. -->` HTML comment)
- Does NOT serve: the Lovable app

### www domain (`www.darrowcode.com`)
- Returns: `302 Found` → redirects to `https://darrowcode.com/`
- Server: Cloudflare (www is on Cloudflare CDN but redirects to root)
- Net result: www → root → Squarespace

### Classification: **FAIL / STALE**

Both `darrowcode.com` and `www.darrowcode.com` serve the old Squarespace site.
The Lovable app is NOT publicly reachable at either domain.

---

## 6. Likely causes and diagnosis

### Root cause
Namecheap nameservers still point to Squarespace DNS. The domain resolves Squarespace A/CNAME records, which serve the old Squarespace gateway page. Lovable's domain has not been activated as the live target.

### Signal breakdown

| Layer | Status | Evidence |
|---|---|---|
| Domain registrar (Namecheap) | Nameservers → Squarespace | `Server: Squarespace` in response |
| Squarespace DNS | Active, serving content | HTTP 200 from Squarespace |
| Cloudflare (www only) | Present on www, redirects to root | `Server: cloudflare` on www, 302 to root |
| Lovable app | Published in Lovable platform | Repo code is correct and committed |
| Lovable custom domain | Not yet wired / not resolving | App not reachable at darrowcode.com |

---

## 7. Required manual steps to fix domain

These steps must be done manually by the domain owner — not from code.

### Option A: Point Namecheap nameservers to Cloudflare (recommended)

1. In Namecheap → Domain → Nameservers → set to Cloudflare NS (from your Cloudflare account)
2. In Cloudflare → add A or CNAME records pointing `darrowcode.com` and `www.darrowcode.com` to the Lovable app's target IP/hostname
3. Wait for DNS propagation (minutes to 48 hours)
4. Verify in Lovable Domains UI that the domain is verified and active

### Option B: Point directly to Lovable from Squarespace DNS (if keeping Squarespace DNS)

1. In Squarespace DNS → add/update CNAME for root and www to the Lovable app endpoint
2. In Lovable → Domains → confirm domain and verify SSL
3. Wait for DNS propagation

### Immediate checks (no code change needed)

```bash
# Check current DNS resolution
nslookup darrowcode.com
nslookup www.darrowcode.com

# Check what Google DNS sees
nslookup darrowcode.com 8.8.8.8
nslookup www.darrowcode.com 8.8.8.8

# Check Cloudflare DNS
nslookup darrowcode.com 1.1.1.1
```

### Lovable UI checks

1. Lovable project → Settings → Domains → Is `darrowcode.com` listed and marked as verified?
2. Is the Lovable app set to publish to `darrowcode.com` as the primary domain?
3. Is there a pending domain verification step?

### Local DNS cache

```bash
# Windows — flush DNS cache
ipconfig /flushdns

# Then re-test
curl -I https://darrowcode.com
```

---

## 8. Final classification and recommendation

**Domain status:** FAIL / STALE — both root and www serve old Squarespace content.
**Repo status:** READY — all approved copy changes committed and correct.
**Local build:** FAIL (Node.js version incompatibility, pre-existing, unrelated to changes).
**Lovable cloud build:** Should succeed (Lovable uses its own build environment).

### Recommendation

**B) Wait / fix domain mapping first.**

The Lovable app is not publicly reachable at `darrowcode.com`. Proceeding to B4/PDF v4.1 render-only work can happen in the repo, but the domain must be correctly pointed to Lovable before any public testing of B4 output is possible.

**Once domain is fixed, re-run this QA** to confirm PASS before starting B4.

---

## 9. Recent commits (at time of report)

```
330900b copy: clarify FAQ savings wording
7dff93f Marked findings as not applicable
740cdce Changes
3e07857 Changes
c069374 Work in progress
1daf3cf ui: clarify bundle and faq copy
8cd061a ui: update report module card copy
65a1423 docs: clarify core complete delivery copy
```
