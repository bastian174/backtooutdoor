import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const studioDir = dirname(fileURLToPath(import.meta.url));
const repoDir = resolve(studioDir, "..");
const renderer = resolve(studioDir, "render-site.mjs");
const restaurantConfig = resolve(studioDir, "client-config.restaurant-demo.json");
const tempDir = await mkdtemp(resolve(tmpdir(), "website-studio-test-"));

try {
  const restaurantOutput = resolve(tempDir, "restaurant-preview.html");
  const restaurantRun = spawnSync(
    process.execPath,
    [renderer, restaurantConfig, restaurantOutput],
    { cwd: repoDir, encoding: "utf8" }
  );
  assert.equal(restaurantRun.status, 0, restaurantRun.stderr || restaurantRun.stdout);
  const restaurantHtml = await readFile(restaurantOutput, "utf8");

  for (const expected of [
    "<title>Musterküche | Website-Konzept</title>",
    "Regional genießen. Gemeinsam erleben.",
    "Gutes Essen.",
    "Saisonal und regional",
    "Platz zum Zusammenkommen",
    "#d69b55",
    "Preview only. Verify claims, links, image rights, and mobile layout before release."
  ]) {
    assert.ok(restaurantHtml.includes(expected), `Expected generated HTML to contain: ${expected}`);
  }
  assert.ok(!restaurantHtml.includes("REPLACE_WITH_APPROVED_IMAGE_URL"));
  assert.ok(restaurantHtml.includes("not deployed") || restaurantRun.stdout.includes("(not deployed)"));

  const unsafeConfigPath = resolve(tempDir, "unsafe-config.json");
  const unsafeOutput = resolve(tempDir, "unsafe-preview.html");
  const unsafeConfig = {
    brand: { displayName: '<script>alert("x")</script>' },
    content: {
      headlineLine1: "<img src=x onerror=alert(1)>",
      primaryCtaLabel: "Click",
      primaryCtaHref: "javascript:alert(1)",
      sections: [{ title: "<script>bad()</script>", body: "Test & verify" }]
    },
    integrations: { contactUrl: "javascript:alert(1)" }
  };
  await writeFile(unsafeConfigPath, JSON.stringify(unsafeConfig), "utf8");
  const unsafeRun = spawnSync(
    process.execPath,
    [renderer, unsafeConfigPath, unsafeOutput],
    { cwd: repoDir, encoding: "utf8" }
  );
  assert.equal(unsafeRun.status, 0, unsafeRun.stderr || unsafeRun.stdout);
  const unsafeHtml = await readFile(unsafeOutput, "utf8");
  assert.ok(!unsafeHtml.includes('<script>alert("x")</script>'));
  assert.ok(!unsafeHtml.includes("<img src=x onerror=alert(1)>"));
  assert.ok(!unsafeHtml.includes('href="javascript:alert(1)"'));
  assert.ok(unsafeHtml.includes("&lt;script&gt;bad()&lt;/script&gt;"));
  console.log("Renderer tests passed: restaurant content, brand color, placeholder image handling, and unsafe input escaping.");
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
