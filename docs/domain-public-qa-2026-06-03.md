# Darrow Code — Domain Public QA Report

**Date:** 2026-06-03
**Phase:** FAQ-PRICING-COPY-FIX + DOMAIN-PUBLISH-QA
**Current commit:** `96ff778` (QA report) / `330900b` (copy fix)
**Report updated:** mobile hotspot recheck — revised conclusion

---

## Architecture note (expected)

Namecheap is the domain registrar. Squarespace is the current active DNS provider (nameservers point to Squarespace). Lovable is the website host. This is the intended temporary architecture — Squarespace DNS records point to the Lovable app endpoint. This is NOT a misconfiguration.

---

## 1. Files changed this session

| File | Change |
|---|---|
| `src/components/FaqBlock.tsx` | FAQ savings wording — replaced `save $X vs $Y` with `regular separate price $Y · you save $X` for all 10 bundle rows |
| `docs/domain-public-qa-2026-06-03.md` | This report |

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

## 3. Local quality checks

| Command | Result |
|---|---|
| `ipconfig /flushdns` | ✅ DNS cache flushed successfully |
| `npx tsc --noEmit` (baseline) | ✅ Clean (0 errors) |
| `npx tsc --noEmit` (after changes) | ✅ Clean (0 errors) |
| `npm run lint` (baseline) | ⚠️ 379 pre-existing errors from Lovable commits (prettier formatting), 7 warnings |
| `npm run lint` (after changes) | pre-commit hook auto-fixed formatting — commit clean |
| `npm run build` | ❌ **Pre-existing — unrelated to changes** |
| pre-commit hook | ✅ OK — auto-fixes applied and staged |

### Build failure (pre-existing, not caused by this change)

```
Error: Node.js 20.12.2 — Vite requires Node.js 20.19+ or 22.12+
ERR_REQUIRE_ESM: require() of ES Module lovable-tagger/dist/index.js not supported
```

This is a local environment version mismatch. Lovable builds via its own cloud pipeline. This does not affect production or the Lovable-deployed app.

---

## 4. DNS resolution — all resolvers after flush

All resolvers return `185.158.133.1` for both root and www:

| Resolver | darrowcode.com | www.darrowcode.com |
|---|---|---|
| System (mobile hotspot) | `185.158.133.1` | `185.158.133.1` |
| Google DNS (8.8.8.8) | `185.158.133.1` | `185.158.133.1` |
| Cloudflare DNS (1.1.1.1) | `185.158.133.1` | `185.158.133.1` |

`185.158.133.1` is the Lovable/Cloudflare edge IP — not Squarespace.

---

## 5. Public domain QA — mobile hotspot recheck

### curl.exe header responses

```
curl.exe -I https://darrowcode.com
→ HTTP/1.1 200 OK
→ Server: cloudflare
→ x-deployment-id: 35a6cdbff41f0ebc68bab3052c6b61252c8d0837e6e38981845e6551b0d383a0
→ Cache-Control: no-cache, must-revalidate, max-age=0
→ (NO Server: Squarespace)

curl.exe -I https://www.darrowcode.com
→ HTTP/1.1 302 Found
→ Location: https://darrowcode.com/
→ Server: cloudflare
→ (www correctly redirects to root)
```

### HTML content signal check

| Signal | darrowcode.com public HTML | Notes |
|---|---|---|
| "More than a horoscope" | ✅ FOUND | In `<meta description>` |
| "CORE Report" | ✅ FOUND | In page content |
| "$4.99" | ✅ FOUND | In page content |
| "$14.99" | ✅ FOUND | In page content |
| "delivered separately" | ✅ FOUND | CORE Complete copy confirmed |
| "Squarespace" | ✅ NOT FOUND | Old site confirmed absent |
| Commit `96ff77` | ✅ FOUND | `data-commit-sha` matches current repo HEAD |
| "Your zodiac sign is only the surface" | ⚠️ Not in static HTML | Expected for SPA — rendered by React JS bundle, not SSR |

### Commit confirmation

`data-commit-sha="96ff7784e55f8fa731d4166d109eadc10034c202"` = `96ff778` = current repo HEAD. The live site is serving the exact current commit.

---

## 6. Classification

### PARTIAL / STALE PROPAGATION — resolving to PASS

| Network | Result |
|---|---|
| **Mobile hotspot (first check)** | ✅ PASS — Lovable app served |
| **Wired network (first check earlier)** | ❌ STALE — old Squarespace records cached |
| **Current machine (after DNS flush)** | ✅ PASS — resolves to 185.158.133.1, Lovable app served |

**Explanation:** The initial wired-network FAIL was due to DNS propagation lag and local resolver caching. The mobile hotspot had fresh DNS that had already received the updated Squarespace DNS records pointing to Lovable. After flushing the local DNS cache, all resolvers (system, Google 8.8.8.8, Cloudflare 1.1.1.1) now consistently return `185.158.133.1` and serve the Lovable app.

**The domain is propagated correctly. No DNS changes are needed. No nameserver migration is needed.**

---

## 7. Expected app signals — repo vs live comparison

| Signal | Repo | Live site |
|---|---|---|
| "More than a horoscope" | ✅ | ✅ |
| CORE Report $4.99 | ✅ `src/lib/modules.ts` | ✅ |
| CORE Complete $14.99 | ✅ `src/lib/modules.ts` | ✅ |
| "delivered separately" | ✅ `ProductSelector.tsx` | ✅ |
| "wealth, work & business mechanism" (MONEY) | ✅ `ProductSelector.tsx` | In JS bundle |
| "year pattern, pressure & opportunity" (YEAR) | ✅ `ProductSelector.tsx` | In JS bundle |
| "where you lose energy" (PLACE) | ✅ `ProductSelector.tsx` | In JS bundle |
| "regular separate price" in FAQ savings | ✅ `FaqBlock.tsx` (this session) | In JS bundle |
| Squarespace NOT present | ✅ | ✅ |
| Current commit SHA | `96ff778` | `96ff778` ✅ |

---

## 8. Recommendation

**A) Proceed to B4/PDF v4.1 render-only.**

Domain is correctly wired and propagated. The Lovable app is live at `darrowcode.com` and `www.darrowcode.com` serving the current repo commit. No domain or DNS changes are needed.

The only outstanding infrastructure caveat is the local build environment (Node.js version), which does not affect Lovable's cloud build pipeline.

---

## 9. Recent commits

```
96ff778 docs: add domain QA report 2026-06-03
330900b copy: clarify FAQ savings wording
7dff93f Marked findings as not applicable
740cdce Changes
3e07857 Changes
c069374 Work in progress
1daf3cf ui: clarify bundle and faq copy
8cd061a ui: update report module card copy
```
