/* Back to Outdoor Immobilien – eigener KI-Agent (getrennt vom Outdoor-Agenten agent.js)
   Einbinden auf den Immobilien-Seiten: <script src="/immobilien-agent.js" defer></script> vor </body>
   Spricht mit /api/chat (brand: "immobilien"). Ohne API-Key: Offline-Modus mit FAQ-Antworten + Anfrageformular.
   Anfragen gehen an /api/lead und landen im Kanal "Immobilien" (Du-Bestätigung mit Portfolio-Link). */
(function () {
  if (window.__btoImmoAgent) return; window.__btoImmoAgent = true;

  var API = "/api/chat";
  var LEAD_API = "/api/lead";
  var MAIL = "info@backtooutdoor.com";
  var PHONE = "+43 (0)660 8422053";
  var WA = "https://wa.me/436608422053";
  var lang = (document.documentElement.lang || "de").slice(0, 2);
  if (lang !== "de") lang = "en";
  var PF = lang === "de" ? "/immobilien/portfolio" : "/immobilien-en/portfolio";
  var HOME = lang === "de" ? "/immobilien" : "/immobilien-en";

  var T = {
    de: {
      title: "Back to Outdoor Immobilien", sub: "KI-Assistent · antwortet sofort",
      hello: "Hallo! 👋 Ich bin der KI-Assistent von Back to Outdoor Immobilien. Ich beantworte Fragen zu Videos, Rundgängen, UGC und Projektseiten für Immobilien, Hotels, Ferienwohnungen und Gastronomie – und helfe dir, eine kostenlose Vorschau anzufragen. Worum geht es bei dir?",
      chips: ["Welche Formate gibt es?", "Was kostet das?", "Kostenlose Vorschau anfragen", "Portfolio ansehen"],
      ph: "Nachricht schreiben …", send: "Senden", open: "Fragen? Chat öffnen", close: "Chat schließen",
      note: "KI-Assistent – Antworten können Fehler enthalten. ", privacy: "Datenschutz",
      err: "Da ist gerade etwas schiefgelaufen. Schreib uns gern direkt an " + MAIL + ".",
      form: { title: "Kostenlose Vorschau anfragen", name: "Name *", firma: "Firma / Betrieb", email: "E-Mail *", typ: "Bereich …", typen: ["Makler", "Bauträger", "Private Eigentümer", "Hotel", "Ferienwohnung / Airbnb", "Restaurant / Gastronomie", "Destination", "Sonstiges"], msg: "Worum geht es? (Objekt, Ort, Format, Link)", tel: "Telefon (optional)", submit: "Anfrage senden", sending: "Wird gesendet …", cancel: "Abbrechen", ok: "Danke! Deine Anfrage ist angekommen. Du bekommst gleich eine Bestätigung per E-Mail mit dem Link zu unserem Portfolio – schau bitte auch im Spam-Ordner nach. Bastian meldet sich persönlich bei dir.", fail: "Das Senden hat gerade nicht geklappt. Dein E-Mail-Programm öffnet sich mit der fertigen Anfrage – einfach absenden.", req: "Bitte Name und eine gültige E-Mail angeben.", titles: { "Vorschau": "Kostenlose Vorschau anfragen", "Erstgespräch": "Gespräch anfragen", "Angebot": "Angebot anfragen" } },
      subject: "Immobilien-Anfrage über den Website-Chat"
    },
    en: {
      title: "Back to Outdoor Real Estate", sub: "AI assistant · instant answers",
      hello: "Hi! 👋 I'm the AI assistant of Back to Outdoor Real Estate. Ask me about videos, walkthroughs, UGC and project pages for real estate, hotels, holiday rentals and restaurants – or let me help you request a free preview. What is your project about?",
      chips: ["Which formats do you offer?", "What does it cost?", "Request a free preview", "View portfolio"],
      ph: "Write a message …", send: "Send", open: "Questions? Open chat", close: "Close chat",
      note: "AI assistant – answers may contain mistakes. ", privacy: "Privacy",
      err: "Something went wrong. Feel free to email us at " + MAIL + ".",
      form: { title: "Request a free preview", name: "Name *", firma: "Company", email: "Email *", typ: "Field …", typen: ["Real estate agent", "Developer", "Private owner", "Hotel", "Holiday rental / Airbnb", "Restaurant", "Destination", "Other"], msg: "What is it about? (property, location, format, link)", tel: "Phone (optional)", submit: "Send request", sending: "Sending …", cancel: "Cancel", ok: "Thanks! Your request has arrived. You'll get a confirmation email with a link to our portfolio in a moment – please also check your spam folder. Bastian will get back to you personally.", fail: "Sending didn't work just now. Your email app opens with the request ready – just hit send.", req: "Please enter your name and a valid email.", titles: { "Vorschau": "Request a free preview", "Erstgespräch": "Request a call", "Angebot": "Request a quote" } },
      subject: "Real estate enquiry via website chat"
    }
  }[lang];

  /* ---------- Offline-FAQ (wenn kein API-Key hinterlegt ist) ---------- */
  var FAQ = {
    de: [
      [/preis|kost|budget|teuer|€|euro/i, "Die Preise sind individuell – sie hängen von der Zahl der Objekte und Formate ab. Den genauen Preis nennen wir im persönlichen Angebot. Vorher bekommst du kostenlos eine Vorschau. Soll ich dir das Anfrageformular öffnen?", "form"],
      [/format|reel|tiktok|short|pinterest|feed|querformat|was macht|was bietet|leistung/i, "Wir machen Instagram Reels (9:16), TikTok & Shorts, Feed-Posts (4:5), Pinterest Pins (2:3), Querformat-Videos (16:9) für Website und Portale und eigene Projektseiten für Neubauprojekte. Beispiele siehst du im <a href=\"" + PF + "\">Portfolio</a>."],
      [/portfolio|beispiel|referenz|arbeiten|projekte/i, "Unsere Beispiele findest du im <a href=\"" + PF + "\">Portfolio</a>. Die Videos dort sind Format-Demos aus lizenziertem Stock-Material und zeigen, wie dein Content aussehen kann."],
      [/vorschau|test|probe|kostenlos|gratis/i, "Du schickst uns Fotos, Videos oder einen Link zum Inserat und bekommst kostenlos eine Vorschau mit Wasserzeichen. Die siehst nur du, wir veröffentlichen nichts.", "form"],
      [/ablauf|wie läuft|prozess|schritte/i, "So läuft's: 1) Material schicken, 2) wir schneiden es auf deinen Betrieb und deine Zielgruppe zu, 3) kostenlose Vorschau, 4) passt es, gibt es ein Angebot und den fertigen Content ohne Wasserzeichen."],
      [/wie lange|dauer|wann fertig|lieferzeit/i, "Länge und Lieferzeit stimmen wir individuell mit dir ab – je nach Umfang und Formaten."],
      [/material|fotos|vor ort|dreh/i, "Beides geht: Wir drehen vor Ort oder arbeiten mit deinem vorhandenen Material – Fotos, Videos oder dem Link zu deinem Inserat."],
      [/projektseite|neubau|bauträger|wohnungen/i, "Für Neubauprojekte bauen wir eine eigene Projektseite: alle Wohnungen mit Grundriss, Fläche und Status, Filter und Exposé-Anfrage direkt pro Wohnung."],
      [/hotel|ferienwohnung|airbnb|restaurant|gastro|destination/i, "Auch dafür: UGC, Reels, Walkthroughs sowie Food- und Location-Content. Erzähl mir kurz, wo dein Betrieb liegt und was du zeigen willst."],
      [/kaufen|mieten|wohnung suchen|immobilie suchen/i, "Wir vermitteln selbst keine Immobilien – wir produzieren Content für Makler, Bauträger, Eigentümer und Gastgeber."],
      [/gespräch|termin|call|anfrage|angebot|kontakt/i, "Sehr gern! Trag kurz deine Daten ein, dann meldet sich Bastian persönlich bei dir.", "form"]
    ],
    en: [
      [/price|cost|budget|rate|€|euro/i, "Pricing is individual – it depends on the number of properties and formats. You get the exact price in a personal quote, and a free preview first. Shall I open the request form?", "form"],
      [/format|reel|tiktok|short|pinterest|feed|landscape|what do you|service/i, "We make Instagram reels (9:16), TikTok & Shorts, feed posts (4:5), Pinterest pins (2:3), landscape videos (16:9) for websites and portals, and dedicated project pages for new developments. See examples in the <a href=\"" + PF + "\">portfolio</a>."],
      [/portfolio|example|reference|work/i, "You'll find our examples in the <a href=\"" + PF + "\">portfolio</a>. The videos there are format demos made from licensed stock footage and show what your content can look like."],
      [/preview|trial|free/i, "Send us photos, videos or a link to your listing and you get a free watermarked preview. Only you see it, we publish nothing.", "form"],
      [/process|how does|steps/i, "1) Send your material, 2) we tailor it to your business and audience, 3) free preview, 4) if it fits, you get a quote and the finished content without watermark."],
      [/how long|duration|delivery/i, "Length and delivery time are agreed individually, depending on scope and formats."],
      [/buy|rent|looking for (a )?(flat|apartment|house)/i, "We don't sell or rent properties – we produce content for agents, developers, owners and hosts."],
      [/call|meeting|contact|quote|offer/i, "Happy to! Leave your details and Bastian will get back to you personally.", "form"]
    ]
  };
  var FALLBACK = {
    de: "Gute Frage – die gebe ich am besten direkt ans Team weiter. Trag kurz deine Daten ein, dann meldet sich Bastian persönlich. Oder schreib an " + MAIL + ".",
    en: "Good question – best to pass it straight to the team. Leave your details and Bastian will get back to you, or email " + MAIL + "."
  }[lang];

  /* ---------- Styles ---------- */
  var css = "\
#bto-agent{--ink:#1E2226;--ink2:#262B30;--stone:#ece7dd;--foam:#f7f5f0;--acc:#e36d27;--acc2:#8a4118;--gr:#635c50;font-family:'Hanken Grotesk',system-ui,sans-serif;position:fixed;right:20px;bottom:20px;z-index:2147483000;color:var(--ink)}\
#bto-agent *{box-sizing:border-box}\
#bto-agent .bto-fab{display:flex;align-items:center;gap:10px;background:var(--ink);color:var(--foam);border:1px solid rgba(247,245,240,.18);border-radius:999px;padding:10px 18px 10px 10px;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.28);font:600 14px/1 'Hanken Grotesk',system-ui,sans-serif;transition:transform .2s}\
#bto-agent .bto-fab:hover{transform:translateY(-2px)}\
#bto-agent .bto-dot{width:34px;height:34px;border-radius:50%;background:var(--acc);display:grid;place-items:center;flex:none}\
#bto-agent .bto-dot svg{width:18px;height:18px;fill:#fff}\
#bto-agent .bto-panel{position:absolute;right:0;bottom:0;width:380px;height:min(600px,calc(100vh - 40px));background:var(--foam);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.35);display:none;flex-direction:column;overflow:hidden;border:1px solid rgba(16,24,28,.12)}\
#bto-agent.open .bto-panel{display:flex}#bto-agent.open .bto-fab{display:none}\
#bto-agent .bto-head{background:var(--ink);color:var(--foam);padding:14px 16px;display:flex;align-items:center;gap:12px}\
#bto-agent .bto-head b{font:600 16px/1.1 'Hanken Grotesk',system-ui,sans-serif;letter-spacing:.02em;display:block}\
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
#bto-agent .bto-chip{border:1px solid var(--acc);color:var(--acc2);background:#fff;border-radius:999px;padding:6px 11px;font:500 13px 'Hanken Grotesk',system-ui,sans-serif;cursor:pointer}\
#bto-agent .bto-chip:hover{background:var(--acc);color:#fff}\
#bto-agent form.bto-in{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(16,24,28,.1);background:var(--foam)}\
#bto-agent .bto-in textarea{flex:1;resize:none;border:1px solid rgba(16,24,28,.2);border-radius:10px;padding:10px 12px;font:14.5px 'Hanken Grotesk',system-ui,sans-serif;max-height:110px;background:#fff;color:var(--ink)}\
#bto-agent .bto-in textarea:focus,#bto-agent .bto-f input:focus,#bto-agent .bto-f select:focus,#bto-agent .bto-f textarea:focus{outline:2px solid var(--acc);border-color:transparent}\
#bto-agent .bto-send{background:var(--acc);color:#fff;border:0;border-radius:10px;padding:0 14px;cursor:pointer;display:grid;place-items:center}\
#bto-agent .bto-send svg{width:18px;height:18px;fill:#fff}\
#bto-agent .bto-send:disabled{opacity:.5;cursor:default}\
#bto-agent .bto-note{font-size:11px;color:var(--gr);text-align:center;padding:0 10px 8px;background:var(--foam)}\
#bto-agent .bto-note a{color:var(--gr)}\
#bto-agent .bto-f{background:#fff;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px;align-self:stretch}\
#bto-agent .bto-f b{font:600 16px/1.2 'Hanken Grotesk',system-ui,sans-serif}\
#bto-agent .bto-f input,#bto-agent .bto-f select,#bto-agent .bto-f textarea{width:100%;border:1px solid rgba(16,24,28,.2);border-radius:8px;padding:9px 10px;font:14px 'Hanken Grotesk',system-ui,sans-serif;background:#fff;color:var(--ink)}\
#bto-agent .bto-f .row{display:flex;gap:8px}\
#bto-agent .bto-f .bto-btn{background:var(--acc);color:#fff;border:0;border-radius:8px;padding:10px;font:600 14px 'Hanken Grotesk',system-ui,sans-serif;cursor:pointer;flex:1}\
#bto-agent .bto-f .bto-btn.g{background:none;color:var(--gr);border:1px solid rgba(16,24,28,.2);flex:none;padding:10px 14px}\
#bto-agent .bto-f .e{color:#b3261e;font-size:12.5px;display:none}\
@media (max-width:520px){#bto-agent{right:12px;bottom:12px}#bto-agent.open{left:0;right:0;bottom:0;top:0}#bto-agent .bto-panel{width:100%;height:100%;border-radius:0;right:0;bottom:0}#bto-agent .bto-fab .bto-lbl{display:none}#bto-agent .bto-fab{padding:10px}}\
#bto-agent.bto-wait{opacity:0;pointer-events:none;transform:translateY(12px)}#bto-agent{transition:opacity .35s,transform .35s}\
@media print{#bto-agent{display:none}}";

  var ICON_CHAT = '<svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 6.5a1.5 1.5 0 1 0 0 .01zm5 0a1.5 1.5 0 1 0 0 .01zm5 0a1.5 1.5 0 1 0 0 .01z"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24"><path d="M3 20.5 21.5 12 3 3.5l.01 6.6L15 12 3.01 13.9z"/></svg>';

  /* ---------- State ---------- */
  var KEY = "bto-immo-agent-v1";
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
      h = h.replace(/(^|[\s(])(\/immobilien(?:-en)?(?:\/portfolio)?(?:#[\w-]+)?)(?=[\s).,]|$)/g, '$1<a href="$2">$2</a>');
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
      b.onclick = function () {
        if (i === 3) { if (location.pathname.indexOf("/portfolio") > -1) { setOpen(false); location.hash = "videos"; } else location.href = PF; return; }
        if (i === 2) { push("user", c); showForm("Vorschau"); } else ask(c);
      };
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

  function showForm(wunsch) {
    wunsch = wunsch || "Vorschau";
    var old = log.querySelector(".bto-f"); if (old) old.remove();
    var F = T.form;
    var f = el("form", "bto-f");
    f.innerHTML = "<b>" + (F.titles[wunsch] || F.title) + "</b>" +
      '<div class="row"><input name="name" placeholder="' + F.name + '" autocomplete="name"><input name="firma" placeholder="' + F.firma + '" autocomplete="organization"></div>' +
      '<div class="row"><input name="email" type="email" placeholder="' + F.email + '" autocomplete="email"><input name="telefon" type="tel" placeholder="' + F.tel + '" autocomplete="tel"></div>' +
      '<select name="typ"><option value="">' + F.typ + "</option>" + F.typen.map(function (x) { return "<option>" + x + "</option>"; }).join("") + "</select>" +
      '<textarea name="msg" rows="3" placeholder="' + F.msg + '"></textarea>' +
      '<input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
      '<div class="e">' + F.req + "</div>" +
      '<div class="row"><button class="bto-btn g" type="button">' + F.cancel + '</button><button class="bto-btn s" type="submit">' + F.submit + "</button></div>";
    var t0 = Date.now();
    f.querySelector(".g").onclick = function () { f.remove(); };
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var d = {}; ["name", "firma", "email", "telefon", "typ", "msg", "website"].forEach(function (k) { d[k] = f.elements[k].value.trim(); });
      if (!d.name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) { f.querySelector(".e").style.display = "block"; return; }
      var verlauf = state.messages.filter(function (m) { return !m.trusted; }).map(function (m) { return (m.role === "user" ? "Besucher: " : "Assistent: ") + m.content; }).join("\n");
      var btn = f.querySelector(".s"); btn.disabled = true; btn.textContent = F.sending;
      var seite = /immobilien/.test(location.pathname) ? location.pathname : HOME;
      var payload = { name: d.name, firma: d.firma, email: d.email, telefon: d.telefon, typ: "Immobilien", wunsch: (wunsch === "Vorschau" ? "Vorschau Immobilien" : wunsch) + " (Chat)", anliegen: (d.typ ? "Bereich: " + d.typ + "\n" : "") + d.msg, verlauf: verlauf.slice(-3000), seite: seite, lang: lang, website: d.website, t: t0 };
      function mailFallback() {
        var bodyTxt = "Wunsch: " + wunsch + "\nName: " + d.name + "\nFirma: " + (d.firma || "-") + "\nE-Mail: " + d.email + "\nTelefon: " + (d.telefon || "-") + "\nTyp: " + (d.typ || "-") + "\nSeite: " + location.pathname + "\n\nAnliegen:\n" + (d.msg || "-");
        window.location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(wunsch + " – " + T.subject + (d.firma ? " – " + d.firma : "")) + "&body=" + encodeURIComponent(bodyTxt);
      }
      fetch(LEAD_API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(r.status); return j; }); })
        .then(function () { f.remove(); push("assistant", F.ok, true); })
        .catch(function () { f.remove(); push("assistant", F.fail, true); mailFallback(); });
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
    fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: msgs, page: location.pathname, lang: lang, brand: "immobilien" }) })
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

  // Öffentliche Mini-API, z. B. für Buttons: onclick="BTOImmoAgent.open('Ich habe eine Frage')"
  window.BTOImmoAgent = {
    open: function (msg) { setOpen(true); if (msg) ask(msg); },
    form: function (wunsch) { setOpen(true); showForm(wunsch); }
  };

  render();
  if (state.open) setOpen(true);
  // Auf Seiten mit großem Startbild erscheint der Chat-Button erst nach kurzem Scrollen (überdeckt sonst das Logo im Startbild)
  if (!state.open && document.querySelector(".hero-logo")) {
    root.classList.add("bto-wait");
    var zeig = function () { if (window.scrollY > window.innerHeight * 0.5) { root.classList.remove("bto-wait"); removeEventListener("scroll", zeig); } };
    addEventListener("scroll", zeig, { passive: true }); zeig();
  }

  fetch(API, { method: "GET" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { mode = d && d.aktiv ? "ai" : "offline"; booking = d && d.booking; if (mode === "ai") renderChips(); })
    .catch(function () { mode = "offline"; });
})();
