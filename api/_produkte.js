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
    landing: BASIS + "/gewohnheits-tetris",
    teil1: BASIS + "/assets/ebooks/gewohnheits-tetris-teil-1.pdf",
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
