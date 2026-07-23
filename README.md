# Darrow Code Insight

Darrow Code Insight is an AI-assisted report generation and digital delivery platform that turns structured user input into personalized, professionally formatted reports. It combines guided data collection, controlled generation, validation, document rendering, payment workflows, and reliable delivery.

The product applies this workflow to personal-orientation reports informed by structured birth data and configured symbolic knowledge. Its engineering focus is not simply generating text, but coordinating a complete customer journey from intake through a readable, downloadable document.

## The product problem

Personalized long-form reports require several systems to agree: customer input must be complete, external data must be normalized, generated content must remain grounded and structurally valid, documents must render consistently, and paid orders must reach the correct recipient. A failure at any boundary can leave an otherwise valid purchase incomplete.

Darrow Code Insight treats those boundaries as one controlled product workflow rather than a collection of disconnected integrations.

## Core user journey

1. A customer selects a report and completes a guided intake.
2. The platform validates and prepares the submitted data.
3. Checkout establishes the paid order before generation proceeds.
4. A background job assembles report context and performs controlled AI-assisted generation.
5. Acceptance checks evaluate the generated structure and content.
6. Approved content is rendered to HTML and PDF.
7. The completed report is made available through a protected result and download flow, with email delivery.

Account access supports returning customers, while authenticated administration surfaces provide order, report, support, subscription, and system oversight.

## Main capabilities

- Guided data collection and product selection
- Payment-aware order and report orchestration
- Structured context assembly from multiple supported knowledge domains
- Controlled AI-assisted generation with schema and acceptance validation
- Professionally formatted HTML and PDF report output
- Protected report access, download, and email delivery
- Customer account and administrative operations
- Consent-aware analytics and marketing controls
- Background processing, retries, recovery paths, health checks, and alerting

## Architecture at a glance

The application uses a TypeScript and React stack with TanStack Start and Vite. Server-side workflows coordinate Stripe checkout, Supabase-backed persistence and storage, external data providers, AI-assisted generation, and a browser-based PDF rendering path. Runtime deployment is designed for Cloudflare.

Generation is separated from the immediate checkout response through durable job processing. Validation gates sit between context assembly, generation, rendering, and delivery so incomplete or rejected artifacts do not silently advance.

See [Architecture and quality](docs/architecture-and-quality.md) for the system view.

## Quality engineering

The engineering repository contains automated coverage across generation decisions, report modules, AI acceptance rules, provider throttling, payment safety, delivery, PDF layout, consent, security utilities, administrative operations, and recovery selection.

Quality controls include structured output validation, forbidden-claim scanning, voice and content checks, render assertions, timeout handling, retry budgets, cost guards, and tests for critical workflow contracts. Release validation combines linting, type checks, automated tests, build verification, and targeted workflow checks.

## Reliability and recovery

Paid work is represented as durable background jobs rather than relying only on an inline request. The platform can identify queued, stuck, failed, and orphaned work; reclaim or requeue eligible jobs; and recover missed delivery steps. Structured pipeline logs, health signals, throttled alerts, and administrative support actions provide operational visibility without exposing customer details through public health responses.

Read the concise [report-generation reliability case study](case-studies/report-generation-reliability.md).

## Security and privacy

Payment events are verified before order state changes. Sensitive operations use server-side authorization, protected report access, redirect safety checks, bot protection, secret-hygiene checks, and explicit test-mode controls. Analytics behavior is connected to consent state, and the product includes privacy, terms, subscription, and unsubscribe journeys.

Detailed implementation and operational configuration are maintained in a private engineering repository. See [Security policy](SECURITY.md) for responsible disclosure.

## Technology overview

- TypeScript, React, TanStack Start, TanStack Router, and Vite
- Zod and React Hook Form for typed validation and guided input
- Supabase for application data, authentication, storage, and background scheduling
- Stripe for checkout and payment events
- Cloudflare runtime services and browser rendering
- HTML, Puppeteer-compatible browser rendering, and PDF tooling
- Vitest, ESLint, Prettier, and TypeScript release checks

## Engineering ownership

Darrow Code Insight is independently designed and engineered as a complete product. Engineering ownership spans product architecture, application implementation, automated testing, AI quality controls, report rendering, payment and delivery coordination, reliability and recovery, release validation, deployment preparation, and operational readiness.

## Product visual

No visual is published until a current-identity product or UI image can be verified as public-safe. The selection requirements and intended visual slots are documented in [Visual assets](assets/README.md).

## Documentation

- [Architecture and quality](docs/architecture-and-quality.md)
- [Report-generation reliability](case-studies/report-generation-reliability.md)
- [Security policy](SECURITY.md)
- [Visual assets](assets/README.md)
