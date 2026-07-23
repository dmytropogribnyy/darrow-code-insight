# Visual assets

This repository includes one committed public-safe engineering visual:

- [`product-workflow.svg`](product-workflow.svg) — a purpose-built overview of the report workflow and its quality, reliability, and privacy controls.

It also presents current product visuals from the live Darrow Code pages in:

- [`docs/product-surfaces.md`](../docs/product-surfaces.md)
- the opening section of [`README.md`](../README.md)

Those visuals are served from the current public product CDN and contain no customer or operational data. They are not sourced from unverified legacy files.

The live product at [darrowcode.com](https://darrowcode.com/) remains the visual source of truth. A file found in the private engineering repository is not considered current merely because it still exists there.

## Visual provenance

| Visual | Source | Publication status |
| --- | --- | --- |
| Product workflow | Created specifically for this public engineering overview | Committed in this repository |
| UNVEIL product presentation | Current public product page | Embedded by exact public CDN URL |
| Full Destiny Codex presentation | Current public product page | Embedded by exact public CDN URL |
| Report presentation previews | Current public product pages | Embedded by exact public CDN URL |

## Future UI captures

| File | Intended view | Review focus |
| --- | --- | --- |
| `customer-flow.webp` | Guided intake or report-selection step | No names, birth details, email addresses, or account data |
| `report-preview.webp` | Representative report reading or PDF view | Synthetic content, no customer identifiers, no hidden diagnostics |
| `admin-overview.webp` | Safe operational or administration view | Synthetic records only; no internal URLs, IDs, payment data, or support details |

## Publication checklist

Before adding any UI image:

1. Confirm that it comes from the current live product UI and not a legacy build or unused repository asset.
2. Use synthetic or fully anonymized data.
3. Remove names, email addresses, birth details, account identifiers, order IDs, payment information, and report-access links.
4. Remove internal URLs, local paths, prompts, diagnostics, provider information, configuration, and environment values.
5. Check browser chrome, notifications, open tabs, and background windows for accidental disclosure.
6. Crop to the smallest area that still explains the product workflow.
7. Review the final exported file rather than relying only on the source screenshot.

No placeholder image files should be committed. A UI visual is added only after it passes this checklist.
