// Gemeinsame Lead-Verarbeitung für /api/lead (Formular) und /api/chat (KI-Agent).
// Ablauf: Anfrage prüfen → Antwort-Mail schreiben (Claude, BTO-Regeln; sonst Vorlage)
//         → an Google Apps Script senden, das (1) info@ benachrichtigt, (2) dem Anfragenden antwortet,
//           (3) die Anfrage in die Google-Tabelle "BTO Anfragen" einträgt.
//
// Umgebungsvariablen (Vercel):
//   LEAD_WEBHOOK_URL  – Web-App-URL des Google Apps Scripts (Pflicht für automatischen Versand)
//   LEAD_SECRET       – beliebiges Passwort, identisch im Apps Script (Schutz gegen Fremdaufrufe)
//   ANTHROPIC_API_KEY – optional: persönliche KI-Antwort statt Standardvorlage
//   MEDIA_KIT_URL     – optional: Link zum Media-Kit-PDF, wird bei Media-Kit-Anfragen mitgeschickt
//   BOOKING_URL       – optional: Link zur Terminbuchung

const KONTAKT = "Back to Outdoor · Salzburg\ninfo@backtooutdoor.com · +43 (0)660 8422053\nwww.backtooutdoor.com · Instagram @backtooutdoor";

function vorname(name) {
  return String(name || "").trim().split(/\s+/)[0] || "";
}

function vorlage(lead, lang) {
  const n = vorname(lead.name);
  const mk = lead.wunsch === "Media Kit";
  const mkUrl = process.env.MEDIA_KIT_URL;
  const book = process.env.BOOKING_URL;
  if (lang === "en") {
    return {
      betreff: mk ? "Your Back to Outdoor media kit" : "Thanks for your enquiry – Back to Outdoor",
      text: `Hi ${n},\n\nthanks for reaching out${lead.firma ? " on behalf of " + lead.firma : ""}! ${mk ? (mkUrl ? "Here is our media kit: " + mkUrl + "\n\n" : "We'll send you our media kit personally shortly.\n\n") : ""}We'd love to hear more about your plans. The easiest next step is a short, free call (about 15 minutes)${book ? " – you can pick a time here: " + book : " – just reply with two or three times that suit you"}.\n\nTo prepare: where is your business located, and which period are you thinking of?\n\nBest regards\nBasti\n\n${KONTAKT}`,
    };
  }
  return {
    betreff: mk ? "Euer Media Kit von Back to Outdoor" : "Danke für eure Anfrage – Back to Outdoor",
    text: `Hallo ${n},\n\ndanke für eure Nachricht${lead.firma ? " – schön, von " + lead.firma + " zu hören" : ""}! ${mk ? (mkUrl ? "Hier ist unser Media Kit: " + mkUrl + "\n\n" : "Unser Media Kit schicke ich euch gleich persönlich zu.\n\n") : ""}Am einfachsten lernen wir uns in einem kurzen, kostenlosen Gespräch kennen (ca. 15 Minuten, unverbindlich)${book ? ". Hier könnt ihr direkt einen Termin wählen: " + book : ". Schickt mir einfach zwei, drei Zeitfenster, die euch passen"}.\n\nDamit ich mich gut vorbereiten kann: Wo seid ihr zu Hause, und an welchen Zeitraum denkt ihr?\n\nLiebe Grüße\nBasti\n\n${KONTAKT}`,
  };
}

// Rolle Titan (Antwort) → Jasper (Check), in einem Aufruf
async function kiAntwort(lead, lang) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const mkUrl = process.env.MEDIA_KIT_URL;
  const book = process.env.BOOKING_URL;
  const system = `Du schreibst als Basti von "Back to Outdoor" (Outdoor Content Studio aus Salzburg: Foto-, Video- und UGC-Content direkt vor Ort für Hotels, Tourenanbieter, Outdoor-Marken, Destinationen) die erste Antwort-Mail auf eine Website-Anfrage.
Arbeite in zwei Schritten: erst als "Titan" die Antwort entwerfen, dann als "Jasper" streng prüfen und verbessern (klar? glaubwürdig? zu werblich? Regeln eingehalten?). Gib NUR das Endergebnis aus.

Pakete (nur nennen, wenn es zur Anfrage passt): Content Tag (ein Drehtag, fertige Reels + Fotos, idealer Einstieg), Content Serie (mehrere Drehtage, zusammenhängende Geschichte), Content Studio Partnerschaft (laufend, Redaktionsplan), Zusatz Gäste-Videos (Gäste kaufen ihr Video vor Ort).
Regeln:
- Sprache: ${lang === "en" ? "Englisch" : lang === "fr" ? "Französisch" : "Deutsch mit korrekten Umlauten"}. Anrede "Hallo <Vorname>", danach "ihr/euch" (wie auf der Website).
- 80–150 Wörter. Bezieh dich konkret auf das Anliegen, ohne es nur zu wiederholen.
- Ziel: kostenloses Erstgespräch (ca. 15 Min., unverbindlich). ${book ? "Terminlink: " + book : "Bitte um zwei, drei passende Zeitfenster."}
- Höchstens zwei konkrete Rückfragen (z. B. Region, Zeitraum, welches Erlebnis).
- ${lead.wunsch === "Media Kit" ? (mkUrl ? "Media Kit als Link mitschicken: " + mkUrl : "Schreib, dass du das Media Kit gleich persönlich schickst.") : "Media Kit nur erwähnen, wenn danach gefragt wurde."}
- NIEMALS Preise, Tagessätze, Rabatte oder Preisspannen. Keine Terminzusagen, keine Verfügbarkeiten, keine Garantien, keine erfundenen Kunden, Zahlen oder Referenzen. Keine Drohnenaufnahmen versprechen. Keine Social-Media-Betreuung anbieten. Keine Affiliate-Links.
- Kein Marketing-Sprech, keine Emojis, keine Ausrufezeichen-Ketten. Unterschrift: "Liebe Grüße\\nBasti" (EN: "Best regards\\nBasti").
Antworte ausschließlich als JSON: {"betreff":"...","text":"..."} – ohne Kontaktblock, der wird automatisch angehängt.`;
  const user = `Anfrage:\nName: ${lead.name}\nFirma: ${lead.firma || "-"}\nTyp: ${lead.typ || "-"}\nWunsch: ${lead.wunsch || "-"}\nAnliegen: ${lead.anliegen || "-"}${lead.verlauf ? "\n\nChatverlauf (Auszug):\n" + String(lead.verlauf).slice(-2000) : ""}`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5", max_tokens: 700, system, messages: [{ role: "user", content: user }] }),
    });
    if (!r.ok) throw new Error("API " + r.status);
    const d = await r.json();
    const raw = (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const m = raw.match(/\{[\s\S]*\}/);
    const j = JSON.parse(m ? m[0] : raw);
    if (!j.betreff || !j.text) throw new Error("leer");
    // Sicherheitsnetz: nie Preise verschicken
    if (/€|\beuro\b|\bEUR\b|\d+\s?(,-|€)|tagessatz|rabatt/i.test(j.text)) throw new Error("Preis erkannt");
    return { betreff: j.betreff.slice(0, 150), text: j.text.trim() + "\n\n" + KONTAKT };
  } catch (e) {
    console.error("KI-Antwort fehlgeschlagen, nutze Vorlage:", e.message);
    return null;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function bereinigen(input) {
  const s = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
  return {
    name: s(input.name, 120),
    firma: s(input.firma, 160),
    email: s(input.email, 200).toLowerCase(),
    telefon: s(input.telefon, 60),
    typ: s(input.typ, 60),
    wunsch: s(input.wunsch, 40) || "Erstgespräch",
    anliegen: String(input.anliegen == null ? "" : input.anliegen).trim().slice(0, 3000),
    verlauf: String(input.verlauf || "").slice(-4000),
    seite: s(input.seite, 120),
    quelle: s(input.quelle, 40) || "Website",
  };
}

async function verarbeiteLead(input, lang) {
  const lead = bereinigen(input || {});
  if (!lead.name || !EMAIL_RE.test(lead.email)) return { ok: false, fehler: "ungueltig" };
  lang = ["de", "en", "fr"].includes(lang) ? lang : "de";

  const antwort = (await kiAntwort(lead, lang)) || vorlage(lead, lang === "fr" ? "en" : lang);
  const payload = { secret: process.env.LEAD_SECRET || "", zeit: new Date().toISOString(), sprache: lang, ...lead, antwort_betreff: antwort.betreff, antwort_text: antwort.text };

  console.log("NEUER LEAD", JSON.stringify({ ...payload, secret: undefined }));
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return { ok: false, fehler: "kein_webhook", lead };
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), redirect: "follow" });
    const txt = await r.text();
    let j = {};
    try { j = JSON.parse(txt); } catch (e) {}
    if (!r.ok || j.ok === false) throw new Error("Webhook " + r.status + " " + txt.slice(0, 200));
    return { ok: true, beantwortet: j.beantwortet !== false };
  } catch (e) {
    console.error("Webhook-Fehler", e.message);
    return { ok: false, fehler: "webhook" };
  }
}

module.exports = { verarbeiteLead, EMAIL_RE };
