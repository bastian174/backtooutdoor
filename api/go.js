// GET /api/go?l=<slug> – Klick-Tracking für Kooperations-/Affiliate-Links.
// Loggt jeden Klick (Datum, Link, verweisende Seite) über den bestehenden Google-Apps-Script-
// Webhook (gleiche Tabelle "BTO Anfragen", eigener Tab "Klicks") und leitet dann sofort weiter.
//
// Ziel-URLs sind fest hinterlegt (kein offener Redirect). Neue Kooperation? Unten in ZIELE ergänzen.
//
// Umgebungsvariablen (Vercel, bereits vorhanden):
//   LEAD_WEBHOOK_URL – Web-App-URL des Google Apps Scripts
//   LEAD_SECRET      – Passwort, identisch im Apps Script

const ZIELE = {
  "torrent-outdoor": "https://shop.peak-infinity.eu/de/102",
};

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const slug = String(req.query.l || "");
  const ziel = ZIELE[slug];

  if (!ziel) {
    return res.status(404).send("Unbekannter Link.");
  }

  if (process.env.LEAD_WEBHOOK_URL) {
    const payload = {
      secret: process.env.LEAD_SECRET || "",
      art: "klick",
      link: slug,
      ziel,
      seite: req.headers.referer || "",
      zeit: new Date().toISOString(),
    };
    try {
      await withTimeout(
        fetch(process.env.LEAD_WEBHOOK_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null),
        1500
      );
    } catch (e) {
      // Logging darf die Weiterleitung nie verzögern oder blockieren.
    }
  }

  res.writeHead(302, { Location: ziel });
  res.end();
};
