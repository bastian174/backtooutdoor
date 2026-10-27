/**
 * Back to Outdoor – Anfragen-Automation (Google Apps Script)
 *
 * Was passiert bei jeder Anfrage von der Website (Formular oder KI-Chat):
 *   1. Der Anfragende bekommt sofort eine persönliche Antwort-Mail (von infobacktooutdoor@gmail.com, Antworten gehen dorthin zurück).
 *   2. infobacktooutdoor@gmail.com bekommt eine Benachrichtigung mit allen Daten + der verschickten Antwort (Kopie an info@backtooutdoor.com).
 *   3. Die Anfrage wird als neue Zeile in dieser Tabelle eingetragen (Liste mit Status) – das ist die Liste, mit der JARVIS/das Agenten-Team weiterarbeitet.
 *   4. Drei Kanäle: Back to Outdoor, Mindset Tetris, Immobilien. Benachrichtigung und Antwort-Mail bekommen in Gmail das Label
 *      "Anfragen/<Kanal>", in der Tabelle steht der Kanal in Spalte B.
 *
 * Einrichtung (im Google-Konto infobacktooutdoor@gmail.com):
 *   1. Auf drive.google.com einloggen (mit infobacktooutdoor@gmail.com) → neue Google Tabelle anlegen → "BTO Anfragen" nennen.
 *   2. Oben im Menü: Erweiterungen → Apps Script.
 *   3. Den kompletten Beispielcode dort löschen, diesen Code stattdessen reinkopieren.
 *   4. Oben speichern (Diskette-Symbol).
 *   5. Oben in der Funktionsliste "testAnfrage" auswählen → Ausführen (▶) klicken → Berechtigungen erlauben (Google warnt, weil es dein eigenes Skript ist – "Erweitert" → "Trotzdem öffnen" wählen).
 *   6. Rechts oben "Bereitstellen" → "Neue Bereitstellung" → Zahnrad → "Web-App" → Ausführen als: "Ich", Zugriff: "Jeder" → Bereitstellen → die angezeigte URL kopieren.
 *   7. Diese URL + das SECRET unten mir (oder direkt in Vercel als LEAD_WEBHOOK_URL / LEAD_SECRET) geben.
 */

const CONFIG = {
  SECRET: 'HIER-SECRET-EINTRAGEN',            // identisch mit LEAD_SECRET in Vercel – NICHT ins Repo committen
  INFO_MAIL: 'infobacktooutdoor@gmail.com',   // bekommt jede Anfrage (primär)
  INFO_MAIL_CC: 'info@backtooutdoor.com',     // bekommt jede Anfrage als Kopie
  AUTO_ANTWORT: true,                         // false = Antwort wird nur als Gmail-Entwurf angelegt
  ABSENDER_NAME: 'Basti · Back to Outdoor',
  ABSENDER_ADRESSE: '',                       // optional: z. B. info@backtooutdoor.com, falls in Gmail als "Senden als"-Adresse eingerichtet
  BLATT: 'Anfragen',
  BLATT_KLICKS: 'Klicks',
  LABEL_PREFIX: 'Anfragen/',                  // Gmail-Labels: Anfragen/Back to Outdoor, Anfragen/Mindset Tetris, Anfragen/Immobilien                     // Tab für Kooperations-/Affiliate-Link-Klicks (siehe api/go.js)
};

const KANAELE = ['Back to Outdoor', 'Mindset Tetris', 'Immobilien'];
const SPALTEN = ['Eingang', 'Kanal', 'Status', 'Name', 'Firma', 'E-Mail', 'Telefon', 'Typ', 'Wunsch', 'Anliegen',
  'Seite', 'Quelle', 'Sprache', 'Antwort-Betreff', 'Antwort (verschickt)', 'Nächster Schritt / Notizen'];
const STATUS = ['Neu', 'Beantwortet', 'Antwort als Entwurf', 'Gespräch vereinbart', 'Angebot geschickt', 'Gewonnen', 'Verloren', 'Spam'];
const SPALTEN_KLICKS = ['Zeitpunkt', 'Link', 'Ziel-URL', 'Verweisende Seite'];

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, fehler: 'json' }); }
  if (CONFIG.SECRET && d.secret !== CONFIG.SECRET) return json_({ ok: false, fehler: 'secret' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (d.art === 'klick') return json_(klickVerarbeiten_(d));
    if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return json_({ ok: false, fehler: 'email' });
    return json_(verarbeiten_(d));
  } finally {
    lock.releaseLock();
  }
}

// Klick auf einen Kooperations-/Affiliate-Link (siehe api/go.js) – nur protokollieren, keine Mail.
function klickVerarbeiten_(d) {
  klickBlatt_().appendRow([
    new Date(d.zeit || Date.now()), d.link || '-', d.ziel || '-', d.seite || '-',
  ].map(sicher_));
  return { ok: true };
}

function klickBlatt_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.BLATT_KLICKS);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.BLATT_KLICKS);
    sh.appendRow(SPALTEN_KLICKS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, SPALTEN_KLICKS.length).setFontWeight('bold').setBackground('#132030').setFontColor('#f7f5f0');
    sh.setColumnWidths(1, SPALTEN_KLICKS.length, 200);
    sh.getRange('A:A').setNumberFormat('dd.MM.yyyy HH:mm');
  }
  return sh;
}

function kanal_(d) {
  if (KANAELE.indexOf(d.kanal) >= 0) return d.kanal;
  const seite = String(d.seite || '').toLowerCase();
  if (d.typ === 'Immobilien' || seite.indexOf('immobilien') >= 0) return 'Immobilien';
  if (String(d.produkt || '').indexOf('mindset') === 0 || /tetris|mindset/.test(seite)) return 'Mindset Tetris';
  return 'Back to Outdoor';
}

// Logo unter der Signatur der Antwort-Mail (Mindset Tetris bewusst ohne, eigener Stil)
const LOGOS = {
  'Back to Outdoor': 'https://backtooutdoor.com/assets/img/mail/logo-bto-mail.png',
  'Immobilien': 'https://backtooutdoor.com/assets/img/mail/logo-immobilien-mail.png',
};

function htmlMail_(text, kanal) {
  const body = String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>').replace(/\n/g, '<br>');
  const inline = {};
  let logo = '';
  if (LOGOS[kanal]) {
    try {
      inline.logo = UrlFetchApp.fetch(LOGOS[kanal]).getBlob().setName('logo.png');
      logo = '<p style="margin:20px 0 0"><img src="cid:logo" height="96" alt="Back to Outdoor"></p>';
    } catch (err) { Logger.log('Logo nicht geladen: ' + err.message); }
  }
  return { html: '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#132030">' + body + logo + '</div>', inline: inline };
}

function label_(kanal) {
  const name = CONFIG.LABEL_PREFIX + kanal;
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

// Gerade verschickte Mail suchen und mit dem Kanal-Label versehen (Gmail braucht manchmal 1–2 Sek. bis zur Suche)
function labeln_(query, label) {
  for (let i = 0; i < 4; i++) {
    const th = GmailApp.search(query, 0, 1);
    if (th.length) { th[0].addLabel(label); return true; }
    Utilities.sleep(1200);
  }
  Logger.log('Label nicht gesetzt: ' + query);
  return false;
}

function verarbeiten_(d) {
  const blatt = blatt_();
  const kanal = kanal_(d);
  const label = label_(kanal);
  const marke = Utilities.getUuid().slice(0, 8);
  let status = 'Neu';
  let beantwortet = false;

  // E-Book mit Newsletter-Häkchen: Bestätigungslink für die Mailstrecke anhängen (siehe BTO_Mailstrecke_AppsScript.gs)
  if (typeof streckeAnmelden_ === 'function' && d.antwort_text) streckeAnmelden_(d, kanal);

  // 1. Antwort an den Anfragenden
  if (d.antwort_betreff && d.antwort_text) {
    const opts = { name: CONFIG.ABSENDER_NAME, replyTo: CONFIG.INFO_MAIL, cc: CONFIG.INFO_MAIL_CC || undefined };
    if (CONFIG.ABSENDER_ADRESSE && GmailApp.getAliases().indexOf(CONFIG.ABSENDER_ADRESSE) >= 0) opts.from = CONFIG.ABSENDER_ADRESSE;
    // Media Kit als echten PDF-Anhang mitschicken (nicht nur als Link)
    if (d.media_kit_url) {
      try {
        const pdf = UrlFetchApp.fetch(d.media_kit_url, { muteHttpExceptions: true }).getBlob().setName('Back-to-Outdoor-Media-Kit.pdf');
        opts.attachments = [pdf];
      } catch (err) {
        Logger.log('Media-Kit-PDF konnte nicht geladen werden: ' + err.message);
      }
    }
    const hm = htmlMail_(d.antwort_text, kanal);
    opts.htmlBody = hm.html;
    if (Object.keys(hm.inline).length) opts.inlineImages = hm.inline;
    if (CONFIG.AUTO_ANTWORT) {
      GmailApp.sendEmail(d.email, d.antwort_betreff, d.antwort_text, opts);
      status = 'Beantwortet';
      beantwortet = true;
      labeln_('in:sent to:' + d.email + ' subject:"' + d.antwort_betreff.replace(/"/g, '') + '" newer_than:1h', label);
    } else {
      GmailApp.createDraft(d.email, d.antwort_betreff, d.antwort_text, opts);
      status = 'Antwort als Entwurf';
    }
  }

  // 2. Benachrichtigung an info@
  const zeilen = [
    'Kanal:    ' + kanal,
    'Neue Anfrage über ' + (d.quelle || 'die Website') + (d.seite ? ' (' + d.seite + ')' : ''),
    '',
    'Name:     ' + (d.name || '-'),
    'Firma:    ' + (d.firma || '-'),
    'E-Mail:   ' + d.email,
    'Telefon:  ' + (d.telefon || '-'),
    'Typ:      ' + (d.typ || '-'),
    'Wunsch:   ' + (d.wunsch || '-'),
    '',
    'Anliegen:',
    d.anliegen || '-',
  ];
  if (d.verlauf) zeilen.push('', '--- Chatverlauf ---', d.verlauf);
  zeilen.push('', '==============================',
    beantwortet ? 'Diese Antwort wurde automatisch verschickt:' : 'Antwort-Entwurf (liegt in Gmail unter "Entwürfe"):',
    '', 'Betreff: ' + (d.antwort_betreff || '-'), '', d.antwort_text || '-',
    '', '==============================', 'Liste: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
  const betreff = 'Neue Anfrage · ' + kanal + ': ' + (d.firma || d.name) + ' – ' + (d.wunsch || 'Anfrage') + ' [' + marke + ']';
  GmailApp.sendEmail(CONFIG.INFO_MAIL, betreff, zeilen.join('\n'),
    { name: 'Website-Anfragen ' + kanal, replyTo: d.email, cc: CONFIG.INFO_MAIL_CC || undefined });
  labeln_('subject:"' + marke + '" newer_than:1h', label);

  // 3. Eintrag in die Liste
  blatt.appendRow([
    new Date(d.zeit || Date.now()), kanal, status, d.name, d.firma, d.email, d.telefon, d.typ, d.wunsch,
    d.anliegen, d.seite, d.quelle, d.sprache, d.antwort_betreff, d.antwort_text, '',
  ].map(sicher_));

  return { ok: true, beantwortet: beantwortet };
}

function blatt_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.BLATT);
  // Vorbereitete Tabelle: erstes Blatt hat schon die Kopfzeile → umbenennen und formatieren
  const erstes = ss.getSheets()[0];
  if (!sh && erstes && erstes.getRange(1, 1).getValue() === SPALTEN[0]) {
    sh = erstes.setName(CONFIG.BLATT);
    formatieren_(sh);
  }
  if (!sh) {
    sh = ss.insertSheet(CONFIG.BLATT);
    sh.appendRow(SPALTEN);
    formatieren_(sh);
  }
  kanalSpalte_(sh);
  return sh;
}

// Einmalige Umstellung bestehender Tabellen: Spalte "Kanal" nach "Eingang" einfügen und alte Zeilen zuordnen
function kanalSpalte_(sh) {
  if (sh.getRange(1, 2).getValue() === 'Kanal') return;
  sh.insertColumnAfter(1);
  sh.getRange(1, 2).setValue('Kanal');
  const n = sh.getLastRow() - 1;
  if (n > 0) {
    const kopf = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const daten = sh.getRange(2, 1, n, sh.getLastColumn()).getValues();
    const iTyp = kopf.indexOf('Typ'), iWunsch = kopf.indexOf('Wunsch'), iSeite = kopf.indexOf('Seite');
    const werte = daten.map(function (z) {
      return [kanal_({ typ: z[iTyp], seite: z[iSeite], produkt: String(z[iWunsch]).indexOf('E-Book') === 0 ? 'mindset' : '' })];
    });
    sh.getRange(2, 2, n, 1).setValues(werte);
  }
  formatieren_(sh);
}

function formatieren_(sh) {
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, SPALTEN.length).setFontWeight('bold').setBackground('#132030').setFontColor('#f7f5f0');
    sh.setColumnWidths(1, SPALTEN.length, 140);
    sh.setColumnWidth(10, 320); sh.setColumnWidth(15, 320); sh.setColumnWidth(16, 260);
    sh.getRange('A:A').setNumberFormat('dd.MM.yyyy HH:mm');
    const regel = SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).setAllowInvalid(true).build();
    sh.getRange(2, 3, 1000, 1).setDataValidation(regel);
    const regelK = SpreadsheetApp.newDataValidation().requireValueInList(KANAELE, true).setAllowInvalid(true).build();
    sh.getRange(2, 2, 1000, 1).setDataValidation(regelK);
    if (!sh.getFilter()) sh.getRange(1, 1, Math.max(sh.getLastRow(), 2), SPALTEN.length).createFilter();
}

// Schutz gegen Formeln aus Formularfeldern (z. B. "=HYPERLINK(...)")
function sicher_(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  // Bestätigungs- und Abmeldelinks der Mailstrecke (siehe BTO_Mailstrecke_AppsScript.gs)
  if (e && e.parameter && e.parameter.a && typeof streckeGet_ === 'function') return streckeGet_(e);
  return json_({ ok: true, dienst: 'BTO Anfragen' });
}

/** Einmal ausführen nach dem Update: legt die 3 Gmail-Labels an und stellt die Tabelle auf die Kanal-Spalte um. */
function kanaeleEinrichten() {
  KANAELE.forEach(label_);
  blatt_();
  Logger.log('Labels und Kanal-Spalte bereit.');
}

/** Einmal manuell ausführen: erteilt die Berechtigungen und schickt eine Test-Anfrage an dich selbst. */
function testAnfrage() {
  const ich = Session.getActiveUser().getEmail() || CONFIG.INFO_MAIL;
  const r = verarbeiten_({
    zeit: new Date().toISOString(), name: 'Test Person', firma: 'Testhotel', email: ich, telefon: '',
    typ: 'Hotel', wunsch: 'Erstgespräch', anliegen: 'Das ist eine Test-Anfrage.', seite: '/test', quelle: 'Test', sprache: 'de',
    antwort_betreff: 'Test: Danke für eure Anfrage – Back to Outdoor',
    antwort_text: 'Hallo Test,\n\ndas ist eine Test-Antwort. Wenn du diese Mail bekommst, funktioniert der Versand.\n\nLiebe Grüße\nBasti',
  });
  Logger.log(r);
}
