# Report-generation reliability

## Context

A paid personalized report crosses several independent boundaries: payment confirmation, data preparation, AI-assisted generation, acceptance validation, document rendering, storage, and customer delivery.

## Engineering challenge

Completing all work inside the checkout request would make delivery depend on one runtime window. Partial failures could also create ambiguous states: a paid order without a job, a completed artifact without an email, or a processing job whose worker disappeared.

## Implemented approach

The product records paid work as durable generation jobs. An initial dispatch can begin promptly, while scheduled processing provides a recovery path. Pipeline stages update explicit order, job, and report state. Selection logic identifies eligible queued, stuck, failed, and orphaned work, and report rendering remains downstream of content acceptance.

## Quality and safety controls

Payment events are verified before paid state is established. Generation uses timeouts, circuit breaking, retry budgets, cost guards, and report-specific acceptance checks. Delivery recovery reuses the existing purchase rather than initiating a new charge. Health output avoids personal information, and administrative recovery remains authenticated.

## Validation strategy

Automated tests cover job selection, orchestration outcomes, failure classification, retries, watchdog behavior, separate report handling, rendering, email assembly, and support recovery. Release checks add linting, type validation, builds, and targeted workflow diagnostics.

## Outcome

The workflow has explicit ownership for each transition and a defined recovery path for incomplete work. Paid orders are not dependent on a single request completing successfully, and generation, rendering, and delivery failures remain distinguishable and actionable.
