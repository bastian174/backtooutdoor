# Real Estate Demo Engine — Back to Outdoor

## Zweck
Dieser Skill erweitert das bestehende Back-to-Outdoor-Immobilien-Showcase zu einem wiederholbaren Prozess, mit dem für Interessenten individuelle Website-Demos entstehen. Die verbindliche Designreferenz ist https://backtooutdoor.com/immobilien und die vorhandene Implementierung in `immobilien-showcase.html`.

## Arbeitsprinzip
- Kunden-Website = Quelle für Fakten, Markenidentität, Angebote und freigegebene Inhalte.
- Back-to-Outdoor-Immobilien-Showcase = Quelle für visuellen Stil, Animationen, Seitenrhythmus und Qualität.
- Ergebnis = eigenständige, kundenspezifische Landingpage, keine unveränderte Kopie der Referenzseite.
- Bestehende Produktionsdateien und die Live-Domain dürfen nicht ohne ausdrückliche Freigabe geändert werden.

## Prozess
1. Kunden-URL entgegennehmen und Website sowie relevante Unterseiten tatsächlich untersuchen.
2. Fakten, Objektangaben, Leistungen, Kontaktwege, Logos, Farben, Bilder und Quellen in einer Content-Inventarliste erfassen.
3. Designreferenz untersuchen: Farben, Typografie, Abstände, Hero, Sticky-/Scroll-Sektionen, Bildübergänge, Karten, CTA und mobile Regeln.
4. Ein Mapping erstellen: vorhandener Kundeninhalt → passender Abschnitt der neuen Landingpage. Fehlende Daten markieren, niemals erfinden.
5. Eine individuelle Demo bauen. Verwende das vorhandene Designsystem als Inspiration: dunkles Anthrazit, warme helle Schrift, Sand-/Terrakotta-Akzente, Serifenschrift für emotionale Headlines, großzügige Bildflächen, Cinematic Scrolling und gezielte Animationen. Passe Farben an die Kundenmarke an, wenn dies die Marke besser repräsentiert.
6. Verwende CSS-Animationen und Scroll-Observer für einfache Effekte; GSAP/ScrollTrigger oder Three.js nur, wenn der bestehende Stack und der Nutzen dies rechtfertigen. Halte die HTML-Demo möglichst eigenständig.
7. Inhalte und Assets auf Nutzungsrechte prüfen. Kundeneigene Materialien nur verwenden, wenn ihre Verwendung für die Demo zulässig ist. Keine fremden Logos, Bewertungen oder Objektinformationen erfinden.
8. Mobile Darstellung, Tastaturbedienung, reduzierte Bewegung, Links, Formulare und Konsolenfehler prüfen.
9. Demo auf einem separaten Branch oder einem geschützten Preview-Deployment bereitstellen. Nicht direkt auf die Produktionsdomain veröffentlichen.
10. Die Preview-URL tatsächlich öffnen und prüfen. Status, Tests, offene Punkte und verwendete Platzhalter transparent dokumentieren.
11. Erst nach ausdrücklicher Kundenfreigabe und bestätigten Zugriffsrechten die endgültige Umsetzung und Veröffentlichung vorbereiten.

## Qualitätsregeln
- Responsive: Smartphone, Tablet und Desktop.
- Performance: optimierte Bilder, Video nur bei Bedarf laden, keine unnötigen Render-Loops.
- Accessibility: semantisches HTML, sichtbare Fokuszustände, Kontrast, `prefers-reduced-motion`.
- Conversion: klare Kontakt-CTA und sichtbare nächste Schritte.
- Fakten: Preise, Flächen, Verfügbarkeit, Adressen und Bewertungen niemals erfinden.
- Formulare: nicht als erfolgreich absenden darstellen, wenn kein Backend vorhanden ist.
- Privatsphäre: Vorschau-URL nicht als sicheren Zugriffsschutz behandeln; wenn vertrauliche Kundendaten enthalten sind, Preview schützen.
- Qualitätssicherung: nicht behaupten, etwas getestet oder deployed zu haben, wenn es nicht tatsächlich geprüft wurde.

## Ausgabe bei jedem Auftrag
- Kunden-URL und tatsächlich untersuchte Seiten
- Inhalts-/Asset-Inventar und fehlende Angaben
- kurze Designentscheidung
- geänderte/erstellte Dateien
- tatsächlich getestete Funktionen
- bestätigte Preview-URL oder genaue Blockade
- offene Punkte und Schritte bis zur finalen Veröffentlichung

## Projektparameter
Der Auftrag kann diese Felder enthalten:
- `CLIENT_URL`: Pflichtfeld
- `CLIENT_NAME`: wenn bekannt
- `CLIENT_GOAL`: z. B. Immobilienverkauf, Neubauprojekt, Makler-Leads
- `PREVIEW_PATH`: gewünschter Pfad
- `ASSET_PERMISSION`: bekannte Nutzungsrechte / Einschränkungen

Wenn `CLIENT_URL` fehlt, frage nach genau dieser einen Information.
