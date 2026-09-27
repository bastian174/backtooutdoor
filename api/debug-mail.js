// Diagnose-Endpunkt: /api/debug-mail im Browser öffnen.
// Zeigt, welche Umgebungsvariablen gesetzt sind und was FormSubmit beim Testversand
// tatsächlich zurückgibt (Fehlertext, HTTP-Status) – NICHT die Werte selbst.
// Nach der Fehlersuche wieder entfernen (Datei löschen + hochladen).
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const env = {
    INFO_MAIL_gesetzt: !!process.env.INFO_MAIL,
    INFO_MAIL_CC_gesetzt: !!process.env.INFO_MAIL_CC,
    ANTHROPIC_API_KEY_gesetzt: !!process.env.ANTHROPIC_API_KEY,
    GEMINI_API_KEY_gesetzt: !!process.env.GEMINI_API_KEY,
    MEDIA_KIT_URL_gesetzt: !!process.env.MEDIA_KIT_URL,
    LEAD_WEBHOOK_URL_gesetzt: !!process.env.LEAD_WEBHOOK_URL,
  };

  const INFO_MAIL = process.env.INFO_MAIL || "info@backtooutdoor.com";
  const INFO_MAIL_CC = (process.env.INFO_MAIL_CC || "").split(",").map((s) => s.trim()).filter(Boolean).join(",");

  let formsubmit = null;
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
        _subject: "TEST – Diagnose (bitte ignorieren)",
        _template: "table",
        _captcha: "false",
        ...(INFO_MAIL_CC ? { _cc: INFO_MAIL_CC } : {}),
        Hinweis: "Das ist ein automatischer Diagnose-Test von /api/debug-mail.",
      }),
    });
    const txt = await r.text();
    formsubmit = { status: r.status, ok: r.ok, antwort: txt.slice(0, 1000) };
  } catch (e) {
    formsubmit = { fehler: String(e && e.message) };
  }

  return res.status(200).json({
    env,
    ziel_adresse_maskiert: INFO_MAIL.replace(/^(.{2}).*(@.*)$/, "$1***$2"),
    cc_gesetzt: !!INFO_MAIL_CC,
    formsubmit,
  });
};
