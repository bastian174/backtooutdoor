# KI-Agent für backtooutdoor.com – so geht er live

## Was drin ist
- `agent.js` – das Chat-Widget (unten rechts auf jeder Seite, DE/EN/FR automatisch nach Seitensprache)
- `api/chat.js` – der „Kopf“ des Agenten (Vercel-Funktion, nutzt Claude). Enthält das komplette Wissen: Pakete, Ablauf, Referenzen, Kontakt, Regeln (nie Preise nennen, nichts erfinden, keine Drohne, zum Erstgespräch führen)
- Alle 10 Seiten: Script-Zeile eingebaut + kleiner Mobil-Fix (der „Angebot anfragen“-Button im Menü hat die Seite auf dem Handy breiter gemacht als den Bildschirm)
- `datenschutz.html`: neuer Abschnitt „5. KI-Chat-Assistent“ (Rest neu nummeriert)

## Schritt 1 – Dateien hochladen (GitHub)
Repo `bastian174/backtooutdoor` → **Add file → Upload files** → den kompletten Inhalt dieses Ordners hineinziehen (inkl. Ordner `api`) → **Commit changes**. Vercel baut automatisch neu.

Ab jetzt läuft der Agent schon im **Offline-Modus**: Er beantwortet die häufigsten Fragen (Pakete, Preise, Ablauf, Referenzen …) und öffnet bei Interesse ein Anfrageformular, das eine fertige E-Mail an info@backtooutdoor.com erstellt.

## Schritt 2 – KI einschalten (ca. 5 Min.)
1. Auf https://console.anthropic.com anmelden → **API Keys → Create Key** → Key kopieren. Unter **Billing** ein kleines Guthaben aufladen (z. B. 5–10 €) und ein monatliches Limit setzen.
2. Vercel → Projekt → **Settings → Environment Variables** → neu:
   - `ANTHROPIC_API_KEY` = der kopierte Key
3. **Deployments → Redeploy**. Fertig – der Agent antwortet jetzt frei und intelligent.

Test: `https://backtooutdoor.com/api/chat` im Browser öffnen → `"aktiv":true` heißt: KI läuft.

## Optional
| Variable | Wofür |
|---|---|
| `LEAD_WEBHOOK_URL` | Jede Anfrage aus dem Chat automatisch weiterleiten, z. B. per Make/Zapier → E-Mail, Google Sheet oder CRM |
| `BOOKING_URL` | Link zu deiner Terminbuchung (z. B. Google-Kalender-Terminbuchungsseite) – der Agent bietet dann direkt Termine an |
| `ANTHROPIC_MODEL` | Standard `claude-haiku-4-5` (schnell, günstig). Nur ändern, wenn nötig |

Ohne Webhook landen Anfragen, die der Agent im KI-Modus aufnimmt, in **Vercel → Logs** (Suche nach „NEUER LEAD“) – deshalb Webhook empfohlen.

## Wissen ändern
In `api/chat.js` den Block `WISSEN` bearbeiten (z. B. neue Referenz, neues Paket) → hochladen → fertig.

## Buttons mit dem Chat verknüpfen (optional)
Jeder Button kann den Agenten öffnen:
`<a href="#kontakt" onclick="BTOAgent.open('Ich möchte ein kostenloses Gespräch');return false;">Kostenloses Gespräch vereinbaren</a>`
