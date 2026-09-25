// Back to Outdoor – KI-Agent (Vercel Serverless Function)
// Endpunkt: POST /api/chat   Body: { messages: [{role:"user"|"assistant", content:"..."}], page: "/index.html", lang: "de" }
//
// Umgebungsvariablen in Vercel (Project → Settings → Environment Variables):
//   GEMINI_API_KEY      (Pflicht)  – kostenloser Key aus Google AI Studio (aistudio.google.com → "Get API key")
//   GEMINI_MODEL        (optional) – Standard: gemini-2.5-flash
//   ANTHROPIC_API_KEY   (optional) – falls später Claude genutzt werden soll; wird nur verwendet, wenn KEIN Gemini-Key gesetzt ist
//   ANTHROPIC_MODEL     (optional) – Standard: claude-haiku-4-5
//   LEAD_WEBHOOK_URL / LEAD_SECRET – Google Apps Script für Mail an info@, Auto-Antwort und Anfragen-Liste (siehe api/_leads.js)
//   BOOKING_URL         (optional) – Link zur Terminbuchung (z. B. Google-Kalender-Terminbuchungsseite)

const { verarbeiteLead } = require("./_leads");

const MAX_TURNS = 24;          // max. Nachrichten pro Gespräch
const MAX_CHARS = 1500;        // max. Länge einer Nutzer-Nachricht

const WISSEN = `
# Über Back to Outdoor
- Outdoor Content Studio aus Salzburg (Österreich), gegründet und geführt von Bastian (Basti) Prein. Einsatz weltweit, Schwerpunkt deutschsprachiger Raum und Europa.
- Claim: "Content, der bewegt – draußen wie digital." Website-Hero: "Content, der Outdoor-Marken zu Buchungen macht."
- Was wir machen: professionelle Video-, Foto- und UGC-Produktion direkt vor Ort beim Outdoor- oder Reiseangebot. Fertiger Social-Media-Content (Reels, Fotos), der zeigt, was Gäste wirklich erleben – keine gestellte Studio-Werbung.
- Zielgruppen: (1) Outdoor-Marken & Adventure-Brands, (2) Tourenanbieter & Erlebnis-Agenturen, (3) Hotels & Destinationen.
- Warum wir: Outdoor-Spezialisten statt Agentur (wir filmen, was wir selbst erleben), Premium-Content mit Wirkung (gemacht, um Buchungen zu bringen), verlässliche Partnerschaft statt Einzeldreh.
- Vergleich: Inhouse = auf Dauer teuer, bindet Personal, meist ohne Outdoor-Erfahrung. Große Agentur = generisch, wenig Vor-Ort-Wissen, lange Abstimmungswege. Back to Outdoor = Profis, die selbst vor Ort dabei sind.

# Angebotspakete (keine öffentlichen Preise!)
1. Content Tag – ein Drehtag direkt vor Ort; fertig geschnittene Reels + bearbeitete Fotos für Social Media und Website. Idealer Einstieg, keine langfristige Bindung. Content in der Regel wenige Tage nach dem Dreh.
2. Content Serie – mehrere Drehtage über einen festgelegten Zeitraum; durchdachtes Set an Reels und Fotos (Social Media, Website, optional YouTube) plus kurze Content-Roadmap. Ideal für Saisonhighlights, neue Erlebnisse, wiederkehrende Touren.
3. Content Studio Partnerschaft – laufende Zusammenarbeit mit regelmäßigen Drehterminen und gemeinsamem Redaktionsplan; laufender Content-Strom aus Foto, Video und UGC; Marken/Ausrüstung werden organisch eingebunden; regelmäßige kurze Abstimmung. Für Marken, Hotels, Destinationen, die langfristig denken.
Zusatz: Gäste-Videos – bei begleiteten Touren können Gäste ihr persönliches Video direkt vor Ort kaufen (zusätzliche Einnahmequelle für den Anbieter) oder der Anbieter schenkt es ihnen. Kombinierbar mit jedem Paket.
Preise: individuell je nach Umfang (Tourgröße, Häufigkeit, Einzelerlebnis vs. Partnerschaft). Angebot nach einem kurzen, kostenlosen Erstgespräch (ca. 15 Minuten, unverbindlich, ohne Verkaufsdruck).

# Ablauf einer Zusammenarbeit
1. Kurzes Erstgespräch – wir schauen uns euren aktuellen Auftritt an und finden Potenzial.
2. Vorschlag & Planung – konkreter Plan inkl. Umfang und Zeitrahmen.
3. Umsetzung vor Ort – wir produzieren, ihr bekommt fertigen Content für Kampagne, Feed und Website.

# Referenzen / Portfolio (Seite: /portfolio.html)
- Salzburg, Österreich: Rafting & Canyoning – Wildwasser-Content am Heimatfluss im Salzburger Land.
- Steiermark / Nationalpark Gesäuse: Kajak & Rafting.
- Verdon, Frankreich: Aquatrekking & Rafting – mehrtägige Begleitung für einen internationalen Tourenanbieter.
- Sierra de Guara / Pyrenäen und Südfrankreich: Canyoning.
- Namibia: Reise- und Safari-Content für eine Gästefarm.
Das vollständige Portfolio und das Media Kit (PDF: Leistungen, Ablauf, Referenzarbeiten) schicken wir auf Anfrage zu.

# Ausrüstung (grob)
Action-Cams (GoPro/Insta360), spiegellose Systemkamera, Smartphone. Keine Drohne – nicht anbieten oder versprechen.

# Weitere Seiten
Journal (/journal.html): Artikel zu Philosophie ("Warum Outdoor-Abenteuer die beste Schule fürs Leben sind"), Touren (Wildwasser-Touren in Salzburg), Ausrüstung. Über uns (/about.html). Shop (/shop.html): Reiseführer-Empfehlungen (Affiliate-Links). Impressum, AGB, Datenschutz verlinkt im Footer.

# Gratis-Leitfaden (Leadmagnet)
"5 Reels, die aus Interessenten Gäste machen" – kostenloser PDF-Leitfaden für Tourenanbieter & Hotels (9 Seiten, ohne Anmeldung): 5 Reel-Formate (Erleben, Überwinden, Verstehen, Erzählen, Menschen bewegen) mit Hook-Beispielen, Dreh-Checkliste und 5-Wochen-Plan. Seite: /leitfaden.html. Gern anbieten, wenn jemand selbst Content drehen will oder noch nicht bereit für ein Gespräch ist.

# Kontakt
E-Mail info@backtooutdoor.com · Telefon/WhatsApp +43 (0)660 8422053 · Instagram @backtooutdoor · Antwort innerhalb von zwei Werktagen.
`;

function systemPrompt(lang, page, bookingUrl) {
  return `Du bist der KI-Assistent auf der Website von "Back to Outdoor", einem Outdoor Content Studio aus Salzburg. Du sprichst für das Team ("wir").

Deine Aufgaben:
1. Fragen von Besuchern (Hotels, Tourenanbieter, Outdoor-Marken, Destinationen) zu Leistungen, Ablauf, Referenzen und Zusammenarbeit beantworten – NUR auf Basis des Wissens unten.
2. Interessenten qualifizieren: freundlich herausfinden, wer sie sind (Firma, Art des Angebots, Region), was sie brauchen und in welchem Zeitraum.
3. Zum nächsten Schritt führen: kostenloses Erstgespräch vereinbaren oder Media Kit anfordern. Sobald jemand Interesse zeigt, frag nach Name, Firma und E-Mail (Telefon optional). Hast du mindestens Name + E-Mail und ein Anliegen, rufe das Tool "lead_erfassen" auf (mit Telefon, Firma, Typ und Wunsch, falls bekannt). War es erfolgreich, sag, dass gerade eine Bestätigungs-Mail unterwegs ist und sich Basti persönlich meldet.${bookingUrl ? `\n   Für einen direkten Termin kannst du diesen Buchungslink nennen: ${bookingUrl}` : ""}

Regeln:
- Antworte in der Sprache des Besuchers (Seitensprache: ${lang}). Deutsch immer mit korrekten Umlauten.
- Kurz und natürlich: 1–4 Sätze, höchstens eine Rückfrage pro Antwort. Keine langen Listen, kein Markdown außer gelegentlich **fett**.
- Nenne NIEMALS Preise, Tagessätze oder Preisspannen – auch nicht geschätzt. Erkläre stattdessen, dass Preise individuell sind, und biete das Erstgespräch an.
- Erfinde nichts: keine Kundennamen, Zahlen, Termine, Verfügbarkeiten, Leistungen (z. B. keine Drohnenaufnahmen) oder Garantien, die nicht im Wissen stehen. Wenn du etwas nicht weißt, sag das und biete an, die Frage ans Team weiterzugeben.
- Du kannst keine Termine fest zusagen und keine Verträge schließen.
- Keine Social-Media-Betreuung/Community-Management als Leistung anbieten – wir produzieren Content.
- Bleib beim Thema Back to Outdoor. Bei fremden Themen freundlich zurückführen.
- Endkunden, die eine Tour buchen wollen: freundlich erklären, dass Back to Outdoor selbst keine Touren verkauft, sondern Content für Anbieter produziert.
- Aktuelle Seite des Besuchers: ${page || "unbekannt"}.

WISSEN:
${WISSEN}`;
}

const TOOLS = [
  {
    name: "lead_erfassen",
    description:
      "Übergibt eine Anfrage an das Back-to-Outdoor-Team. Nur aufrufen, wenn der Besucher Name und E-Mail genannt hat und Interesse an einem Gespräch, Angebot oder dem Media Kit hat.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        firma: { type: "string" },
        telefon: { type: "string" },
        typ: { type: "string", enum: ["Hotel", "Tourenanbieter", "Outdoor-Marke", "Destination", "Sonstiges"] },
        anliegen: { type: "string", description: "Kurze Zusammenfassung: was, wo, wann, welches Paket" },
        wunsch: { type: "string", enum: ["Erstgespräch", "Media Kit", "Angebot", "Frage"] },
      },
      required: ["name", "email", "anliegen"],
    },
  },
];

async function sendLead(lead, meta) {
  // Mail an info@, automatische Antwort an den Anfragenden, Eintrag in die Anfragen-Liste
  const r = await verarbeiteLead({ ...lead, quelle: "Website-Chat (KI)", seite: meta.page, verlauf: meta.verlauf }, meta.lang);
  return { ok: r.ok, bestaetigung_per_mail: !!r.ok, hinweis: r.ok ? "Anfrage übermittelt, Antwort-Mail ist unterwegs" : "Übermittlung fehlgeschlagen – bitte Besucher bitten, an info@backtooutdoor.com zu schreiben" };
}

function anbieter() {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  return null;
}

async function callClaude(body) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Anthropic API ${r.status}: ${await r.text()}`);
  return r.json();
}

async function callGemini(model, body) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Gemini API ${r.status}: ${await r.text()}`);
  return r.json();
}

// Gesprächsschleife mit Gemini (inkl. Tool "lead_erfassen")
async function mitGemini({ messages, system, meta }) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const tools = [{ functionDeclarations: TOOLS.map((t) => ({ name: t.name, description: t.description, parameters: t.input_schema })) }];
  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  let leadGesendet = false;
  for (let i = 0; i < 3; i++) {
    const data = await callGemini(model, {
      systemInstruction: { parts: [{ text: system }] },
      contents,
      tools,
      generationConfig: { maxOutputTokens: 800, temperature: 0.6, thinkingConfig: { thinkingBudget: 0 } },
    });
    const content = data.candidates && data.candidates[0] && data.candidates[0].content;
    const parts = (content && content.parts) || [];
    const calls = parts.filter((p) => p.functionCall);
    if (!calls.length) {
      const text = parts.filter((p) => typeof p.text === "string" && !p.thought).map((p) => p.text).join("\n").trim();
      return { reply: text, lead: leadGesendet };
    }
    contents.push({ role: "model", parts });
    const antworten = [];
    for (const c of calls) {
      const r = await sendLead(c.functionCall.args || {}, meta);
      leadGesendet = leadGesendet || r.ok;
      antworten.push({ functionResponse: { name: c.functionCall.name, response: r } });
    }
    contents.push({ role: "user", parts: antworten });
  }
  return { reply: "Danke! Wir haben deine Anfrage erhalten und melden uns innerhalb von zwei Werktagen.", lead: leadGesendet };
}

// Gesprächsschleife mit Claude (Fallback)
async function mitClaude({ messages, system, meta }) {
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
  const convo = messages.slice();
  let leadGesendet = false;
  for (let i = 0; i < 3; i++) {
    const data = await callClaude({ model, max_tokens: 600, system, tools: TOOLS, messages: convo });
    const toolUses = (data.content || []).filter((b) => b.type === "tool_use");
    if (data.stop_reason !== "tool_use" || !toolUses.length) {
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      return { reply: text, lead: leadGesendet };
    }
    convo.push({ role: "assistant", content: data.content });
    const results = [];
    for (const tu of toolUses) {
      const r = await sendLead(tu.input || {}, meta);
      leadGesendet = leadGesendet || r.ok;
      results.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(r) });
    }
    convo.push({ role: "user", content: results });
  }
  return { reply: "Danke! Wir haben deine Anfrage erhalten und melden uns innerhalb von zwei Werktagen.", lead: leadGesendet };
}

function clean(messages) {
  if (!Array.isArray(messages)) return [];
  const out = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (out.length && out[0].role !== "user") out.shift();
  // aufeinanderfolgende Nachrichten gleicher Rolle zusammenführen
  const merged = [];
  for (const m of out) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += "\n\n" + m.content;
    else merged.push({ ...m });
  }
  return merged;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const kiAnbieter = anbieter();
  if (req.method === "GET") return res.status(200).json({ ok: true, aktiv: !!kiAnbieter, anbieter: kiAnbieter, booking: process.env.BOOKING_URL || null });
  if (req.method !== "POST") return res.status(405).json({ error: "Nur POST" });
  if (!kiAnbieter) return res.status(503).json({ error: "kein_api_key" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const messages = clean(body && body.messages);
  if (!messages.length) return res.status(400).json({ error: "Keine Nachricht" });

  const lang = ["de", "en", "fr"].includes(body.lang) ? body.lang : "de";
  const page = String(body.page || "").slice(0, 100);
  const system = systemPrompt(lang, page, process.env.BOOKING_URL);
  const meta = { page, lang, verlauf: messages.map((m) => `${m.role}: ${m.content}`).join("\n").slice(-4000) };

  try {
    const out = kiAnbieter === "gemini" ? await mitGemini({ messages, system, meta }) : await mitClaude({ messages, system, meta });
    if (!out.reply) throw new Error("Leere Antwort vom KI-Modell");
    return res.status(200).json(out);
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "agent_fehler" });
  }
};
