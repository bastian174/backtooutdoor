/* Back to Outdoor – KI-Agent Chat-Widget
   Einbinden: <script src="/agent.js" defer></script> vor </body>
   Spricht mit /api/chat. Ohne API-Key läuft ein Offline-Modus mit FAQ-Antworten + Anfrageformular. */
(function () {
  if (window.__btoAgent) return; window.__btoAgent = true;

  var API = "/api/chat";
  var MAIL = "info@backtooutdoor.com";
  var PHONE = "+43 (0)660 8422053";
  var WA = "https://wa.me/436608422053";
  var lang = (document.documentElement.lang || "de").slice(0, 2);
  if (["de", "en", "fr"].indexOf(lang) < 0) lang = "de";

  var T = {
    de: {
      title: "Back to Outdoor", sub: "KI-Assistent · antwortet sofort",
      hello: "Servus! 👋 Ich bin der KI-Assistent von Back to Outdoor. Ich beantworte Fragen zu unseren Content-Paketen, zum Ablauf und zu Referenzen – oder helfe dir, ein kostenloses Erstgespräch anzufragen. Wobei kann ich helfen?",
      chips: ["Welche Pakete gibt es?", "Was kostet das?", "Kostenloses Gespräch vereinbaren", "Media Kit anfordern"],
      ph: "Nachricht schreiben …", send: "Senden", open: "Fragen? Chat öffnen", close: "Chat schließen",
      note: "KI-Assistent – Antworten können Fehler enthalten. ", privacy: "Datenschutz",
      err: "Da ist gerade etwas schiefgelaufen. Schreib uns gern direkt an " + MAIL + ".",
      form: { title: "Kostenloses Erstgespräch anfragen", name: "Name *", firma: "Firma / Betrieb", email: "E-Mail *", typ: "Wir sind …", typen: ["Hotel", "Tourenanbieter", "Outdoor-Marke", "Destination", "Sonstiges"], msg: "Worum geht es? (Region, Zeitraum, Idee)", submit: "Anfrage senden", cancel: "Abbrechen", ok: "Danke! Dein E-Mail-Programm öffnet sich mit der fertigen Anfrage – einfach absenden. Wir melden uns innerhalb von zwei Werktagen.", req: "Bitte Name und eine gültige E-Mail angeben." },
      subject: "Anfrage über den Website-Chat"
    },
    en: {
      title: "Back to Outdoor", sub: "AI assistant · instant answers",
      hello: "Hi! 👋 I'm the Back to Outdoor AI assistant. Ask me about our content packages, how a project works and our references – or let me help you request a free intro call. How can I help?",
      chips: ["What packages do you offer?", "What does it cost?", "Book a free intro call", "Request the media kit"],
      ph: "Write a message …", send: "Send", open: "Questions? Open chat", close: "Close chat",
      note: "AI assistant – answers may contain mistakes. ", privacy: "Privacy",
      err: "Something went wrong. Feel free to email us at " + MAIL + ".",
      form: { title: "Request a free intro call", name: "Name *", firma: "Company", email: "Email *", typ: "We are a …", typen: ["Hotel", "Tour operator", "Outdoor brand", "Destination", "Other"], msg: "What is it about? (region, timing, idea)", submit: "Send request", cancel: "Cancel", ok: "Thanks! Your email app opens with the request ready – just hit send. We'll reply within two working days.", req: "Please enter your name and a valid email." },
      subject: "Enquiry via website chat"
    },
    fr: {
      title: "Back to Outdoor", sub: "Assistant IA · réponse immédiate",
      hello: "Bonjour ! 👋 Je suis l'assistant IA de Back to Outdoor. Posez-moi vos questions sur nos formules de contenu, le déroulement et nos références – ou demandez un premier échange gratuit. Comment puis-je vous aider ?",
      chips: ["Quelles formules proposez-vous ?", "Quel est le prix ?", "Demander un échange gratuit", "Recevoir le media kit"],
      ph: "Écrire un message …", send: "Envoyer", open: "Des questions ? Ouvrir le chat", close: "Fermer le chat",
      note: "Assistant IA – les réponses peuvent contenir des erreurs. ", privacy: "Confidentialité",
      err: "Un problème est survenu. Écrivez-nous à " + MAIL + ".",
      form: { title: "Demander un premier échange gratuit", name: "Nom *", firma: "Entreprise", email: "E-mail *", typ: "Nous sommes …", typen: ["Hôtel", "Prestataire d'activités", "Marque outdoor", "Destination", "Autre"], msg: "De quoi s'agit-il ? (région, période, idée)", submit: "Envoyer la demande", cancel: "Annuler", ok: "Merci ! Votre messagerie s'ouvre avec la demande prête – il suffit de l'envoyer. Réponse sous deux jours ouvrés.", req: "Merci d'indiquer votre nom et un e-mail valide." },
      subject: "Demande via le chat du site"
    }
  }[lang];

  /* ---------- Offline-FAQ (wenn kein API-Key hinterlegt ist) ---------- */
  var FAQ = {
    de: [
      [/preis|kost|budget|teuer|tagessatz|€|euro/i, "Unsere Preise sind individuell – sie hängen davon ab, wie groß eure Touren sind, wie oft ihr Content braucht und ob es um ein einzelnes Erlebnis oder eine laufende Partnerschaft geht. Nach einem kurzen, kostenlosen Gespräch (ca. 15 Min.) bekommt ihr ein passendes Angebot. Soll ich dir das Anfrageformular öffnen?", "form"],
      [/media ?kit|pdf|unterlagen/i, "Gern! Das Media Kit (Leistungen, Ablauf, Referenzarbeiten) schicken wir per E-Mail. Trag einfach kurz deine Daten ein.", "form"],
      [/gespräch|termin|call|anfrage|angebot|kontakt|buchen|zusammenarbeit/i, "Sehr gern – das Erstgespräch ist kostenlos, unverbindlich und dauert ca. 15 Minuten. Trag kurz deine Daten ein, wir melden uns innerhalb von zwei Werktagen.", "form"],
      [/paket|leistung|angebot|was macht|was bietet|content tag|serie|partnerschaft/i, "Es gibt drei Wege: **Content Tag** (ein Drehtag vor Ort, fertige Reels + Fotos – der ideale Einstieg), **Content Serie** (mehrere Drehtage mit Content-Roadmap, z. B. für Saisonhighlights) und die **Content Studio Partnerschaft** (laufende Zusammenarbeit mit Redaktionsplan). Dazu optional **Gäste-Videos**, die eure Gäste vor Ort kaufen können. Was plant ihr gerade?"],
      [/gäste|gast.?video/i, "Bei begleiteten Touren können eure Gäste ihr persönliches Video direkt vor Ort kaufen – ein Mehrwert für sie und eine zusätzliche Einnahmequelle für euch. Alternativ schenkt ihr es als Erinnerung dazu. Das lässt sich mit jedem Paket kombinieren."],
      [/ablauf|wie läuft|prozess|schritte/i, "So läuft's: 1) kurzes Erstgespräch, in dem wir euren Auftritt anschauen, 2) konkreter Vorschlag mit Umfang und Zeitrahmen, 3) Umsetzung vor Ort – ihr bekommt fertigen Content für Feed, Kampagne und Website."],
      [/wie lange|dauer|wann fertig|lieferzeit/i, "Beim Content Tag habt ihr den fertigen Content in der Regel wenige Tage nach dem Dreh. Bei Serie und Partnerschaft stimmen wir den Rhythmus gemeinsam ab."],
      [/referenz|portfolio|beispiel|kunden|projekte/i, "Wir haben u. a. Rafting & Canyoning in Salzburg, Kajak & Rafting im Gesäuse, Aquatrekking & Rafting im Verdon (Frankreich) und Safari-Content für eine Gästefarm in Namibia produziert. Mehr siehst du im <a href=\"/portfolio.html\">Portfolio</a>."],
      [/hotel/i, "Für Hotels produzieren wir Bildsprache, die Region und Erlebnis vor Ort einfängt – Reels und Fotos, die Gäste schon vor der Buchung spüren lassen, wie es bei euch ist. Magst du kurz erzählen, wo euer Haus liegt?"],
      [/drohne|drone/i, "Drohnenaufnahmen bieten wir aktuell nicht an – wir arbeiten mit Action-Cams, spiegelloser Systemkamera und Smartphone, nah dran am echten Erlebnis."],
      [/wo|region|reisen|ausland|standort/i, "Wir sitzen in Salzburg und sind weltweit im Einsatz – Schwerpunkt deutschsprachiger Raum und Europa."],
      [/tour buchen|mitmachen|rafting buchen|canyoning buchen/i, "Wir selbst verkaufen keine Touren – wir produzieren Content für Tourenanbieter, Hotels und Outdoor-Marken. Für eine Tour wende dich am besten direkt an einen Anbieter vor Ort."]
    ],
    en: [
      [/price|cost|budget|rate|€|euro/i, "Our pricing is individual – it depends on the size of your tours, how often you need content and whether it's a single experience or an ongoing partnership. After a short free call (~15 min) you get a tailored offer. Shall I open the request form?", "form"],
      [/media ?kit|pdf/i, "Sure! We send the media kit (services, process, references) by email – just leave your details.", "form"],
      [/call|meeting|book|contact|quote|offer|work together/i, "Happy to – the intro call is free, non-binding and takes about 15 minutes. Leave your details and we'll get back to you within two working days.", "form"],
      [/package|service|what do you|content day|series|partnership/i, "There are three ways: **Content Day** (one shooting day on site, finished reels + photos – the ideal start), **Content Series** (several shooting days with a content roadmap) and the **Content Studio Partnership** (ongoing, with an editorial plan). Plus optional **guest videos** your guests can buy on site. What are you planning?"],
      [/process|how does|steps/i, "1) Short intro call, 2) concrete proposal with scope and timing, 3) production on site – you receive finished content for feed, campaigns and website."],
      [/portfolio|reference|example|clients/i, "We've produced rafting & canyoning in Salzburg, kayaking & rafting in the Gesäuse, aquatrekking & rafting in the Verdon (France) and safari content for a guest farm in Namibia. See the <a href=\"/portfolio.html\">portfolio</a>."],
      [/drone/i, "We don't currently offer drone footage – we work with action cams, a mirrorless camera and smartphone, close to the real experience."],
      [/where|region|travel|based/i, "We're based in Salzburg, Austria, and work worldwide – mainly in German-speaking countries and Europe."]
    ]
  };
  FAQ.fr = FAQ.en;
  var FALLBACK = {
    de: "Gute Frage – die gebe ich am besten direkt ans Team weiter. Trag kurz deine Daten ein, dann meldet sich Basti innerhalb von zwei Werktagen. Oder schreib an " + MAIL + ".",
    en: "Good question – best to pass it straight to the team. Leave your details and we'll reply within two working days, or email " + MAIL + ".",
    fr: "Bonne question – je la transmets à l'équipe. Laissez vos coordonnées, réponse sous deux jours ouvrés, ou écrivez à " + MAIL + "."
  }[lang];

  /* ---------- Styles ---------- */
  var css = "\
#bto-agent{--ink:#132030;--ink2:#1b2b3f;--stone:#ece7dd;--foam:#f7f5f0;--acc:#e36d27;--acc2:#8a4118;--gr:#635c50;font-family:'Work Sans',system-ui,sans-serif;position:fixed;right:20px;bottom:20px;z-index:2147483000;color:var(--ink)}\
#bto-agent *{box-sizing:border-box}\
#bto-agent .bto-fab{display:flex;align-items:center;gap:10px;background:var(--ink);color:var(--foam);border:1px solid rgba(247,245,240,.18);border-radius:999px;padding:10px 18px 10px 10px;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.28);font:600 14px/1 'Work Sans',system-ui,sans-serif;transition:transform .2s}\
#bto-agent .bto-fab:hover{transform:translateY(-2px)}\
#bto-agent .bto-dot{width:34px;height:34px;border-radius:50%;background:var(--acc);display:grid;place-items:center;flex:none}\
#bto-agent .bto-dot svg{width:18px;height:18px;fill:#fff}\
#bto-agent .bto-panel{position:absolute;right:0;bottom:0;width:380px;height:min(600px,calc(100vh - 40px));background:var(--foam);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.35);display:none;flex-direction:column;overflow:hidden;border:1px solid rgba(16,24,28,.12)}\
#bto-agent.open .bto-panel{display:flex}#bto-agent.open .bto-fab{display:none}\
#bto-agent .bto-head{background:var(--ink);color:var(--foam);padding:14px 16px;display:flex;align-items:center;gap:12px}\
#bto-agent .bto-head b{font:800 20px/1 'Big Shoulders Display',Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;display:block}\
#bto-agent .bto-head small{font-size:12px;opacity:.75;display:flex;align-items:center;gap:6px;margin-top:4px}\
#bto-agent .bto-head small:before{content:'';width:7px;height:7px;border-radius:50%;background:#38b89a}\
#bto-agent .bto-x{margin-left:auto;background:none;border:0;color:var(--foam);font-size:26px;line-height:1;cursor:pointer;opacity:.8;padding:4px}\
#bto-agent .bto-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:var(--stone)}\
#bto-agent .bto-m{max-width:86%;padding:10px 13px;border-radius:12px;font-size:14.5px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}\
#bto-agent .bto-m a{color:var(--acc2);font-weight:600}\
#bto-agent .bto-a{background:#fff;align-self:flex-start;border-bottom-left-radius:3px}\
#bto-agent .bto-u{background:var(--ink);color:var(--foam);align-self:flex-end;border-bottom-right-radius:3px}\
#bto-agent .bto-u a{color:#ffc79f}\
#bto-agent .bto-typing span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:var(--gr);animation:bto-b 1s infinite}\
#bto-agent .bto-typing span:nth-child(2){animation-delay:.15s}#bto-agent .bto-typing span:nth-child(3){animation-delay:.3s}\
@keyframes bto-b{0%,80%,100%{opacity:.25}40%{opacity:1}}\
#bto-agent .bto-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px;background:var(--stone)}\
#bto-agent .bto-chip{border:1px solid var(--acc);color:var(--acc2);background:#fff;border-radius:999px;padding:6px 11px;font:500 13px 'Work Sans',system-ui,sans-serif;cursor:pointer}\
#bto-agent .bto-chip:hover{background:var(--acc);color:#fff}\
#bto-agent form.bto-in{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(16,24,28,.1);background:var(--foam)}\
#bto-agent .bto-in textarea{flex:1;resize:none;border:1px solid rgba(16,24,28,.2);border-radius:10px;padding:10px 12px;font:14.5px 'Work Sans',system-ui,sans-serif;max-height:110px;background:#fff;color:var(--ink)}\
#bto-agent .bto-in textarea:focus,#bto-agent .bto-f input:focus,#bto-agent .bto-f select:focus,#bto-agent .bto-f textarea:focus{outline:2px solid var(--acc);border-color:transparent}\
#bto-agent .bto-send{background:var(--acc);color:#fff;border:0;border-radius:10px;padding:0 14px;cursor:pointer;display:grid;place-items:center}\
#bto-agent .bto-send svg{width:18px;height:18px;fill:#fff}\
#bto-agent .bto-send:disabled{opacity:.5;cursor:default}\
#bto-agent .bto-note{font-size:11px;color:var(--gr);text-align:center;padding:0 10px 8px;background:var(--foam)}\
#bto-agent .bto-note a{color:var(--gr)}\
#bto-agent .bto-f{background:#fff;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px;align-self:stretch}\
#bto-agent .bto-f b{font:800 17px/1.1 'Big Shoulders Display',Impact,sans-serif;text-transform:uppercase;letter-spacing:.03em}\
#bto-agent .bto-f input,#bto-agent .bto-f select,#bto-agent .bto-f textarea{width:100%;border:1px solid rgba(16,24,28,.2);border-radius:8px;padding:9px 10px;font:14px 'Work Sans',system-ui,sans-serif;background:#fff;color:var(--ink)}\
#bto-agent .bto-f .row{display:flex;gap:8px}\
#bto-agent .bto-f .bto-btn{background:var(--acc);color:#fff;border:0;border-radius:8px;padding:10px;font:600 14px 'Work Sans',system-ui,sans-serif;cursor:pointer;flex:1}\
#bto-agent .bto-f .bto-btn.g{background:none;color:var(--gr);border:1px solid rgba(16,24,28,.2);flex:none;padding:10px 14px}\
#bto-agent .bto-f .e{color:#b3261e;font-size:12.5px;display:none}\
@media (max-width:520px){#bto-agent{right:12px;bottom:12px}#bto-agent.open{left:0;right:0;bottom:0;top:0}#bto-agent .bto-panel{width:100%;height:100%;border-radius:0;right:0;bottom:0}#bto-agent .bto-fab .bto-lbl{display:none}#bto-agent .bto-fab{padding:10px}}\
@media print{#bto-agent{display:none}}";

  var ICON_CHAT = '<svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 6.5a1.5 1.5 0 1 0 0 .01zm5 0a1.5 1.5 0 1 0 0 .01zm5 0a1.5 1.5 0 1 0 0 .01z"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24"><path d="M3 20.5 21.5 12 3 3.5l.01 6.6L15 12 3.01 13.9z"/></svg>';

  /* ---------- State ---------- */
  var KEY = "bto-agent-v1";
  var state = { messages: [], open: false };
  try { var s = JSON.parse(sessionStorage.getItem(KEY) || "null"); if (s && s.messages) state = s; } catch (e) {}
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ messages: state.messages.slice(-30), open: state.open })); } catch (e) {} }

  var mode = "unknown"; // "ai" | "offline"
  var booking = null;

  /* ---------- DOM ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var style = el("style"); style.textContent = css; document.head.appendChild(style);
  var root = el("div"); root.id = "bto-agent";
  root.innerHTML =
    '<button class="bto-fab" type="button" aria-label="' + T.open + '"><span class="bto-dot">' + ICON_CHAT + '</span><span class="bto-lbl">' + T.open + '</span></button>' +
    '<div class="bto-panel" role="dialog" aria-label="' + T.title + '">' +
      '<div class="bto-head"><span class="bto-dot">' + ICON_CHAT + '</span><div><b>' + T.title + '</b><small>' + T.sub + '</small></div><button class="bto-x" type="button" aria-label="' + T.close + '">×</button></div>' +
      '<div class="bto-log" aria-live="polite"></div>' +
      '<div class="bto-chips"></div>' +
      '<form class="bto-in"><textarea rows="1" placeholder="' + T.ph + '" aria-label="' + T.ph + '" maxlength="1500"></textarea><button class="bto-send" type="submit" aria-label="' + T.send + '">' + ICON_SEND + '</button></form>' +
      '<div class="bto-note">' + T.note + '<a href="/datenschutz.html#ki-assistent">' + T.privacy + '</a></div>' +
    '</div>';
  document.body.appendChild(root);

  var log = root.querySelector(".bto-log"), chips = root.querySelector(".bto-chips"),
      form = root.querySelector("form.bto-in"), ta = form.querySelector("textarea"), sendBtn = form.querySelector(".bto-send");

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(t, trusted) {
    var h = trusted ? t : esc(t);
    h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    if (!trusted) {
      h = h.replace(/(https?:\/\/[^\s<)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      h = h.replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');
      h = h.replace(/(^|[\s(])(\/[a-z-]+\.html(?:#[\w-]+)?)/g, '$1<a href="$2">$2</a>');
    }
    return h;
  }
  function bubble(role, text, trusted) {
    var b = el("div", "bto-m " + (role === "user" ? "bto-u" : "bto-a"), fmt(text, trusted));
    log.appendChild(b); log.scrollTop = log.scrollHeight; return b;
  }
  function render() {
    log.innerHTML = "";
    bubble("assistant", T.hello, true);
    state.messages.forEach(function (m) { bubble(m.role, m.content, m.trusted); });
    renderChips();
  }
  function renderChips() {
    chips.innerHTML = "";
    if (state.messages.length > 2) return;
    T.chips.forEach(function (c, i) {
      var b = el("button", "bto-chip", esc(c)); b.type = "button";
      b.onclick = function () { if (i >= 2 && mode !== "ai") { push("user", c); showForm(); } else ask(c); };
      chips.appendChild(b);
    });
  }
  function push(role, content, trusted) { state.messages.push({ role: role, content: content, trusted: !!trusted }); bubble(role, content, trusted); save(); renderChips(); }

  function typing(on) {
    var t = log.querySelector(".bto-typing");
    if (on && !t) { t = el("div", "bto-m bto-a bto-typing", "<span></span><span></span><span></span>"); log.appendChild(t); log.scrollTop = log.scrollHeight; }
    if (!on && t) t.remove();
  }

  /* ---------- Offline-Modus ---------- */
  function offlineAnswer(q) {
    var rules = FAQ[lang] || FAQ.de;
    for (var i = 0; i < rules.length; i++) if (rules[i][0].test(q)) return { text: rules[i][1], form: rules[i][2] === "form" };
    return { text: FALLBACK, form: true };
  }

  function showForm() {
    if (log.querySelector(".bto-f")) return;
    var F = T.form;
    var f = el("form", "bto-f");
    f.innerHTML = "<b>" + F.title + "</b>" +
      '<div class="row"><input name="name" placeholder="' + F.name + '" autocomplete="name"><input name="firma" placeholder="' + F.firma + '" autocomplete="organization"></div>' +
      '<input name="email" type="email" placeholder="' + F.email + '" autocomplete="email">' +
      '<select name="typ"><option value="">' + F.typ + "</option>" + F.typen.map(function (x) { return "<option>" + x + "</option>"; }).join("") + "</select>" +
      '<textarea name="msg" rows="3" placeholder="' + F.msg + '"></textarea>' +
      '<div class="e">' + F.req + "</div>" +
      '<div class="row"><button class="bto-btn g" type="button">' + F.cancel + '</button><button class="bto-btn" type="submit">' + F.submit + "</button></div>";
    f.querySelector(".g").onclick = function () { f.remove(); };
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var d = {}; ["name", "firma", "email", "typ", "msg"].forEach(function (k) { d[k] = f.elements[k].value.trim(); });
      if (!d.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { f.querySelector(".e").style.display = "block"; return; }
      var verlauf = state.messages.filter(function (m) { return !m.trusted; }).map(function (m) { return (m.role === "user" ? "Besucher: " : "Assistent: ") + m.content; }).join("\n");
      var bodyTxt = "Name: " + d.name + "\nFirma: " + (d.firma || "-") + "\nE-Mail: " + d.email + "\nTyp: " + (d.typ || "-") + "\nSeite: " + location.pathname + "\n\nAnliegen:\n" + (d.msg || "-") + (verlauf ? "\n\n--- Chatverlauf ---\n" + verlauf.slice(-1500) : "");
      window.location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(T.subject + (d.firma ? " – " + d.firma : "")) + "&body=" + encodeURIComponent(bodyTxt);
      f.remove();
      push("assistant", F.ok, true);
    };
    log.appendChild(f); log.scrollTop = log.scrollHeight;
    setTimeout(function () { f.elements.name.focus(); }, 50);
  }

  /* ---------- KI-Modus ---------- */
  var busy = false;
  function ask(text) {
    text = (text || "").trim(); if (!text || busy) return;
    push("user", text);
    if (mode !== "ai") {
      typing(true); busy = true;
      setTimeout(function () { typing(false); busy = false; var a = offlineAnswer(text); push("assistant", a.text, true); if (a.form) showForm(); }, 450);
      return;
    }
    busy = true; sendBtn.disabled = true; typing(true);
    var msgs = state.messages.filter(function (m) { return !m.trusted || m.role === "user"; }).map(function (m) { return { role: m.role, content: m.content.replace(/<[^>]+>/g, "") }; });
    fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: msgs, page: location.pathname, lang: lang }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { typing(false); push("assistant", d.reply || T.err); })
      .catch(function () { typing(false); mode = "offline"; var a = offlineAnswer(text); push("assistant", a.text, true); if (a.form) showForm(); })
      .then(function () { busy = false; sendBtn.disabled = false; });
  }

  /* ---------- Events ---------- */
  function setOpen(o) { state.open = o; root.classList.toggle("open", o); save(); if (o) { setTimeout(function () { ta.focus(); }, 50); log.scrollTop = log.scrollHeight; } }
  root.querySelector(".bto-fab").onclick = function () { setOpen(true); };
  root.querySelector(".bto-x").onclick = function () { setOpen(false); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && state.open) setOpen(false); });
  form.onsubmit = function (e) { e.preventDefault(); var v = ta.value; ta.value = ""; ta.style.height = ""; ask(v); };
  ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.onsubmit(e); } });
  ta.addEventListener("input", function () { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 110) + "px"; });

  // Öffentliche Mini-API, z. B. für Buttons: onclick="BTOAgent.open('Ich möchte ein Gespräch')"
  window.BTOAgent = { open: function (msg) { setOpen(true); if (msg) ask(msg); } };

  render();
  if (state.open) setOpen(true);

  fetch(API, { method: "GET" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { mode = d && d.aktiv ? "ai" : "offline"; booking = d && d.booking; if (mode === "ai") renderChips(); })
    .catch(function () { mode = "offline"; });
})();
