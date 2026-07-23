# Visual assets

Current product visuals are not yet published in this repository. Historical branding is excluded, as is any image whose current status cannot be verified.

The live product at [darrowcode.com](https://darrowcode.com/) is the visual source of truth. A file found in the private engineering repository is not considered current merely because it still exists there.

## Planned captures

| File | Intended view | Review focus |
| --- | --- | --- |
| `product-overview.webp` | Current landing or product overview | Current identity, clear product purpose, no stale copy |
| `customer-flow.webp` | Guided intake or report-selection step | No names, birth details, email addresses, or account data |
| `report-preview.webp` | Representative report reading or PDF view | Anonymized content, no customer identifiers, no hidden diagnostics |
| `admin-overview.webp` | Safe operational or administration view | Synthetic records only; no internal URLs, IDs, payment data, or support details |

## Publication checklist

Before adding any image:

1. Confirm that it comes from the current live product UI and not a legacy build or unused repository asset.
2. Use synthetic or fully anonymized data.
3. Remove names, email addresses, birth details, account identifiers, order IDs, payment information, and report-access links.
4. Remove internal URLs, local paths, prompts, diagnostics, provider information, configuration, and environment values.
5. Check browser chrome, notifications, open tabs, and background windows for accidental disclosure.
6. Crop to the smallest area that still explains the product workflow.
7. Review the final exported file rather than relying only on the source screenshot.

No placeholder image files should be committed. A visual is added only after it passes this checklist.
