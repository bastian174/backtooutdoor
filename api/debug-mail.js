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

  let ergebnis = null;
  try {
    ergebnis = await verarbeiteLead(
      {
        name: "Diagnose Test",
        firma: "Testfirma",
        email: "diagnose@example.com",
        telefon: "",
        typ: "Hotel",
        wunsch: "Erstgespräch",
        anliegen: "Automatischer Diagnose-Test von /api/debug-mail.",
        seite: "/test",
        quelle: "Diagnose",
      },
      "de"
    );
  } catch (e) {
    ergebnis = { fehler_ausnahme: String(e && e.message) };
  }

  return res.status(200).json({ env, ergebnis });
};
