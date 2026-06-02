# Darrow Code Knowledge Base

**Status:** organization skeleton / docs-only.

This directory separates Darrow Code knowledge work from runtime implementation.

## Core separation

```text
FreeAstroAPI / calculated provider data
→ source packs / research background
→ curated Darrow Code rules
→ provider-to-rule mapping
→ customer-facing report output
```

## What this directory is

- A controlled place for source matrices, source-risk notes, curated symbolic rules, and provider mapping plans.
- A docs-only workspace for future KB phases.
- A way to prevent raw source research from accidentally becoming runtime instructions.

## What this directory is not

- Not production runtime logic.
- Not prompt activation.
- Not schema authority.
- Not PDF template authority.
- Not provider implementation.
- Not authorization to use gated layers in CORE output.

## Directory plan

```text
docs/knowledge/
  README.md
  SOURCE_POLICY.md
  SOURCE_LOG.md
  KNOWLEDGE_SOURCE_MATRIX_v1.md
  KB_ORGANIZATION_PLAN_v1.md

  source_packs/
    README.md

  rules/
    README.md

  mapping/
    README.md
    FREEASTROAPI_PROVIDER_MAPPING_PLAN_v1.md
    REPORT_SECTION_ROUTING_PLAN_v1.md
    GATED_LAYERS_POLICY_v1.md
```

## Runtime guard

Any future change that touches `src/`, prompts, routes, provider logic, schema, PDF rendering, Stripe, email, auth, or customer/order logic is **not** part of KB docs-only work.

## Current phase status

- KBSYS0: organization skeleton.
- KB1 later: import approved source packs into `source_packs/`.
- KB2 later: create curated Darrow rules in `rules/`.
- MAP1 later: map FreeAstroAPI / `DarrowChartData` fields to rules and report sections.
