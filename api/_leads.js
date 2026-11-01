// Gemeinsame Lead-Verarbeitung für /api/lead (Formular) und /api/chat (KI-Agent).
// Ablauf: Anfrage prüfen → Antwort-Mail schreiben (Claude, BTO-Regeln; sonst Vorlage)
//         → an Google Apps Script senden, das (1) info@ benachrichtigt, (2) dem Anfragenden antwortet,
//           (3) die Anfrage in die Google-Tabelle "BTO Anfragen" einträgt.
//
// Umgebungsvariablen (Vercel):
//   LEAD_WEBHOOK_URL  – optional: Web-App-URL des Google Apps Scripts (mit Anfragen-Tabelle). Ohne: Versand per FormSubmit an info@
//   LEAD_SECRET       – beliebiges Passwort, identisch im Apps Script (Schutz gegen Fremdaufrufe)
//   ANTHROPIC_API_KEY – optional: persönliche KI-Antwort statt Standardvorlage
//   MEDIA_KIT_URL     – optional: Link zum Media-Kit-PDF, wird bei Media-Kit-Anfragen mitgeschickt
//   BOOKING_URL       – optional: Link zur Terminbuchung

const { PRODUKTE, teil2Link } = require("./_produkte");

const KONTAKT = "Back to Outdoor · Salzburg\ninfo@backtooutdoor.com · +43 (0)660 8422053\nwww.backtooutdoor.com · Instagram @backtooutdoor";

// Drei Kanäle: Back to Outdoor (Outdoor-Content), Mindset Tetris (E-Books/Mindset), Immobilien (Showcase-Seite)
function kanalVon(lead) {
  const seite = String(lead.seite || "").toLowerCase();
  if (lead.typ === "Immobilien" || seite.includes("immobilien")) return "Immobilien";
  if (PRODUKTE[lead.produkt] || String(lead.produkt || "").startsWith("mindset") || /tetris|mindset/.test(seite)) return "Mindset Tetris";
  return "Back to Outdoor";
}

const KONTAKT_IMMO = "Back to Outdoor · Immobilien-Content\ninfo@backtooutdoor.com · +43 (0)660 8422053\nbacktooutdoor.com/immobilien";
const PORTFOLIO_UGC = "https://backtooutdoor.com/immobilien/ugc";

// Immobilien (Showcase-Seite): Eingangsbestätigung in Sie-Form, ohne Preise oder feste Fristen
function immoMail(lead, lang) {
  const fmt = (String(lead.anliegen || "").match(/^Format: (.+)$/m) || [])[1];
  const mitFmt = fmt && !/auswählen|offen|not sure/i.test(fmt) ? " (" + fmt + ")" : "";
  if (lang === "en") {
    return {
      betreff: "Your enquiry – Back to Outdoor",
      text: `Hello ${lead.name},\n\nthank you for your enquiry${mitFmt}. I will look at your property personally and get back to you shortly to talk about scope, formats and the best approach, whether we film on site or work with your existing material.\n\nIf you already have photos, videos or a link to the property, feel free to send them as a reply to this email. You will then get a free preview first.\n\nExamples from our portfolio: ${PORTFOLIO_UGC}\n\nBest regards\nBasti\n\nBack to Outdoor · Real Estate Content\ninfo@backtooutdoor.com · +43 (0)660 8422053\nbacktooutdoor.com/immobilien-en`,
    };
  }
  return {
    betreff: "Ihre Anfrage – Back to Outdoor",
    text: `Guten Tag ${lead.name},\n\ndanke für Ihre Anfrage${mitFmt}. Ich schaue mir Ihr Objekt persönlich an und melde mich in Kürze bei Ihnen, um Umfang, Formate und den passenden Weg zu besprechen, ob mit Dreh vor Ort oder aus Ihrem vorhandenen Material.\n\nWenn Sie schon Fotos, Videos oder einen Link zum Objekt haben, können Sie diese gern als Antwort auf diese Mail schicken. Dann sehen Sie vorab eine kostenlose Vorschau.\n\nBeispiele aus unserem Portfolio: ${PORTFOLIO_UGC}\n\nFreundliche Grüße\nBasti\n\n${KONTAKT_IMMO}`,
  };
}

// Immobilien | UGC (Portfolio-Seite): persönliche Eingangsbestätigung in Du-Form, ohne Preise, ohne Auftragszusage
function ugcMail(lead) {
  const n = vorname(lead.name);
  return {
    betreff: "Vielen Dank für deine Anfrage – Back to Outdoor",
    text: `Hallo${n ? " " + n : ""},\n\nvielen Dank für deine Nachricht und dein Interesse an Back to Outdoor.\n\nIch freue mich, dass du dich für unsere Content- und Videoproduktion interessierst. Damit du dir direkt ein Bild davon machen kannst, was möglich ist, habe ich dir hier mein Immobilien-UGC-Portfolio zusammengestellt:\n\n${PORTFOLIO_UGC}\n\nDort findest du verschiedene Beispielvideos und Formate, von authentischen UGC-Reels über Cinematic Property Films bis hin zu Video-Walkthroughs.\n\nIch schaue mir deine Anfrage persönlich an und melde mich bei dir, damit wir gemeinsam besprechen können, was am besten zu deinem Projekt passt.\n\nViele Grüße\nBastian\nBack to Outdoor | Immobilien UGC\n\ninfo@backtooutdoor.com · +43 (0)660 8422053`,
  };
}

// Mindset Tetris ohne E-Book (z. B. allgemeine Nachricht): kurze Du-Antwort
function mindsetMail(lead) {
  return {
    betreff: "Danke für deine Nachricht – Mindset Tetris",
    text: `Hallo ${vorname(lead.name)},\n\ndanke für deine Nachricht. Ich lese sie mir in Ruhe durch und melde mich persönlich bei dir.\n\nLiebe Grüße\nBasti von Mindset Tetris\n\nInstagram @mindsettetris · backtooutdoor.com/mindset`,
  };
}

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
      text: `Hi ${n},\n\nthanks for reaching out${lead.firma ? " on behalf of " + lead.firma : ""}! ${mk ? (mkUrl ? "Please find our media kit attached.\n\n" : "We'll send you our media kit personally shortly.\n\n") : ""}We'd love to hear more about your plans. The easiest next step is a short, free call (about 15 minutes)${book ? " – you can pick a time here: " + book : " – just reply with two or three times that suit you"}.\n\nTo prepare: where is your business located, and which period are you thinking of?\n\nBest regards\nBasti\n\n${KONTAKT}`,
    };
  }
  return {
    betreff: mk ? "Euer Media Kit von Back to Outdoor" : "Danke für eure Anfrage – Back to Outdoor",
    text: `Hallo ${n},\n\ndanke für eure Nachricht${lead.firma ? " – schön, von " + lead.firma + " zu hören" : ""}! ${mk ? (mkUrl ? "Unser Media Kit findet ihr im Anhang.\n\n" : "Unser Media Kit schicke ich euch gleich persönlich zu.\n\n") : ""}Am einfachsten lernen wir uns in einem kurzen, kostenlosen Gespräch kennen (ca. 15 Minuten, unverbindlich)${book ? ". Hier könnt ihr direkt einen Termin wählen: " + book : ". Schickt mir einfach zwei, drei Zeitfenster, die euch passen"}.\n\nDamit ich mich gut vorbereiten kann: Wo seid ihr zu Hause, und an welchen Zeitraum denkt ihr?\n\nLiebe Grüße\nBasti\n\n${KONTAKT}`,
  };
}

// E-Book-Funnel: Teil 1 gratis per Mail, Teil 2 als Kauf-Link (CopeCart)
function ebookMail(lead, p) {
  const n = vorname(lead.name);
  return {
    betreff: `Dein Teil 1: ${p.titel} 🧱`,
    text: `Hallo ${n},\n\nschön, dass du dabei bist! Hier ist Teil 1 von „${p.titel}“ – gratis für dich:\n${p.teil1}\n\nDarin: die Spielregeln, der Gewohnheits-Kreislauf als Bild erklärt und deine erste Beobachtungs-Aufgabe. Druck es aus oder füll es am Tablet aus – und leg gleich heute deinen ersten Stein.\n\nWenn du danach weiterspielen willst: Teil 2 hat ${p.seiten} Seiten mit 8 weiteren Leveln, Morgenroutine-Baukasten, Fokus-Modus und der 66-Tage-Challenge. Für ${p.preis}, sofort als PDF:\n${teil2Link(lead.produkt)}\n\nViel Spaß beim Stapeln!\nBasti von Mindset Tetris\n\nInstagram @mindsettetris · backtooutdoor.com/mindset`,
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
- ${lead.wunsch === "Media Kit" ? (mkUrl ? "Erwähne, dass das Media Kit als PDF im Anhang der Mail dabei ist (nicht als Link)." : "Schreib, dass du das Media Kit gleich persönlich schickst.") : "Media Kit nur erwähnen, wenn danach gefragt wurde."}
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
    produkt: s(input.produkt, 60),
    newsletter: input.newsletter === true || input.newsletter === "ja" ? "ja" : "nein",
  };
}

async function verarbeiteLead(input, lang) {
  const lead = bereinigen(input || {});
  if (!lead.name || !EMAIL_RE.test(lead.email)) return { ok: false, fehler: "ungueltig" };
  lang = ["de", "en", "fr"].includes(lang) ? lang : "de";

  const produkt = PRODUKTE[lead.produkt];
  if (lead.wunsch === "E-Book Teil 1" && !produkt) return { ok: false, fehler: "ungueltig" };
  const kanal = kanalVon(lead);
  const antwort = produkt && lead.wunsch === "E-Book Teil 1"
    ? ebookMail(lead, produkt)
    : kanal === "Immobilien" ? (lead.wunsch === "Immobilien UGC" ? ugcMail(lead) : immoMail(lead, lang))
    : kanal === "Mindset Tetris" ? mindsetMail(lead)
    : (await kiAntwort(lead, lang)) || vorlage(lead, lang === "fr" ? "en" : lang);
  const mediaKitUrl = lead.wunsch === "Media Kit" ? process.env.MEDIA_KIT_URL || "" : "";
  // Für die Mailstrecke im Apps Script (nur E-Book-Anfragen)
  const ebook = produkt ? { titel: produkt.titel, teil2: teil2Link(lead.produkt), landing: produkt.landing } : undefined;
  // Aus-Schalter: IMMO_AUTO_ANTWORT=aus in Vercel → Immobilien-Antworten nur als Gmail-Entwurf (Apps Script beachtet nur_entwurf)
  const nurEntwurf = kanal === "Immobilien" && String(process.env.IMMO_AUTO_ANTWORT || "").toLowerCase() === "aus";
  const payload = { secret: process.env.LEAD_SECRET || "", zeit: new Date().toISOString(), sprache: lang, kanal, ...lead, ebook, antwort_betreff: antwort.betreff, antwort_text: antwort.text, media_kit_url: mediaKitUrl, nur_entwurf: nurEntwurf };

  console.log("NEUER LEAD", JSON.stringify({ ...payload, secret: undefined }));
  const ergebnis = await versenden(payload);
  // Immobilien-Anfragen zusätzlich als Kopie an IMMO_MAIL – auch wenn der Hauptweg scheitert, Fehler der Kopie blockieren nichts
  if (kanal === "Immobilien" && IMMO_MAIL && IMMO_MAIL !== INFO_MAIL) await kopieAn(IMMO_MAIL, payload);
  return ergebnis;
}

async function versenden(payload) {
  // Benachrichtigung inkl. Kanal-Label in Gmail macht das Apps Script (FormSubmit blockt Server-Anfragen per Cloudflare)
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return perMail(payload); // ohne Google-Apps-Script: Versand per FormSubmit direkt an info@
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), redirect: "follow" });
    const txt = await r.text();
    let j = {};
    try { j = JSON.parse(txt); } catch (e) {}
    if (!r.ok || j.ok === false) throw new Error("Webhook " + r.status + " " + txt.slice(0, 200));
    return { ok: true, beantwortet: j.beantwortet !== false };
  } catch (e) {
    console.error("Webhook-Fehler", e.message);
    // Ersatzweg: Versand per FormSubmit, damit die Anfrage nicht verloren geht
    const alt = await perMail(payload);
    if (alt.ok) return alt;
    return { ok: false, fehler: "webhook" };
  }
}

// Versand ohne Einrichtung über FormSubmit (formsubmit.co):
//   – INFO_MAIL bekommt jede Anfrage als Mail (Tabelle mit allen Daten), INFO_MAIL_CC (optional) als Kopie
//   – der Anfragende bekommt automatisch die Antwort-Mail (_autoresponse)
// Einmalig nötig: Bei der ALLERERSTEN Anfrage an eine NEUE Adresse schickt FormSubmit eine Mail "Activate Form"
// an genau diese Adresse (auch Spam-Ordner prüfen!) → Link anklicken. Erst danach kommen echte Anfragen durch.
const INFO_MAIL = process.env.INFO_MAIL || "info@backtooutdoor.com";
const INFO_MAIL_CC = (process.env.INFO_MAIL_CC || "").split(",").map((s) => s.trim()).filter(Boolean).join(",");
async function perMail(p) {
  try {
    const r = await fetch("https://formsubmit.co/ajax/" + INFO_MAIL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        origin: "https://backtooutdoor.com",
        referer: "https://backtooutdoor.com/",
      },
      body: JSON.stringify({
        _subject: `Neue Anfrage: ${p.name}${p.firma ? " (" + p.firma + ")" : ""} – ${p.wunsch}`,
        _template: "table",
        _captcha: "false",
        _replyto: p.email,
        _autoresponse: p.antwort_text,
        ...(INFO_MAIL_CC ? { _cc: INFO_MAIL_CC } : {}),
        Eingang: new Date(p.zeit).toLocaleString("de-AT", { timeZone: "Europe/Vienna" }),
        Name: p.name,
        Firma: p.firma || "-",
        email: p.email,
        Telefon: p.telefon || "-",
        Typ: p.typ || "-",
        Wunsch: p.wunsch,
        Anliegen: p.anliegen || "-",
        Seite: p.seite || "-",
        Produkt: p.produkt || "-",
        Newsletter: p.newsletter || "nein",
        Quelle: p.quelle,
        Sprache: p.sprache,
        "Chatverlauf": p.verlauf || "-",
      }),
    });
    const txt = await r.text();
    let j = {};
    try { j = JSON.parse(txt); } catch (e) {}
    if (!r.ok || String(j.success) !== "true") throw new Error("FormSubmit " + r.status + " " + txt.slice(0, 200));
    return { ok: true, beantwortet: true };
  } catch (e) {
    console.error("Mail-Versand fehlgeschlagen", e.message);
    return { ok: false, fehler: "mail" };
  }
}

// Kopie einer Anfrage an eine weitere Adresse (ohne Auto-Antwort an den Interessenten, die kommt schon über den Hauptweg).
// Einmalig: Die erste Anfrage löst bei FormSubmit eine "Activate Form"-Mail an diese Adresse aus → Link anklicken.
const IMMO_MAIL = process.env.IMMO_MAIL || "infobacktooutdoor@gmail.com";
async function kopieAn(adresse, p) {
  try {
    const r = await fetch("https://formsubmit.co/ajax/" + adresse, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json", origin: "https://backtooutdoor.com", referer: "https://backtooutdoor.com/" },
      body: JSON.stringify({
        _subject: `Immobilien-Anfrage: ${p.name}${p.firma ? " (" + p.firma + ")" : ""}`,
        _template: "table",
        _captcha: "false",
        _replyto: p.email,
        Eingang: new Date(p.zeit).toLocaleString("de-AT", { timeZone: "Europe/Vienna" }),
        Name: p.name,
        Firma: p.firma || "-",
        email: p.email,
        Telefon: p.telefon || "-",
        Wunsch: p.wunsch,
        Anliegen: p.anliegen || "-",
        Seite: p.seite || "-",
      }),
    });
    if (!r.ok) console.error("Immo-Kopie fehlgeschlagen", r.status);
  } catch (e) {
    console.error("Immo-Kopie fehlgeschlagen", e.message);
  }
}

module.exports = { verarbeiteLead, EMAIL_RE };
