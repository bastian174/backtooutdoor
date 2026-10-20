# backtooutdoor.com

Website von **Back to Outdoor** (Outdoor Content Studio, Salzburg) und **Mindset Tetris**: statische HTML-Seiten auf Deutsch, Englisch und Französisch, gehostet auf Vercel, plus ein paar Serverless-Funktionen für Chat, Anfragen und Link-Tracking.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `*.html` (Root) | Startseiten (`index`, `index-en`, `index-fr`), Shop, Journal-Übersichten, Reise-/Outdoor-Artikel, Mindset-Tetris-Landingpages, Rechtliches |
| `mindset/` | Mindset-Artikel (DE/EN/FR, mit hreflang verknüpft) |
| `journal/` | alte Artikel-URLs – werden per `vercel.json` auf `/:slug` weitergeleitet |
| `assets/` | CSS, JS, Bilder, Videos, E-Book-PDFs (nur Teil 1 – Teil 2 liegt ausschließlich bei CopeCart) |
| `api/` | Vercel-Funktionen (siehe unten); Dateien mit `_` sind Hilfsmodule, keine Endpunkte |
| `agent.js` | Chat-Widget (unten rechts auf jeder Seite) |
| `sitemap.xml`, `robots.txt` | SEO |
| `scripts/seo-check.py` | automatischer SEO-Check |
| `tests/` | Tests für die API |
| `docs/plan.md` | SEO-Audit und Umsetzungsplan |

## API-Endpunkte

| Endpunkt | Zweck |
|---|---|
| `POST /api/chat` | KI-Chat-Agent (Gemini, alternativ Claude); erfasst Anfragen über das Tool `lead_erfassen` |
| `POST /api/lead` | Anfrageformular (Chat-Widget & Buttons) mit Spam-Schutz |
| `GET /api/go?l=<slug>` | Klick-Tracking + Weiterleitung für Kooperations-/E-Book-Links (nur fest hinterlegte Ziele) |

Lead-Verarbeitung (`api/_leads.js`): Anfrage prüfen → Kanal bestimmen (Back to Outdoor / Mindset Tetris / Immobilien) → Antwort-Mail erstellen → an Google Apps Script (`LEAD_WEBHOOK_URL`) senden, sonst bzw. bei Fehler per FormSubmit an `INFO_MAIL`.
E-Books: neue Produkte in `api/_produkte.js` eintragen.

Einrichtung und alle Umgebungsvariablen: **[KI-AGENT-ANLEITUNG.md](KI-AGENT-ANLEITUNG.md)**.

## Tests & Checks

Voraussetzung: Node.js ≥ 20 (Vercel nutzt 24.x) und Python 3 – keine Abhängigkeiten zu installieren. Deshalb überspringt `vercel.json` den `npm install`-Schritt beim Build.

```bash
npm test               # API-Tests (node --test), externe Dienste werden gemockt
npm run seo-check      # Sitemap, Titel, Description, Canonical, H1, hreflang, interne Links
```

Beides läuft automatisch bei jedem Push auf `main` und jedem Pull Request (`.github/workflows/seo-check.yml`).

## Neue Seite veröffentlichen – Checkliste

1. `<title>`, `<meta name="description">`, `<link rel="canonical">`, genau eine `<h1>`, `lang` am `<html>`.
2. Übersetzungen per `hreflang` verknüpfen (falls vorhanden).
3. In `sitemap.xml` eintragen – interne Vorschau-/Kundenseiten stattdessen mit `<meta name="robots" content="noindex, follow">`.
4. `npm run seo-check` muss grün sein.

## Deployment

Jeder Push auf `main` wird von Vercel automatisch veröffentlicht; Pull Requests bekommen eine Vorschau-URL.
