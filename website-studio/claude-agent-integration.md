# Claude Agent Integration Contract

## Purpose

Connect the existing Claude team documented in the user's Back to Outdoor agent-team file to the universal website studio. This contract defines exact handoffs and output formats. It does not pretend to invoke Claude agents automatically: until a Claude API/Agent SDK runner and credentials are configured, a person or Claude Project must execute the handoffs using these packets.

## Scope and safety

- Supports any legitimate industry: hospitality, trades, real estate, restaurants, tourism/outdoor, professional services, retail, and others.
- Treat industry as client data, not as a fixed template. Choose layout, content, proof points, features, and imagery from the actual brief.
- previewOnly must remain true by default.
- Never edit or deploy the production site as part of client preview generation.
- Never publish, merge a release branch, change production aliases, or trigger a production deployment without explicit approval from Bastian for that release.
- Never invent facts, awards, reviews, testimonials, prices, customer names, certifications, results, or image rights.
- The existing Claude agents are roles/instructions, not necessarily separately callable software services. Do not claim that an agent ran unless it actually did.

## Reuse map: existing Claude roles

| Existing role | Website studio responsibility | Required handoff |
|---|---|---|
| Sharon — Zielgruppe | Audience, decision-makers, needs, objections, conversion goal | audience.md |
| Max — Redaktionsplan & Ideen-Board | Page map, section priorities, content coverage | page-plan.md |
| Vex — Hooks & Varianten | Hero headline and CTA variants, where useful | copy-options.md |
| Leo — Skripte | Story-led page copy and video scripts if requested | website-copy.md |
| Theo/Barbara — Website & Journal | Landing-page copy, service pages, journal/blog | website-copy.md |
| Titan — Angebote | Service/product offer and package clarity when relevant | offer.md |
| Cena — Kundensimulation | Skeptical-user review and conversion objections | user-test.md |
| Jasper — Ehrliches Feedback | Final editorial and credibility review | quality-review.md |
| Celia — Erstansprache | Optional lead-specific outreach after website review | outreach-draft.md |
| Echo — Pitch | Optional elevator pitch or sales explanation | pitch.md |
| Cara — Repurposing | Optional adaptation of approved website content to social/LinkedIn | repurposed-content.md |
| Linx — LinkedIn | Optional B2B/LinkedIn positioning | linkedin-plan.md |

Not every role runs on every project. Use only relevant roles. Sharon, one of Theo/Barbara, Jasper, and a technical QA check are the normal minimum. Max, Vex, Leo, Titan, and Cena are added according to scope. Celia, Echo, Cara, and Linx are optional extras and must not delay website delivery.

## Workflow and gate order

### Gate 0 — Intake
Collect client name, source URL(s), industry, target audience, primary goal, required pages, language, desired style, contact/booking/shop needs, supplied assets, usage rights, deadline, and forbidden content. Save unanswered items in openQuestions. Do not block a first visual draft for noncritical unknowns; mark those as placeholders.

### Gate 1 — Evidence audit
Inspect only accessible sources and supplied materials. Record each factual claim with its source URL or label it unverified. List asset source and rights status. Do not reuse protected assets without permission. Report inaccessible pages instead of guessing.

### Gate 2 — Strategy and page plan (Sharon + Max; optional Titan)
Deliver audience needs, primary conversion goal, top objections, proposed sitemap/sections, and available evidence supporting claims. If these agents are not separately configured, run their documented role instructions in the existing Claude Project and label the result role-simulated.

### Gate 3 — Creative and copy (Theo/Barbara + Vex/Leo; optional Titan)
Produce industry-specific visual direction and page copy. Reuse the existing starter as a structural starting point only; never simply recolor the real-estate demo for another industry. Provide text, assets, and CTAs as structured client config data. Omit unverified claims or mark them as questions.

### Gate 4 — Build (coding agent)
Use a feature branch and preview-only configuration. Keep client-specific data separate from reusable layout/components. Do not write client data into production pages. Ensure every CTA has a real destination or is visibly marked as a placeholder.

### Gate 5 — Independent review (Cena + Jasper + technical QA; optional Remy)
Cena checks whether the page answers real user questions and exposes objections. Jasper checks clarity, credibility, tone, and overclaiming. Technical QA checks responsive behavior, keyboard navigation/focus, contrast, alt text, reduced motion, links, console/build output, and form integrations. Record each item as PASS, FAIL, or NOT CHECKED; do not claim tests that were not performed.

### Gate 6 — Preview and owner approval
Provide preview URL, changed-file list, test report, known limitations, and remaining questions. Production approval must be a separate, explicit yes for the specific site/release. No response is not approval. Preview READY status alone does not prove visual correctness.

### Gate 7 — Production release (manual, approval-gated)
Only after explicit approval: confirm target domain, release commit, deployment destination, rollback path, and final smoke test. If any one is unclear, stop and ask. This contract itself does not authorize production deployment.

## Canonical project record

Store one JSON record per project. Recommended shape:

```json
{
  "project": {"clientName": "", "industry": "", "sourceUrls": [], "websiteGoal": "", "language": "de", "previewOnly": true, "status": "intake", "productionApproval": {"approved": false, "approvedBy": "", "approvedAt": "", "releaseCommit": ""}},
  "audience": {"primaryAudience": "", "needs": [], "objections": []},
  "brand": {"displayName": "", "tagline": "", "tone": "", "colors": {}, "fonts": {}},
  "content": {"pages": [], "verifiedClaims": [], "unverifiedClaims": [], "primaryCtaLabel": "", "primaryCtaHref": ""},
  "assets": [],
  "features": {"showPortfolio": false, "showBooking": false, "showShop": false, "showLeadForm": false},
  "integrations": {"contactUrl": "", "bookingUrl": "", "formBackendConfigured": false, "crmConfigured": false, "analyticsConfigured": false},
  "openQuestions": [], "handoffs": [],
  "qa": {"responsive": "NOT CHECKED", "accessibility": "NOT CHECKED", "links": "NOT CHECKED", "forms": "NOT CHECKED", "build": "NOT CHECKED", "visualBrowserReview": "NOT CHECKED"}
}
```

## Handoff packet template

Every role receives: project ID and client name; industry and business goal; source URLs and approved files; verified facts with source references; unverified facts and open questions; prior role output; one specific task and required output format; acceptance criteria and constraints; and preview-only status (default yes).

The receiving role returns: result, evidence, assumptions, openQuestions, risks, and nextHandoff.

## Current engineering status

Implemented in this repository: workflow documentation, example client config, static universal starter, and agent-role mapping.

Not yet implemented or verified:
1. A runtime that calls actual Claude agents / Claude API.
2. A renderer that reads client config and reliably produces a tailored page (the current starter is static HTML).
3. A persistent per-client project store and handoff status dashboard.
4. Automated branch creation, preview deployment, and preview URL capture.
5. Real browser-based visual QA and automated accessibility/link tests.
6. Working contact form, booking, shop, CRM, analytics, or payment integrations.
7. Approval-gated production release automation.

Do not describe the current setup as a fully automated agent system until these are implemented and tested.
