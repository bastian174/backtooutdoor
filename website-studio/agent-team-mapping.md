# Back to Outdoor — Agent Team Mapping

## Source

The source spreadsheet is **“[NEW] 70 AI Helpers (GPT Bots)”**:
https://docs.google.com/spreadsheets/d/12klSGM4cREDzrrM-_FEu5cMf8qrQmuLVOPwR-4COFEA/edit?gid=0

The sheet lists 70 assistants with names, categories, descriptions, and ChatGPT GPT links. Those links are ChatGPT GPTs; the spreadsheet itself does not prove that the same agents are already configured in Claude. The role mapping below is designed to reuse equivalent agents/instructions in the user's Claude team where available.

## Recommended team for each website project

Run these as a coordinated workflow, not all at once. Project Lead hands each output to the next agent and maintains one project brief.

| Order | Role / listed agent | Use for | Required output |
|---|---|---|---|
| 1 | Oscar — Task Prioritiser | Plan milestones and priorities | Task order, blockers, status |
| 2 | Sophie — Strategic Market Bot | Competitors and market positioning | Evidence-backed competitor and differentiation notes |
| 3 | Sharon — Target Audience Analyzer | Audience and user needs | Audience segments, user needs, conversion goal |
| 4 | Ember — Branding Expert GPT | Brand direction | Tone, visual direction, color/type recommendations |
| 5 | Ethan — Problems & Solutions GPT | Offer clarity and customer problems | Value proposition and objections |
| 6 | Theo — Landing Page Writer GPT | Page structure and first draft | Page map, hero, section copy, CTA plan |
| 7 | Cody — Copywriting Bot | Refine all website copy | Final copy, with unverified claims flagged |
| 8 | Sebo — SEO Optimisation Bot | Search basics | Search intent, page titles, descriptions, headings |
| 9 | Phoebe — Logo generator GPT (optional) | Logo concepts only if needed | Directional concepts, not final licensed assets |
| 10 | Developer agent / Claude coding agent | Implement the page | Code on isolated feature branch |
| 11 | Jasper — Honest Feedback GPT | Independent critique | Prioritized issues and specific fixes |
| 12 | Remy — Risk Management GPT | Claims, privacy, launch risks | Risk checklist and unresolved issues |
| 13 | Project Lead + QA agent | Verify the result | Pass/fail checklist and preview link |

### Optional specialists, only when relevant

- Blake — E-commerce Optimization Bot: online shop projects.
- Cassie — Client Onboarding Bot: gather requirements and client assets.
- Titan — Business Offer GPT: clarify offers and service packages.
- Barbara — Blog Writing Bot: blog sections and article content.
- Cara — Content Repurposing Bot: reuse approved content across channels.
- Vex — Viral Hooks Creator Bot: campaign-led pages where a strong hook matters.
- Axel — Customer relationship management GPT: only where CRM workflows are required.
- Nora — Invoice Management Bot: operations/invoicing, not website design itself.

Do not activate every helper for every project. Select only the roles that solve a real need. The listed names are source-sheet assistants; if an equivalent Claude agent exists, use that existing Claude agent and pass it the role/output below. Do not assume the spreadsheet's ChatGPT links can be called directly from Claude.

## Handoff packet

Each agent receives:
1. Client URL and approved source materials.
2. Project goal and target audience.
3. Verified facts vs. assumptions.
4. Prior agent's output.
5. The exact deliverable and acceptance criteria.
6. Unknowns that must be asked rather than invented.

## Acceptance criteria before preview

- The design reflects this client's brand and industry; it is not a generic real-estate reskin.
- Facts, prices, awards, testimonials, certifications and performance claims are verified or omitted.
- Assets have documented usage permission or are replaced.
- All CTAs have a real destination; placeholders are clearly marked and never presented as working.
- Desktop and mobile layouts are checked.
- Keyboard focus, contrast, alt text, and reduced-motion behavior are considered.
- Forms, booking, shop, payments, CRM, and analytics are only claimed to work after real integration and testing.
- Preview is separate from production.
- Production release requires explicit owner approval.

## Current implementation status

This mapping documents the workflow and is not itself an automated agent runtime. The next engineering step is to connect the client config to the website renderer and build a project runner that invokes the available Claude agents, records their outputs, generates a preview, and runs QA. Keep production publishing manual and approval-gated until the entire flow is tested.
