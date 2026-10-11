// Digitale Produkte (Mindset Tetris E-Books) – Funnel: Keyword → Eintragen → Teil 1 gratis → Teil 2 bei CopeCart.
// Neues Produkt: Eintrag hier ergänzen, Teil-1-PDF nach /assets/ebooks/ legen, Landingpage anlegen.
// Teil 2 (bezahlt) liegt NUR bei CopeCart – niemals ins öffentliche Repo legen.
// copecart: Checkout-Link aus CopeCart eintragen, sobald das Produkt angelegt ist (leer = Landingpage als Platzhalter).

const BASIS = "https://backtooutdoor.com";

const PRODUKTE = {
  "gewohnheits-tetris": {
    titel: "Das Gewohnheits-Tetris",
    untertitel: "Gewohnheiten ändern – Stein für Stein",
    keyword: "GEWOHNHEIT",
    preis: "14,90 €",
    seiten: 14,
    landing: BASIS + "/gewohnheits-tetris.html",
    teil1: BASIS + "/assets/ebooks/gewohnheits-tetris-teil-1.pdf",
    copecart: "",
  },
  "mindset-gedanken": {
    titel: "Negative Gedanken loswerden",
    untertitel: "Teil 1 gratis, Teil 2 als PDF",
    keyword: "GEDANKEN",
    preis: "14,90 €",
    seiten: 6,
    landing: BASIS + "/gedanken-tetris.html",
    teil1: BASIS + "/assets/ebooks/mindset-gedanken-teil-1.pdf",
    copecart: "",
  },
  "mindset-loslassen": {
    titel: "Vergangenheit loslassen",
    untertitel: "Teil 1 gratis, Teil 2 als PDF",
    keyword: "LOSLASSEN",
    preis: "14,90 €",
    seiten: 6,
    landing: BASIS + "/loslassen-tetris.html",
    teil1: BASIS + "/assets/ebooks/mindset-loslassen-teil-1.pdf",
    copecart: "",
  },
  "mindset-scheitern": {
    titel: "Warum Scheitern der Schlüssel zum Erfolg ist",
    untertitel: "Teil 1 gratis, Teil 2 als PDF",
    keyword: "SCHEITERN",
    preis: "14,90 €",
    seiten: 6,
    landing: BASIS + "/scheitern-tetris.html",
    teil1: BASIS + "/assets/ebooks/mindset-scheitern-teil-1.pdf",
    copecart: "",
  },
  "mindset-morgenroutine": {
    titel: "Morgenroutine: So startest du erfolgreich in den Tag",
    untertitel: "Teil 1 gratis, Teil 2 als PDF",
    keyword: "MORGENROUTINE",
    preis: "14,90 €",
    seiten: 6,
    landing: BASIS + "/morgenroutine-tetris.html",
    teil1: BASIS + "/assets/ebooks/mindset-morgenroutine-teil-1.pdf",
    copecart: "",
  },
  "mindset-aufschieben": {
    titel: "Prokrastination überwinden: 5 Tipps, die sofort wirken",
    untertitel: "Teil 1 gratis, Teil 2 als PDF",
    keyword: "AUFSCHIEBEN",
    preis: "14,90 €",
    seiten: 6,
    landing: BASIS + "/aufschieben-tetris.html",
    teil1: BASIS + "/assets/ebooks/mindset-aufschieben-teil-1.pdf",
    copecart: "",
  },
  "mindset-komfortzone": {
    titel: "Komfortzone verlassen: 5 Schritte ins Unbekannte",
    untertitel: "Teil 1 gratis, Teil 2 als PDF",
    keyword: "KOMFORTZONE",
    preis: "14,90 €",
    seiten: 6,
    landing: BASIS + "/komfortzone-tetris.html",
    teil1: BASIS + "/assets/ebooks/mindset-komfortzone-teil-1.pdf",
    copecart: "",
  },
  "mindset-kleine-schritte": {
    titel: "Gewohnheiten ändern: Kleine Schritte, große Wirkung",
    untertitel: "Teil 1 gratis, Teil 2 als PDF",
    keyword: "KLEINESCHRITTE",
    preis: "14,90 €",
    seiten: 6,
    landing: BASIS + "/kleine-schritte-tetris.html",
    teil1: BASIS + "/assets/ebooks/mindset-kleine-schritte-teil-1.pdf",
    copecart: "",
  },
  "mindset-team": {
    titel: "Alleine schneller, gemeinsam mehr: Die Kraft im Team",
    untertitel: "Teil 1 gratis, Teil 2 als PDF",
    keyword: "TEAM",
    preis: "14,90 €",
    seiten: 6,
    landing: BASIS + "/team-tetris.html",
    teil1: BASIS + "/assets/ebooks/mindset-team-teil-1.pdf",
    copecart: "",
  },
  "mindset-gedankenkraft": {
    titel: "Die Macht der Gedanken: Wie Denken dein Leben formt",
    untertitel: "Teil 1 gratis, Teil 2 als PDF",
    keyword: "GEDANKENKRAFT",
    preis: "14,90 €",
    seiten: 6,
    landing: BASIS + "/gedankenkraft-tetris.html",
    teil1: BASIS + "/assets/ebooks/mindset-gedankenkraft-teil-1.pdf",
    copecart: "",
  },
  "mindset-spiegel": {
    titel: "Selbstreflexion: Der ehrliche Blick in den Spiegel",
    untertitel: "Teil 1 gratis, Teil 2 als PDF",
    keyword: "SPIEGEL",
    preis: "14,90 €",
    seiten: 6,
    landing: BASIS + "/spiegel-tetris.html",
    teil1: BASIS + "/assets/ebooks/mindset-spiegel-teil-1.pdf",
    copecart: "",
  },
};

function teil2Link(slug) {
  return BASIS + "/api/go?l=" + encodeURIComponent(slug + "-teil-2");
}

function teil2Ziel(slug) {
  const p = PRODUKTE[slug];
  return p ? p.copecart || p.landing + "#teil2" : null;
}

module.exports = { PRODUKTE, teil2Link, teil2Ziel };
