/**
 * Back to Outdoor – Mindset-Tetris-Mailstrecke (Google Apps Script, kostenlos über Gmail)
 *
 * Ersetzt ein bezahltes Newsletter-Tool (z. B. ActiveCampaign) für den E-Book-Funnel:
 *   1. Wer Teil 1 holt UND das Newsletter-Häkchen setzt, bekommt in der Teil-1-Mail einen Bestätigungslink (Double-Opt-in).
 *   2. Erst nach dem Klick startet die Strecke: Tag 2 Tipp, Tag 5 Angebot Teil 2, Tag 10 weitere E-Books.
 *   3. Jede Mail hat einen Abmeldelink. Abgemeldete bekommen nie wieder eine Mail aus der Strecke.
 *   4. Alles steht im Tab "Mailstrecke" der Tabelle "BTO Anfragen" (Nachweis der Einwilligung inkl. Zeitpunkt).
 *
 * Sicherheit:
 *   - Bestätigungs- und Abmeldelinks sind mit dem SECRET signiert (HMAC). Niemand kann fremde Adressen an- oder abmelden.
 *   - Ohne gesetztes SECRET bleibt die Strecke aus.
 *   - Keine externen Dienste, keine Bibliotheken: nur Gmail und die eigene Tabelle.
 *
 * Einrichtung (gleiches Apps-Script-Projekt wie BTO_Anfragen_AppsScript.gs):
 *   1. Im Apps-Script-Editor links "+" → "Skript" → Name "Mailstrecke" → diesen Code einfügen → speichern.
 *   2. Den aktualisierten Code von BTO_Anfragen_AppsScript.gs ebenfalls einfügen (doGet und verarbeiten_ wurden ergänzt).
 *   3. Funktion "mailstreckeEinrichten" auswählen → Ausführen (▶) → Berechtigungen erlauben.
 *      Das legt den Tab "Mailstrecke" an und startet einen stündlichen Zeitauslöser.
 *   4. "Bereitstellen" → "Bereitstellungen verwalten" → Stift → Version "Neue Version" → Bereitstellen.
 *      (Die URL bleibt gleich, in Vercel muss nichts geändert werden.)
 *   5. Test: Funktion "testMailstrecke" ausführen. Du bekommst die Bestätigungsmail an dein eigenes Konto.
 *
 * Grenze: Ein kostenloses Gmail-Konto darf per Apps Script ca. 100 Empfänger pro Tag anschreiben.
 */

const STRECKE = {
  BLATT: 'Mailstrecke',
  SPALTEN: ['Eingang', 'E-Mail', 'Vorname', 'Produkt', 'Titel', 'Teil-2-Link', 'Landingpage', 'Status',
    'Bestätigt am', 'Abgemeldet am', 'Letzte Mail', 'Letzte Mail am'],
  // Status: Unbestätigt → Aktiv → Fertig | Abgemeldet
  MAILS: [
    { nr: 1, tage: 2, betreff: function (z) { return 'Wie liegt dein erster Stein? 🧱'; },
      text: function (z) {
        return 'Hallo ' + z.vorname + ',\n\n' +
          'vor zwei Tagen hast du Teil 1 von „' + z.titel + '“ geholt. Kurze Frage: Hast du deinen ersten Stein schon gelegt?\n\n' +
          'Falls nicht, ist das völlig normal. Mein Tipp: Nimm dir heute nur die erste Aufgabe vor und mach sie so klein, dass sie lächerlich einfach wirkt. ' +
          'Zwei Minuten reichen. Es geht nicht um viel, sondern um den Anfang.\n\n' +
          'Teil 1 findest du hier noch einmal:\n' + z.landing + '\n\n' +
          'Liebe Grüße\nBasti von Mindset Tetris';
      } },
    { nr: 2, tage: 5, betreff: function (z) { return 'Bereit für das nächste Level?'; },
      text: function (z) {
        return 'Hallo ' + z.vorname + ',\n\n' +
          'wenn Teil 1 von „' + z.titel + '“ dir geholfen hat, geht es in Teil 2 weiter: mehr Level, konkrete Übungen und ein Plan für die nächsten Wochen. ' +
          'Sofort als PDF:\n' + z.teil2 + '\n\n' +
          'Und wenn es gerade nicht passt, auch gut. Teil 1 bleibt deins.\n\n' +
          'Liebe Grüße\nBasti von Mindset Tetris';
      } },
    { nr: 3, tage: 10, betreff: function (z) { return 'Noch mehr Steine für dein Mindset'; },
      text: function (z) {
        return 'Hallo ' + z.vorname + ',\n\n' +
          'das ist meine letzte Mail aus dieser kleinen Reihe. Falls du Lust auf mehr hast: Es gibt weitere Mindset-Tetris-E-Books, ' +
          'z. B. zu Morgenroutine, Fokus, Loslassen und Komfortzone. Teil 1 ist jeweils gratis:\n' +
          'https://backtooutdoor.com/mindset\n\n' +
          'Danke, dass du dabei warst!\nBasti von Mindset Tetris';
      } },
  ],
};

// ---------- Anmeldung (wird aus verarbeiten_ aufgerufen) ----------

/** Prüft, ob die Anfrage in die Strecke gehört, legt sie als "Unbestätigt" an und hängt den Bestätigungslink an die Teil-1-Mail. */
function streckeAnmelden_(d, kanal) {
  if (!CONFIG.SECRET || CONFIG.SECRET === 'HIER-SECRET-EINTRAGEN') return;
  if (kanal !== 'Mindset Tetris' || d.wunsch !== 'E-Book Teil 1' || d.newsletter !== 'ja' || !d.ebook) return;
  const email = String(d.email).trim().toLowerCase();
  const sh = streckeBlatt_();
  const zeile = streckeZeile_(sh, email, d.produkt);
  if (zeile && sh.getRange(zeile, 8).getValue() === 'Abgemeldet') return; // nie wieder anschreiben
  if (!zeile) {
    sh.appendRow([new Date(), email, vorname_(d.name), d.produkt, d.ebook.titel, d.ebook.teil2, d.ebook.landing,
      'Unbestätigt', '', '', 0, ''].map(sicher_));
  }
  const link = streckeLink_('bestaetigen', email, d.produkt);
  d.antwort_text += '\n\n---\nDu hast angekreuzt, dass du Mindset-Tipps per Mail bekommen möchtest. ' +
    'Bitte bestätige das mit einem Klick (ohne Klick bekommst du nur diese eine Mail):\n' + link;
}

// ---------- Links: bestätigen / abmelden ----------

function streckeGet_(e) {
  const p = e.parameter || {};
  const email = String(p.e || '').toLowerCase(), produkt = String(p.p || '');
  if (!email || !p.s || p.s !== signatur_(p.a + '|' + email + '|' + produkt)) return seite_('Dieser Link ist ungültig oder abgelaufen.');
  const sh = streckeBlatt_();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (p.a === 'abmelden') {
      // Abmelden gilt für alle E-Books dieser Adresse
      const daten = sh.getDataRange().getValues();
      for (let i = 1; i < daten.length; i++) {
        if (daten[i][1] === email) { sh.getRange(i + 1, 8).setValue('Abgemeldet'); sh.getRange(i + 1, 10).setValue(new Date()); }
      }
      return seite_('Du bist abgemeldet und bekommst keine Mails mehr aus dieser Reihe.');
    }
    if (p.a === 'bestaetigen') {
      const z = streckeZeile_(sh, email, produkt);
      if (!z) return seite_('Diese Anmeldung wurde nicht gefunden.');
      const status = sh.getRange(z, 8).getValue();
      if (status === 'Unbestätigt') { sh.getRange(z, 8).setValue('Aktiv'); sh.getRange(z, 9).setValue(new Date()); }
      if (status === 'Abgemeldet') return seite_('Diese Adresse ist abgemeldet.');
      return seite_('Danke, bestätigt! Die nächsten Tipps kommen in ein paar Tagen.');
    }
  } finally {
    lock.releaseLock();
  }
  return seite_('Unbekannte Aktion.');
}

// ---------- Versand (stündlicher Zeitauslöser) ----------

function streckeVersenden() {
  if (!CONFIG.SECRET || CONFIG.SECRET === 'HIER-SECRET-EINTRAGEN') { Logger.log('SECRET fehlt – Strecke aus.'); return; }
  const sh = streckeBlatt_();
  const daten = sh.getDataRange().getValues();
  const jetzt = Date.now();
  let gesendet = 0;
  for (let i = 1; i < daten.length && gesendet < 40; i++) {
    const r = daten[i];
    if (r[7] !== 'Aktiv' || !r[8]) continue;
    const naechste = STRECKE.MAILS[Number(r[10]) || 0];
    if (!naechste) { sh.getRange(i + 1, 8).setValue('Fertig'); continue; }
    if (jetzt - new Date(r[8]).getTime() < naechste.tage * 86400000) continue;
    const z = { email: r[1], vorname: r[2] || '', produkt: r[3], titel: r[4], teil2: r[5], landing: r[6] };
    const abmelden = streckeLink_('abmelden', z.email, z.produkt);
    const text = naechste.text(z) + '\n\n---\nKeine Mails mehr? Hier abmelden: ' + abmelden;
    try {
      const hm = htmlMail_(text, 'Mindset Tetris');
      GmailApp.sendEmail(z.email, naechste.betreff(z), text, {
        name: 'Basti · Mindset Tetris', replyTo: CONFIG.INFO_MAIL, htmlBody: hm.html,
      });
      sh.getRange(i + 1, 11, 1, 2).setValues([[naechste.nr, new Date()]]);
      if (naechste.nr === STRECKE.MAILS.length) sh.getRange(i + 1, 8).setValue('Fertig');
      gesendet++;
    } catch (err) {
      Logger.log('Versand an ' + z.email + ' fehlgeschlagen: ' + err.message);
      if (/limit|quota/i.test(err.message)) break; // Tageslimit erreicht → nächste Stunde weiter
    }
  }
  Logger.log(gesendet + ' Mails verschickt.');
}

// ---------- Hilfsfunktionen ----------

function streckeBlatt_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(STRECKE.BLATT);
  if (!sh) {
    sh = ss.insertSheet(STRECKE.BLATT);
    sh.appendRow(STRECKE.SPALTEN);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, STRECKE.SPALTEN.length).setFontWeight('bold').setBackground('#132030').setFontColor('#f7f5f0');
    sh.getRange('A:A').setNumberFormat('dd.MM.yyyy HH:mm');
    sh.getRange('I:J').setNumberFormat('dd.MM.yyyy HH:mm');
    sh.getRange('L:L').setNumberFormat('dd.MM.yyyy HH:mm');
  }
  return sh;
}

function streckeZeile_(sh, email, produkt) {
  const daten = sh.getDataRange().getValues();
  for (let i = 1; i < daten.length; i++) if (daten[i][1] === email && daten[i][3] === produkt) return i + 1;
  return 0;
}

function signatur_(text) {
  const bytes = Utilities.computeHmacSha256Signature(text, CONFIG.SECRET);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '').slice(0, 32);
}

function streckeLink_(aktion, email, produkt) {
  const basis = ScriptApp.getService().getUrl();
  return basis + '?a=' + aktion + '&e=' + encodeURIComponent(email) + '&p=' + encodeURIComponent(produkt) +
    '&s=' + signatur_(aktion + '|' + email + '|' + produkt);
}

function vorname_(name) {
  return String(name || '').trim().split(/\s+/)[0] || '';
}

function seite_(text) {
  const t = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return HtmlService.createHtmlOutput('<div style="font-family:Arial,sans-serif;max-width:480px;margin:60px auto;padding:0 20px;color:#132030">' +
    '<h2>Mindset Tetris</h2><p>' + t + '</p><p><a href="https://backtooutdoor.com/mindset">Zur Website</a></p></div>')
    .setTitle('Mindset Tetris');
}

/** Einmal ausführen: legt den Tab an und startet den stündlichen Versand. */
function mailstreckeEinrichten() {
  streckeBlatt_();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'streckeVersenden') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('streckeVersenden').timeBased().everyHours(1).create();
  Logger.log('Mailstrecke bereit. Web-App-URL: ' + ScriptApp.getService().getUrl());
}

/** Test: legt dich selbst als Anmeldung an und schickt dir die Teil-1-Mail mit Bestätigungslink. */
function testMailstrecke() {
  const ich = Session.getActiveUser().getEmail() || CONFIG.INFO_MAIL;
  verarbeiten_({
    zeit: new Date().toISOString(), name: 'Test Person', email: ich, wunsch: 'E-Book Teil 1', newsletter: 'ja',
    produkt: 'mindset-gedanken', seite: '/gedanken-tetris.html', quelle: 'Test', sprache: 'de', kanal: 'Mindset Tetris',
    ebook: { titel: 'Negative Gedanken loswerden', teil2: 'https://backtooutdoor.com/api/go?l=mindset-gedanken-teil-2',
      landing: 'https://backtooutdoor.com/gedanken-tetris.html' },
    antwort_betreff: 'Test: Dein Teil 1', antwort_text: 'Hallo Test,\n\nhier wäre dein Teil 1.\n\nLiebe Grüße\nBasti',
  });
  Logger.log('Test-Mail mit Bestätigungslink verschickt an ' + ich);
}
