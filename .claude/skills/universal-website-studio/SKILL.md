---
name: universal-website-studio
description: Use when planning, writing, implementing, reviewing, or preparing a preview of a tailored cross-industry client website in this repository.
---
# Universal Website Studio

## Purpose
Create tailored premium websites for any industry from a client URL and brief, while preserving the production site until explicit release approval.

## Start here
Read these project files before acting:
- `website-studio/README.md`
- `website-studio/agent-workflow.md`
- `website-studio/agent-team-mapping.md`
- `website-studio/claude-agent-integration.md`
- `website-studio/client-config.example.json`

Treat the user's documented Claude team as the source of role intent. Project-level Claude Code adapters live in `.claude/agents/`; they make relevant roles available in this repository, but they do not prove that the separate Claude Project agents or their exact prompts have been connected. Where an existing named agent is available in the active Claude environment, prefer that agent. Otherwise use the repository adapter and disclose that it is a role adapter.

## Workflow
1. Intake: identify client, source URL, industry, language, audience, goal, required pages, desired style, features, assets, rights, constraints, and unknowns. Ask only essential questions; otherwise mark placeholders.
2. Evidence audit: inspect accessible pages and supplied files. Keep source URLs for facts; separate verified facts from assumptions. Report inaccessible sources.
3. Audience and strategy: use `website-sharon-audience`; create the page plan with `website-max-page-planner`. Add offer/copy roles only where relevant.
4. Copy: use `website-theo-copywriter`; optionally use the documented Vex, Leo, or Titan roles for headline variants, story/video, or offer clarity.
5. Configuration: prepare a client-specific config based on `website-studio/client-config.example.json`. Do not claim the current static starter automatically reads the config until a renderer exists.
6. Implementation: use the existing project's stack and a separate feature branch. Keep client data and assets separate from production. Do not overwrite live production files.
7. Review: use `website-jasper-review`; add Cena-style skeptical-user review and technical QA when appropriate. Record every test as PASS, FAIL, or NOT CHECKED.
8. Preview: provide preview URL only if a deployment actually produced one. READY status alone is not visual verification. Never claim a page was visually tested unless it was opened and checked.
9. Approval: production publishing, merging for release, domain/alias changes, or production deployment require explicit approval from Bastian for that specific release. No implicit approval.

## Cross-industry design rule
Do not merely recolor or rename the real-estate demo. Choose structure, imagery, interactions, conversion paths, and copy from the client's actual audience and business goal. Booking, shop, forms, CRM, analytics, payments, video, and 3D are not considered functional until configured and tested.

## Required project output
Return:
- brief and verified source facts
- audience and conversion goal
- sitemap/page plan
- creative direction
- page copy and CTA destinations
- client config and asset-rights status
- branch/preview status (if actually available)
- QA table with PASS / FAIL / NOT CHECKED
- open questions, limitations, next action
- production approval status (default false)

## Hard safety rules
- Default `previewOnly` to true.
- Never publish or alter production without explicit approval.
- Never invent business claims or imply an integration works when it does not.
- Never commit secrets, API keys, private client data, or credentials.
- If a task cannot be safely completed with available tools, state the blocker and provide the next concrete step.
