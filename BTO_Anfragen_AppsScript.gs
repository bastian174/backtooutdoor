/**
 * Back to Outdoor – Anfragen-Automation (Google Apps Script)
 *
 * Was passiert bei jeder Anfrage von der Website (Formular oder KI-Chat):
 *   1. Der Anfragende bekommt sofort eine persönliche Antwort-Mail (von deinem Google-Konto, Antworten gehen an info@).
 *   2. info@backtooutdoor.com bekommt eine Benachrichtigung mit allen Daten + der verschickten Antwort.
 *   3. Die Anfrage wird als neue Zeile in dieser Tabelle eingetragen (Liste mit Status).
 *
 * Einrichtung: siehe Anleitung (Einrichtung_Anfragen.md). Kurz:
 *   Google Tabelle "BTO Anfragen" anlegen → Erweiterungen → Apps Script → diesen Code einfügen
 *   → SECRET unten setzen → Funktion "testAnfrage" einmal ausführen (Berechtigungen erlauben)
 *   → Bereitstellen → Neue Bereitstellung → Web-App (Ausführen als: Ich, Zugriff: Jeder) → URL kopieren.
 */

const CONFIG = {
  SECRET: 'HIER-EIN-EIGENES-PASSWORT',      // identisch mit LEAD_SECRET in Vercel
  INFO_MAIL: 'info@backtooutdoor.com',       // bekommt jede Anfrage
  AUTO_ANTWORT: true,                        // false = Antwort wird nur als Gmail-Entwurf angelegt
  ABSENDER_NAME: 'Basti · Back to Outdoor',
  ABSENDER_ADRESSE: '',                      // optional: z. B. info@backtooutdoor.com, falls in Gmail als "Senden als"-Adresse eingerichtet
  BLATT: 'Anfragen',
};

const SPALTEN = ['Eingang', 'Status', 'Name', 'Firma', 'E-Mail', 'Telefon', 'Typ', 'Wunsch', 'Anliegen',
  'Seite', 'Quelle', 'Sprache', 'Antwort-Betreff', 'Antwort (verschickt)', 'Nächster Schritt / Notizen'];
const STATUS = ['Neu', 'Beantwortet', 'Antwort als Entwurf', 'Gespräch vereinbart', 'Angebot geschickt', 'Gewonnen', 'Verloren', 'Spam'];

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, fehler: 'json' }); }
  if (CONFIG.SECRET && d.secret !== CONFIG.SECRET) return json_({ ok: false, fehler: 'secret' });
  if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return json_({ ok: false, fehler: 'email' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return json_(verarbeiten_(d));
  } finally {
    lock.releaseLock();
  }
}

function verarbeiten_(d) {
  const blatt = blatt_();
  let status = 'Neu';
  let beantwortet = false;

  // 1. Antwort an den Anfragenden
  if (d.antwort_betreff && d.antwort_text) {
    const opts = { name: CONFIG.ABSENDER_NAME, replyTo: CONFIG.INFO_MAIL };
    if (CONFIG.ABSENDER_ADRESSE && GmailApp.getAliases().indexOf(CONFIG.ABSENDER_ADRESSE) >= 0) opts.from = CONFIG.ABSENDER_ADRESSE;
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
    { name: 'Website-Anfragen Back to Outdoor', replyTo: d.email });

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
  if (!sh) {
    sh = ss.insertSheet(CONFIG.BLATT);
    sh.appendRow(SPALTEN);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, SPALTEN.length).setFontWeight('bold').setBackground('#132030').setFontColor('#f7f5f0');
    sh.setColumnWidths(1, SPALTEN.length, 140);
    sh.setColumnWidth(9, 320); sh.setColumnWidth(14, 320); sh.setColumnWidth(15, 260);
    sh.getRange('A:A').setNumberFormat('dd.MM.yyyy HH:mm');
    const regel = SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).setAllowInvalid(true).build();
    sh.getRange(2, 2, 1000, 1).setDataValidation(regel);
  }
  return sh;
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
