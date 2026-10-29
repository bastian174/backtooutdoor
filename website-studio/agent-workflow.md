# Specialist AI Agent Workflow

## Goal

Turn a customer brief into a distinctive, tested website preview while keeping the existing production website unchanged until explicit approval.

## Agent 1 — Project Lead

**Input:** customer URL, brief, constraints, approved assets.

**Responsibilities**
- Create a project record and track status.
- Assign work to specialist agents.
- Keep assumptions, unknowns, and decisions visible.
- Block production publishing without explicit approval.

**Output:** project brief and checklist.

## Agent 2 — Research and Content Audit

**Responsibilities**
- Inspect accessible customer pages and supplied materials.
- Inventory services/products, contact routes, brand elements, and useful assets.
- Separate verified facts from assumptions.
- Note inaccessible pages and missing information.

**Output:** source-backed content and asset inventory.

## Agent 3 — Creative Director / UX

**Responsibilities**
- Define a distinct visual direction based on the brand and industry.
- Select the page structure and conversion goal.
- Decide whether video, scroll effects, or 3D genuinely improve the experience.
- Avoid reusing the real-estate demo's visual identity for unrelated customers.

**Output:** design brief, page map, visual rules, interaction plan.

## Agent 4 — Copywriter

**Responsibilities**
- Write clear, customer-specific copy.
- Use only verified business facts.
- Mark missing facts as questions or placeholders.
- Provide page titles, descriptions, headings, and CTA labels.

**Output:** approved content draft.

## Agent 5 — Web Developer

**Responsibilities**
- Build using the existing project's stack when practical.
- Reuse accessible components, not a one-size-fits-all page.
- Configure responsive layout, metadata, and required integrations.
- Keep customer configuration and reusable code separate.

**Output:** working branch and preview candidate.

## Agent 6 — QA / Accessibility

**Responsibilities**
- Check desktop and mobile layout.
- Check navigation, focus states, contrast, reduced-motion behavior, and image alternatives.
- Test forms only when a real backend is configured.
- Check for broken links, console/build errors, and performance issues.
- Record untested items honestly.

**Output:** pass / fix / not checked report.

## Agent 7 — Release Coordinator

**Responsibilities**
- Confirm preview URL and build status.
- Ensure the actual preview was opened and checked when tools allow.
- Summarize known issues and obtain explicit approval.
- Never merge or publish to production silently.

**Output:** approval request and release checklist.

## Required handoff record

For every project, maintain:
- client name and URL
- business goal and target audience
- source URLs and verified facts
- asset inventory and rights status
- design direction and page list
- required features and integration status
- branch and preview URL
- test results and open issues
- explicit production approval status

## Implementation sequence

1. Use the universal starter to prove that client configuration and page structure can be separated.
2. Convert repeated sections into components when the existing app stack supports it.
3. Add a structured project record and agent handoffs.
4. Add automated preview deployment and real browser checks.
5. Add industry-specific modules only when a customer project requires them.
6. Add production publishing only behind a separate explicit approval step.
