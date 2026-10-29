import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(process.cwd(), process.argv[2] || "website-studio/client-config.example.json");
const outputPath = resolve(process.cwd(), process.argv[3] || "website-studio/generated-preview.html");
const cfg = JSON.parse(await readFile(configPath, "utf8"));
let html = await readFile(resolve(dir, "universal-website-starter.html"), "utf8");
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const name = cfg.brand?.displayName || cfg.project?.clientName || "Beispielunternehmen";
const c = cfg.content || {};
const safeLink = (v, fallback) => /^(https:\/\/|mailto:|tel:|#)/i.test(String(v || "")) ? String(v) : fallback;

const pairs = [
  ["<title>Website-Konzept | Back to Outdoor</title>", "<title>" + esc(name) + " | Website-Konzept</title>"],
  ["<span>Beispielunternehmen<br>", "<span>" + esc(name) + "<br>"],
  ["Ein individueller erster Eindruck", esc(c.eyebrow || "Willkommen")],
  ["Finden Sie Ihren<br><em>Lieblingsort.</em>", esc(c.headlineLine1 || "Willkommen") + "<br><em>" + esc(c.headlineLine2 || "bei uns.") + "</em>"],
  ["Ein hochwertiges digitales Erlebnis beginnt mit einer klaren Geschichte. Diese neutrale Vorlage wird an die Marke, die Branche und das Ziel des jeweiligen Unternehmens angepasst.", esc(c.intro || "Ein hochwertiges digitales Erlebnis, abgestimmt auf Ihr Unternehmen.")],
  ['href="#angebot">Angebot entdecken ↘', 'href="' + esc(safeLink(c.primaryCtaHref, "#angebot")) + '">' + esc(c.primaryCtaLabel || "Angebot entdecken") + " ↘"],
  ['href="#kontakt">Kontakt aufnehmen</a>', 'href="' + esc(safeLink(c.secondaryCtaHref, "#kontakt")) + '">' + esc(c.secondaryCtaLabel || "Kontakt aufnehmen") + "</a>"],
  ["Website-Konzept · Back to Outdoor", "Website-Konzept · " + esc(name)]
];
for (const [from, to] of pairs) {
  if (html.includes(from)) html = html.replace(from, to);
}
html = html.replace("</body>", "\n<!-- Preview only. Check links, claims, image rights, and mobile layout before release. -->\n</body>");
await writeFile(outputPath, html, "utf8");
console.log("Preview created: " + outputPath + " (not deployed)");
