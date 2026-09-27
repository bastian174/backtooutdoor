/**
 * Back to Outdoor – Anfragen-Automation (Google Apps Script)
 *
 * Was passiert bei jeder Anfrage von der Website (Formular oder KI-Chat):
 *   1. Der Anfragende bekommt sofort eine persönliche Antwort-Mail (von infobacktooutdoor@gmail.com, Antworten gehen dorthin zurück).
 *   2. infobacktooutdoor@gmail.com bekommt eine Benachrichtigung mit allen Daten + der verschickten Antwort (Kopie an info@backtooutdoor.com).
 *   3. Die Anfrage wird als neue Zeile in dieser Tabelle eingetragen (Liste mit Status) – das ist die Liste, mit der JARVIS/das Agenten-Team weiterarbeitet.
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
  SECRET: 'bto-2026-salzburg-x7k2',           // identisch mit LEAD_SECRET in Vercel – kannst du auch selbst ändern
  INFO_MAIL: 'infobacktooutdoor@gmail.com',   // bekommt jede Anfrage (primär)
  INFO_MAIL_CC: 'info@backtooutdoor.com',     // bekommt jede Anfrage als Kopie
  AUTO_ANTWORT: true,                         // false = Antwort wird nur als Gmail-Entwurf angelegt
  ABSENDER_NAME: 'Basti · Back to Outdoor',
  ABSENDER_ADRESSE: '',                       // optional: z. B. info@backtooutdoor.com, falls in Gmail als "Senden als"-Adresse eingerichtet
  BLATT: 'Anfragen',
  BLATT_KLICKS: 'Klicks',                     // Tab für Kooperations-/Affiliate-Link-Klicks (siehe api/go.js)
};

const SPALTEN = ['Eingang', 'Status', 'Name', 'Firma', 'E-Mail', 'Telefon', 'Typ', 'Wunsch', 'Anliegen',
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

function verarbeiten_(d) {
  const blatt = blatt_();
  let status = 'Neu';
  let beantwortet = false;

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
    if (CONFIG.AUTO_ANTWORT) {
      GmailApp.sendEmail(d.email, d.antwort_betreff, d.antwort_text, opts);
      status = 'Beantwortet';
      beantwortet = true;
    } else {
      GmailApp.createDraft(d.email, d.antwort_betreff, d.antwort_text, opts);
      status = 'Antwort als Entwurf';
    }
  }

  // 2. Benachrichtigung an info@
  const zeilen = [
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
  GmailApp.sendEmail(CONFIG.INFO_MAIL,
    'Neue Anfrage: ' + (d.firma || d.name) + ' – ' + (d.wunsch || 'Anfrage'),
    zeilen.join('\n'),
    { name: 'Website-Anfragen Back to Outdoor', replyTo: d.email, cc: CONFIG.INFO_MAIL_CC || undefined });

  // 3. Eintrag in die Liste
  blatt.appendRow([
    new Date(d.zeit || Date.now()), status, d.name, d.firma, d.email, d.telefon, d.typ, d.wunsch,
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
  return sh;
}

function formatieren_(sh) {
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, SPALTEN.length).setFontWeight('bold').setBackground('#132030').setFontColor('#f7f5f0');
    sh.setColumnWidths(1, SPALTEN.length, 140);
    sh.setColumnWidth(9, 320); sh.setColumnWidth(14, 320); sh.setColumnWidth(15, 260);
    sh.getRange('A:A').setNumberFormat('dd.MM.yyyy HH:mm');
    const regel = SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).setAllowInvalid(true).build();
    sh.getRange(2, 2, 1000, 1).setDataValidation(regel);
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

function doGet() {
  return json_({ ok: true, dienst: 'BTO Anfragen' });
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
