import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(process.cwd(), process.argv[2] || "website-studio/client-config.example.json");
const outputPath = resolve(process.cwd(), process.argv[3] || "website-studio/generated-preview.html");
const cfg = JSON.parse(await readFile(configPath, "utf8"));
let html = await readFile(resolve(dir, "universal-website-starter.html"), "utf8");

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[c]));
const name = cfg.brand?.displayName || cfg.project?.clientName || "Beispielunternehmen";
const brand = cfg.brand || {};
const c = cfg.content || {};
const assets = cfg.assets || {};
const colors = brand.colors || {};
const safeLink = (v, fallback = "#kontakt") => {
  const value = String(v || "").trim();
  return /^(https:\/\/|mailto:|tel:|#)/i.test(value) ? value : fallback;
};
const safeImage = (v) => {
  const value = String(v || "").trim();
  return /^https:\/\/[^\s"'<>]+$/i.test(value) && !value.includes("REPLACE_WITH") ? value : "";
};
function replaceOnce(from, to) {
  if (html.includes(from)) html = html.replace(from, to);
}

replaceOnce("<title>Website-Konzept | Back to Outdoor</title>", "<title>" + esc(name) + " | Website-Konzept</title>");
replaceOnce('<meta name="description" content="Individuelles Website-Konzept von Back to Outdoor.">', '<meta name="description" content="' + esc(c.intro || brand.tagline || "Individuelles Website-Konzept.") + '">');
replaceOnce("<span>Beispielunternehmen<br>", "<span>" + esc(name) + "<br>");
replaceOnce("INDIVIDUELLES MARKENERLEBNIS", esc(brand.tagline || "INDIVIDUELLES MARKENERLEBNIS"));
replaceOnce("Ein individueller erster Eindruck", esc(c.eyebrow || "Willkommen"));
replaceOnce("Finden Sie Ihren<br><em>Lieblingsort.</em>", esc(c.headlineLine1 || "Willkommen") + "<br><em>" + esc(c.headlineLine2 || "bei uns.") + "</em>");
replaceOnce("Ein hochwertiges digitales Erlebnis beginnt mit einer klaren Geschichte. Diese neutrale Vorlage wird an die Marke, die Branche und das Ziel des jeweiligen Unternehmens angepasst.", esc(c.intro || "Ein hochwertiges digitales Erlebnis, abgestimmt auf Ihr Unternehmen."));
replaceOnce('href="#angebot">Angebot entdecken ↘', 'href="' + esc(safeLink(c.primaryCtaHref, "#angebot")) + '">' + esc(c.primaryCtaLabel || "Angebot entdecken") + " ↘");
replaceOnce('href="#kontakt">Kontakt aufnehmen</a>', 'href="' + esc(safeLink(c.secondaryCtaHref, "#kontakt")) + '">' + esc(c.secondaryCtaLabel || "Kontakt aufnehmen") + "</a>");
replaceOnce("Website-Konzept · Back to Outdoor", "Website-Konzept · " + esc(name));

const cssNames = ["--bg", "--surface", "--text", "--muted", "--accent"];
const colorKeys = ["background", "surface", "text", "muted", "accent"];
for (let i = 0; i < cssNames.length; i++) {
  const value = colors[colorKeys[i]];
  if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) {
    const marker = cssNames[i] + ":";
    const start = html.indexOf(marker);
    const end = html.indexOf(";", start);
    if (start >= 0 && end > start) html = html.slice(0, start) + marker + value + html.slice(end);
  }
}

const heroImage = safeImage(assets.heroImage);
if (heroImage && assets.heroImageRightsConfirmed === true) {
  html = html.replace(/url\('https:\/\/images\.unsplash\.com\/photo-1449158743715-0a90ebb6d2d8[^']*'\)/, "url('" + heroImage + "')");
}

// Render up to three configured offer cards; retain safe demo cards if no sections are supplied.
if (Array.isArray(c.sections) && c.sections.length) {
  const sectionBlock = html.match(/<div class="cards">([\s\S]*?)<\/div><\/div><\/section>/);
  if (sectionBlock) {
    const defaultImages = [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80"
    ];
    const cards = c.sections.slice(0, 3).map((section, index) => {
      const image = safeImage(section.image) || defaultImages[index];
      const id = String(section.id || "bereich-" + (index + 1)).replace(/[^a-zA-Z0-9_-]/g, "");
      return '<article class="card reveal"><img src="' + esc(image) + '" alt="' + esc(section.imageAlt || section.title || "Beispielmotiv") + '" loading="lazy"><div class="card-body"><div class="eyebrow">' + esc(section.eyebrow || "Bereich " + String(index + 1).padStart(2, "0")) + '</div><h3>' + esc(section.title || "Leistung") + '</h3><p>' + esc(section.body || "") + '</p></div></article>';
    }).join("\n");
    html = html.replace(sectionBlock[1], cards);
  }
}

// Replace contact destination only when explicitly configured and valid.
const contact = String(cfg.integrations?.contactUrl || "").trim();
if (/^(https:\/\/|mailto:|tel:)/i.test(contact)) {
  replaceOnce('href="mailto:REPLACE_WITH_CONFIRMED_EMAIL"', 'href="' + esc(contact) + '"');
  replaceOnce("Kontaktweg konfigurieren →", "Kontakt aufnehmen →");
  replaceOnce("Platzhalter – vor Kundenpräsentation ersetzen.", "Kontaktweg laut Konfiguration");
}

html = html.replace("</body>", "\n<!-- Preview only. Verify claims, links, image rights, and mobile layout before release. -->\n</body>");
await writeFile(outputPath, html, "utf8");
console.log("Preview created: " + outputPath + " (not deployed)");
console.log("Note: only a configured HTTPS hero image with confirmed rights is applied.");
