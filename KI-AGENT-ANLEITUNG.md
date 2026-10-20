# KI-Agent für backtooutdoor.com – so geht er live

## Was drin ist
- `agent.js` – das Chat-Widget (unten rechts auf jeder Seite, DE/EN/FR automatisch nach Seitensprache)
- `api/chat.js` – der „Kopf“ des Agenten (Vercel-Funktion, nutzt Google Gemini; Claude als Alternative). Enthält das komplette Wissen: Pakete, Ablauf, Referenzen, Kontakt, Regeln (nie Preise nennen, nichts erfinden, keine Drohne, zum Erstgespräch führen)
- Alle 10 Seiten: Script-Zeile eingebaut + kleiner Mobil-Fix (der „Angebot anfragen“-Button im Menü hat die Seite auf dem Handy breiter gemacht als den Bildschirm)
- `datenschutz.html`: neuer Abschnitt „5. KI-Chat-Assistent“ (Rest neu nummeriert)

## Schritt 1 – Dateien hochladen (GitHub)
Repo `bastian174/backtooutdoor` → **Add file → Upload files** → den kompletten Inhalt dieses Ordners hineinziehen (inkl. Ordner `api`) → **Commit changes**. Vercel baut automatisch neu.

Ab jetzt läuft der Agent schon im **Offline-Modus**: Er beantwortet die häufigsten Fragen (Pakete, Preise, Ablauf, Referenzen …) und öffnet bei Interesse ein Anfrageformular, das eine fertige E-Mail an info@backtooutdoor.com erstellt.

## Schritt 2 – KI einschalten (ca. 5 Min.)
1. Auf https://aistudio.google.com anmelden → **Get API key** → Key kopieren (kostenlos).
2. Vercel → Projekt → **Settings → Environment Variables** → neu:
   - `GEMINI_API_KEY` = der kopierte Key
3. **Deployments → Redeploy**. Fertig – der Agent antwortet jetzt frei und intelligent.

Alternative: Statt Gemini kann Claude genutzt werden – dann `ANTHROPIC_API_KEY` setzen (https://console.anthropic.com → **API Keys**, Guthaben + Monatslimit unter **Billing**) und **keinen** `GEMINI_API_KEY`. Ist ein Gemini-Key gesetzt, hat er Vorrang.
`ANTHROPIC_API_KEY` wird außerdem (unabhängig vom Chat) für die persönliche KI-Antwort-Mail auf Anfragen genutzt; ohne Key geht eine Standardvorlage raus.

Test: `https://backtooutdoor.com/api/chat` im Browser öffnen → `"aktiv":true` heißt: KI läuft (`"anbieter"` zeigt `gemini` oder `claude`).

## Optional
| Variable | Wofür |
|---|---|
| `LEAD_WEBHOOK_URL` + `LEAD_SECRET` | Google-Apps-Script: Mail an info@, automatische Antwort an den Anfragenden, Eintrag in die Tabelle „BTO Anfragen“ (Anleitung: Einrichtung_Anfragen.md) |
| `MEDIA_KIT_URL` | Link zum Media-Kit-PDF, wird bei Media-Kit-Anfragen automatisch mitgeschickt |
| `BOOKING_URL` | Link zu deiner Terminbuchung (z. B. Google-Kalender-Terminbuchungsseite) – der Agent bietet dann direkt Termine an |
| `GEMINI_MODEL` | Standard `gemini-2.5-flash`. Nur ändern, wenn nötig |
| `ANTHROPIC_MODEL` | Standard `claude-haiku-4-5` (schnell, günstig). Nur ändern, wenn nötig |
| `INFO_MAIL` / `INFO_MAIL_CC` | Empfänger der Anfragen ohne Webhook (Standard `info@backtooutdoor.com`), optional Kopie |

Ohne Webhook gehen Anfragen über FormSubmit direkt an `INFO_MAIL` (einmalig die „Activate Form“-Mail bestätigen, auch im Spam-Ordner nachsehen); der Anfragende bekommt automatisch die Antwort-Mail. Jede Anfrage steht zusätzlich in **Vercel → Logs** (Suche nach „NEUER LEAD“).

## Wissen ändern
In `api/chat.js` den Block `WISSEN` bearbeiten (z. B. neue Referenz, neues Paket) → hochladen → fertig.

## Buttons
Alle Buttons mit Ziel `#kontakt` oder `#mediakit` (Klasse `btn` oder `nav-cta`) öffnen automatisch das passende Formular im Chat. Eigener Button: `data-bto="Media Kit"`, `data-bto="Angebot"` oder `data-bto="Erstgespräch"` als Attribut setzen.
