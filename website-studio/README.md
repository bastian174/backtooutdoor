# Back to Outdoor — Universal Website Studio

First foundation for a premium website workflow across hotels, tourism, trades, restaurants, property, outdoor brands, and other service businesses.

## Files
- `universal-website-starter.html`: responsive, industry-neutral page template.
- `client-config.example.json`: general example client configuration.
- `client-config.restaurant-demo.json`: restaurant example configuration.
- `render-site.mjs`: Node.js renderer for selected brand, content, CTA, color, image, and offer-card values.
- `agent-workflow.md`, `agent-team-mapping.md`, `claude-agent-integration.md`: workflow, roles, and integration contract.

## Create a preview locally
Requires Node.js. From the repository root run:

```bash
node website-studio/render-site.mjs
```

This uses the general example JSON and writes `website-studio/generated-preview.html`.

To render the restaurant example instead:

```bash
node website-studio/render-site.mjs website-studio/client-config.restaurant-demo.json website-studio/restaurant-preview.html
```

You can pass any config JSON and output path as the first and second arguments.

## Current limits
This is an early prototype, not a fully automated multi-agent product. The renderer only maps selected fields and up to three offer cards. It does not yet create arbitrary page layouts, wire booking/shop/form backends, or execute the separate Claude Project agents. The hero image is changed only if an HTTPS image URL is supplied and `heroImageRightsConfirmed` is explicitly `true`. Example card images are still generic demo images.

The script has been added to the feature branch but has **not yet been run or visually tested in this environment**. Treat generated HTML as an unverified preview, not a deliverable ready for a client. Nothing is automatically deployed.

## Release and safety rules
1. Keep all work in a preview/feature branch until explicit approval.
2. Never overwrite production files as part of a preview task.
3. Never invent customer claims, testimonials, prices, certifications, or metrics.
4. Confirm image, logo, and video usage rights.
5. Verify links, mobile layout, accessibility, and contact behavior before any release.
6. A deployment marked READY does not by itself prove the page renders correctly.
7. Do not present placeholder buttons/forms as working integrations.
