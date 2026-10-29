# Back to Outdoor — Universal Website Studio

First foundation for a premium website workflow across hotels, tourism, trades, restaurants, property, outdoor brands, and other service businesses.

## Files
- `universal-website-starter.html`: responsive, industry-neutral page template.
- `client-config.example.json`: example client/brand/content configuration.
- `render-site.mjs`: minimal Node.js renderer that replaces a first set of template values from a JSON config.
- `agent-workflow.md`, `agent-team-mapping.md`, `claude-agent-integration.md`: workflow, roles, and integration contract.

## Create a preview locally
Requires Node.js. From the repository root run:

```bash
node website-studio/render-site.mjs
```

This uses the example JSON and writes `website-studio/generated-preview.html`. To use another config and output path:

```bash
node website-studio/render-site.mjs path/to/client-config.json path/to/preview.html
```

The renderer is an early prototype: it currently replaces only the business name, hero copy, CTA labels/links, and footer label. It does not yet render arbitrary sections, images, booking, shop, forms, or external agent runs. Run and visually test it before relying on the output; no generated page is automatically deployed.

## Current status
This is not yet a fully automated multi-agent product. Claude Code adapters and a skill are included, but they are not connected to separately configured Claude Project agents. The starter page uses sample content. It does not publish client sites or submit forms.

## Release and safety rules
1. Keep all work in a preview/feature branch until explicit approval.
2. Never overwrite production files as part of a preview task.
3. Never invent customer claims, testimonials, prices, certifications, or metrics.
4. Confirm image, logo, and video usage rights.
5. Verify links, mobile layout, accessibility, and contact behavior before any release.
6. A deployment marked READY does not by itself prove the page renders correctly.
7. Do not present placeholder buttons/forms as working integrations.
