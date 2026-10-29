# Back to Outdoor — Universal Website Studio

This folder is the first practical foundation for the cross-industry premium website workflow.

## What is here

- `universal-website-starter.html`: a neutral, responsive starter page that is not tied to real estate.
- `client-config.example.json`: example client profile that describes the business, brand, content, and main conversion goal.
- `agent-workflow.md`: responsibilities and handoffs for the specialist AI agents.
- `agent-team-mapping.md`: maps the existing Claude roles to the website workflow.
- `claude-agent-integration.md`: the concrete handoff contract, project record, release gates, and honest implementation status.

## Current status

This is a starter kit, not yet a fully automated multi-agent product. The page is intentionally static and uses clearly marked sample content. It does not publish a client site or send form submissions. The contact action is a placeholder until a real destination/backend is configured.

## First manual test

1. Open `universal-website-starter.html` in a browser or through a Vercel preview.
2. Replace the sample brand, headline, sections, and image URLs using an approved client profile.
3. Check the result on desktop and mobile.
4. Verify every link and contact action.
5. Keep it in preview until the user explicitly approves publication.

## Safety rules

- Never overwrite production files as part of a preview task.
- Never invent customer claims, testimonials, prices, certifications, or metrics.
- Confirm image, logo, and video usage rights.
- A deployment marked READY does not by itself prove the page renders correctly.
- Do not present placeholder buttons/forms as working integrations.
