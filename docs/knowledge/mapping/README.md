# Darrow Code Provider Mapping

**Status:** future mapping area / docs-only.

This directory defines how calculated provider data should later map into curated Darrow Code rules and report sections.

## Mapping pipeline

```text
FreeAstroAPI / DarrowChartData field
→ normalized Darrow signal
→ curated rule doc
→ report section
→ allowed / conditional / gated / blocked
```

## Current files

```text
FREEASTROAPI_PROVIDER_MAPPING_PLAN_v1.md
REPORT_SECTION_ROUTING_PLAN_v1.md
GATED_LAYERS_POLICY_v1.md
```

Future files may include:

```text
FREEASTROAPI_TO_DARROW_MAPPING_v1.md
BIRTH_TIME_RELIABILITY_POLICY_v1.md
```

## Hard rule

Mapping docs are references only.

They must not:

- modify provider implementation;
- add endpoints;
- call FreeAstroAPI;
- call Claude;
- modify prompts;
- modify schema;
- modify PDF template;
- modify production pipeline;
- modify Stripe, payment, email, auth, customer, order, token, or purchase logic.
