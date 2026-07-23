# AI output quality controls

## Context

Darrow Code Insight produces paid, customer-facing reports through AI-assisted generation. A syntactically valid model response is not sufficient: the content must match a report contract, remain readable, avoid unsupported claims, and preserve the distinction between prepared source material and model-authored interpretation.

## Engineering challenge

Generative output can drift even when instructions are detailed. Typical failure classes include missing structure, unsupported certainty, overly technical language, wording that conflicts with the product window or report type, and explanatory tags that are not backed by the prepared context.

Relying only on prompt wording would make those failures difficult to reproduce and unsafe to treat as accepted product output.

## Implemented approach

The generation path combines several layers:

1. Structured customer and provider data is assembled before generation.
2. The model returns a typed report shape rather than unrestricted prose.
3. Schema and report-specific acceptance checks validate required fields and sections.
4. Deterministic scanners evaluate customer-facing prose for forbidden claim categories, excessive technical density, and product-specific wording constraints.
5. Supporting proof tags are checked against the available context anchors.
6. Only accepted content proceeds to HTML and PDF rendering.

Some report types also use deterministic sanitization for narrowly defined wording defects after a failed generation attempt, while broader violations remain rejection conditions.

## Quality and safety controls

- Deterministic rules are implemented without additional model calls.
- Customer-facing prose and supporting technical metadata are evaluated separately.
- Context-sensitive checks distinguish a prohibited claim from wording that explicitly rejects such a claim.
- Acceptance results are actionable: findings identify the category and offending fragment rather than returning a generic failure.
- Timeouts, provider gates, retry limits, and order-level cost controls bound the generation path.
- Rejected output cannot silently advance to document rendering or completed delivery state.

## Validation strategy

Pure scanner tests cover allowed and rejected wording, contextual exceptions, duplicate findings, and report-specific constraints. Acceptance and orchestration tests verify that invalid output is retried, sanitized only where explicitly supported, or rejected before rendering. Rendering and delivery tests then operate on approved report data rather than raw model responses.

## Outcome

The model response becomes one input to a controlled product pipeline, not the final product by default. Quality decisions are repeatable, testable, and observable, while proprietary prompts, rules, provider configuration, and detailed implementation remain in the private engineering repository.
