# Visual assets

The assets in this directory are public-safe materials selected specifically for the Darrow Code Insight product and engineering showcase.

## Current product captures

| Asset | Purpose | Provenance |
| --- | --- | --- |
| [`product/current-home-hero.webp`](product/current-home-hero.webp) | Desktop homepage and current product positioning | Real Playwright capture of the live public site |
| [`product/current-product-selector.webp`](product/current-product-selector.webp) | CORE, CORE Complete, and focused report selection | Real Playwright capture of the live public site |
| [`product/current-home-mobile.webp`](product/current-home-mobile.webp) | Responsive mobile experience | Real Playwright capture of the live public site |
| [`product/current-site-walkthrough.mp4`](product/current-site-walkthrough.mp4) | Short product walkthrough | Real Playwright recording, optimized with FFmpeg |
| [`product/current-site-walkthrough-poster.webp`](product/current-site-walkthrough-poster.webp) | Walkthrough preview | Derived from the current desktop capture |
| [`product-workflow.svg`](product-workflow.svg) | Public architecture and workflow overview | Purpose-built for this repository |

The captures contain no customer information, checkout data, authenticated views, internal URLs, prompts, diagnostics, or operational configuration.

## Source-of-truth policy

The live product at [darrowcode.com](https://darrowcode.com/) is the primary visual source of truth. The active Lovable project state and current implementation imports are used as secondary verification.

A visual is publishable only when it:

1. appears in the current live product or is directly confirmed by the active project state;
2. contains no personal, payment, authentication, or operational data;
3. reflects the current product catalog and visual identity;
4. has been reviewed in its final exported format;
5. is optimized for repository display without materially degrading legibility.

## Capture process

Current UI evidence is produced with a controlled browser workflow:

1. open the public site in Playwright;
2. set the required desktop or mobile viewport;
3. wait for the page and public assets to finish loading;
4. dismiss optional consent UI without entering any customer flow;
5. capture the approved public surface;
6. encode screenshots as WebP and the walkthrough as H.264 MP4 with FFmpeg;
7. inspect the final files before publication.

Temporary capture automation is not retained in the final repository. Only reviewed output assets and their provenance documentation remain.
