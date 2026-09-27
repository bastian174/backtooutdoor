// Temporärer Diagnose-Endpunkt: /api/debug-mail im Browser öffnen.
// Prüft den kompletten Lead-Versand-Weg über Google Apps Script (LEAD_WEBHOOK_URL).
// Nach der Fehlersuche wieder entfernen.
const { verarbeiteLead } = require("./_leads");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const env = {
    LEAD_WEBHOOK_URL_gesetzt: !!process.env.LEAD_WEBHOOK_URL,
    LEAD_SECRET_gesetzt: !!process.env.LEAD_SECRET,
  };

  let webhookRoh = null;
  try {
    const r = await fetch(process.env.LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret: process.env.LEAD_SECRET || "",
        zeit: new Date().toISOString(),
        sprache: "de",
        name: "Diagnose Test",
        firma: "Testfirma",
        email: "diagnose@example.com",
        wunsch: "Erstgespräch",
        anliegen: "Automatischer Diagnose-Test von /api/debug-mail.",
        antwort_betreff: "Test",
        antwort_text: "Das ist ein Test.",
      }),
      redirect: "follow",
    });
    const txt = await r.text();
    webhookRoh = { status: r.status, ok: r.ok, antwort: txt.slice(0, 1500) };
  } catch (e) {
    webhookRoh = { fehler_ausnahme: String(e && e.message) };
  }

  return res.status(200).json({ env, webhookRoh });
};
