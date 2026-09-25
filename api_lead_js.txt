// POST /api/lead – Anfrageformular (Chat-Widget & Website-Buttons)
const { verarbeiteLead } = require("./_leads");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.status(200).json({ ok: true, versand: !!process.env.LEAD_WEBHOOK_URL });
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  // Spam-Schutz: verstecktes Feld muss leer sein, Formular darf nicht in < 2 s abgeschickt sein
  if (b.website || (b.t && Date.now() - Number(b.t) < 2000)) return res.status(200).json({ ok: true });

  const r = await verarbeiteLead({ ...b, quelle: "Website-Formular" }, b.lang);
  if (r.ok) return res.status(200).json({ ok: true, beantwortet: r.beantwortet });
  if (r.fehler === "ungueltig") return res.status(400).json({ ok: false, fehler: "ungueltig" });
  return res.status(503).json({ ok: false, fehler: r.fehler });
};
