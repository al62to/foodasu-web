# AP-45: Eigene Kurzlinks auf foodasu.com, die auf den Store-Link mit Kennung weiterleiten

Auftrag der Projektleitung vom 25.10.2026, Alis Ja mit dem Abschicken. Anlass: Facebook nimmt den langen Link mit Kennung
für den Button der Seite nicht an. Gearbeitet nur in `foodasu-web` (Zweig `ap-45` von `main` `8dad697`) und in
`foodasu-play` (Punkt 4). `einkauf-app` nicht angefasst.

**Stand 25.10.2026, 07:55 Uhr: ONLINE.** `main` `14151d3` (Vorspulen von `ap-45`, vier Commits), GitHub-Lauf 40170425863
erfolgreich (bauen, veröffentlichen). Live 970 von 970 Dateien gleich dem Bau.

## 1. Ergebnis in Kürze

| Kurzlink | Ziel (Eintrag bei Google Play, Kennung hinter `&referrer=`) | gedacht für |
|---|---|---|
| `foodasu.com/fb` | `utm_source=facebook`, `utm_medium=social`, `utm_campaign=kurzlink` | Button der Facebook-Seite |
| `foodasu.com/ig` | `utm_source=instagram`, `utm_medium=social`, `utm_campaign=kurzlink` | Profil bei Instagram |
| `foodasu.com/app` | `utm_source=nachricht`, `utm_medium=persoenlich`, `utm_campaign=kurzlink` | WhatsApp und E-Mail |

Ziel jeweils `https://play.google.com/store/apps/details?id=at.tonc.einkauf&referrer=utm_source%3D…%26utm_medium%3D…%26utm_campaign%3Dkurzlink`
(kodiert wie in AP-44). Mit und ohne Schrägstrich am Ende: `/fb` antwortet bei GitHub Pages mit 301 auf `/fb/`, von dort
die Weiterleitung.

## 2. Was gebaut ist

- **Daten:** `KURZLINKS` in `src/daten/seite.mjs` (Pfad, Quelle, Medium, Ziel, wofür); eine Quelle für Bau und Prüfung.
- **Seiten:** `src/pages/[kurzlink]/index.astro` erzeugt `/fb/`, `/ig/`, `/app/` aus `KURZLINKS`. Layout
  `src/layouts/Weiterleitung.astro` und `src/styles/weiterleitung.css`.
- **Weiterleitung:** `<meta http-equiv="refresh" content="0; url=<Ziel>">`. **Ohne Skript, ohne Cookies, ohne Messung**, keine
  Anfrage an Dritte (nur `favicon.svg`, das gemeinsame Stylesheet und die Schrift, alles von foodasu.com; Cookies auf
  foodasu.com: 0).
- **Ausweichseite** (nur sichtbar, wenn die Weiterleitung nicht greift), im Stil der Website: der Schriftzug FoodAsu und
  der Knopf „Weiter zu FoodAsu bei Google Play“, sonst nichts. Bild: `docs/berichte/AP-45_Bilder/kurzlink_ausweichseite.png`.
- **noindex** (`noindex, follow`), keine kanonische Adresse, keine Navigation, keine Fußzeile. Nicht in `sitemap.xml`,
  nicht in `llms.txt` (beide entstehen aus `meta.mjs`; die Seiten stehen dort nicht), von keiner Seite verlinkt,
  `robots.txt` ohne `Disallow` (sonst sähe Google das noindex nicht).
- **Stylesheet-Name:** Ohne einen (sonst unnötigen) Import von `Motive.astro` im neuen Layout nennt Astro das gemeinsame
  Stylesheet aller Seiten von `Motive.<Hash>.css` in `logo.<Hash>.css` um (gleicher Inhalt), und alle 116 Seiten
  verwiesen auf einen neuen Dateinamen. Der Import steht mit Kommentar im Layout, damit sich im Bau nur die drei neuen
  Seiten ändern.

## 3. Prüfungen im Bau (`npm run pruefen`, `tools/pruefe_seiten.mjs`)

- **Prüfung aus AP-44 erkennt die Kurzlinks:** Der Link und das Ziel der Weiterleitung zählen als Links zu Google Play mit
  Kennung und müssen genau das Ziel ihrer eigenen Seite tragen; ein Kurzlink-Ziel auf einer anderen Seite ist ein Befund.
  Ausgabe jetzt: „Links zu Google Play: 190 im HTML (184 wie bei AP-44 plus je ein Link und eine Weiterleitung der drei
  Kurzlinks), davon 4 ohne Kennung auf Seiten mit Rechtstexten (erlaubt)“.
- **Eigener Abschnitt „Kurzlinks“:** genau `/fb/`, `/ig/`, `/app/`; Ziel nach dem Muster mit `utm_campaign=kurzlink`; genau
  eine Weiterleitung `0; url=<Ziel>`; noindex; kein Skript, Rahmen, Formular, Bild, Kopf, Fuß, Navigation oder kanonische
  Adresse; genau ein Link „Weiter zu FoodAsu bei Google Play“ mit dem Ziel; als sichtbarer Text nur dieser Link; Name
  FoodAsu als Überschrift; die Wortlisten (gesperrte Wörter, Bezahl- und Fristwörter, Beta, Wendungen) über Titel und Text;
  nicht in Sitemap und `llms.txt`; von keiner Seite verlinkt (mit und ohne Schrägstrich, auch absolut); `robots.txt` ohne
  `Disallow`; keine andere Seite mit `meta refresh`. Die Kurzlinks laufen bewusst nicht durch die Prüfungen der Seiten
  (Beschreibung, Open Graph, Überschriften), weil sie keine Seiten im Sinn der Website sind.
- **Gegenproben** (Kopie des Baus verändert, erwartet: Befunde): Kampagne bei `/ig/` verfälscht, Skript in `/fb/`,
  Link auf `/app/` in `/fragen/`, `/fb/` in der Sitemap, `Disallow: /app/` in `robots.txt`: 12 Befunde, alle fünf
  Veränderungen gemeldet. Das Wort „gratis“ im Knopf von `/fb/`: 4 Befunde (Linktext, sichtbarer Text, Bezahl-Wort,
  Preisaussage im Bau). Im echten Bau: „Ergebnis: bestanden“.
- **Prüfumfang nach CLAUDE.md:** Bau, `npm run pruefen`, Wortprüfung (`texte_pruefen.py`: bestanden; sie liest von der
  Website nur die Startseite, die Wörter der Kurzlinks prüft deshalb `pruefe_seiten.mjs`), Links (neue Ziele sind
  Adressen bei Google Play, geprüft über die Proben unten). Nachweise der Seiten und Lighthouse nicht gelaufen: keine
  bestehende Seite geändert (Vergleich unten).

## 4. Vergleich der Baue (`main` `8dad697` gegen `ap-45`)

970 gegen 967 Dateien. **Neu sind genau `app/index.html`, `fb/index.html`, `ig/index.html`; keine Datei fehlt, keine
andere ist anders** (SHA-256, Textdateien ohne Zeilenende-Unterschied; auch `sitemap.xml`, `llms.txt`, `robots.txt` und
alle 116 Seiten gleich). Erster Anlauf: alle 116 Seiten anders durch den umbenannten Stylesheet (Abschnitt 2), behoben.

## 5. Proben im Browser (Chrome, Weiterleitung abgewartet)

Für jeden Aufruf: Seite laden, bis die Adresse `play.google.com` erreicht, dann Adresse und `og:title` lesen.

| Aufruf | Ziel erreicht | Kennung am Ziel richtig | Titel am Ziel |
|---|---|---|---|
| `/fb/` und `/fb` | ja / ja | `…referrer=utm_source%3Dfacebook%26utm_medium%3Dsocial%26utm_campaign%3Dkurzlink` | FoodAsu: Einkaufsliste+Scanner – Apps bei Google Play |
| `/ig/` und `/ig` | ja / ja | `…utm_source%3Dinstagram%26utm_medium%3Dsocial%26utm_campaign%3Dkurzlink` | wie oben |
| `/app/` und `/app` | ja / ja | `…utm_source%3Dnachricht%26utm_medium%3Dpersoenlich%26utm_campaign%3Dkurzlink` | wie oben |

- **Vorher (lokal, Bau von `ap-45`, vor dem Veröffentlichen):** alle sechs Aufrufe richtig. Ohne Schrägstrich simuliert
  durch einen Server mit 301 wie bei GitHub Pages.
- **Live (foodasu.com, nach der Bereitstellung):** alle sechs Aufrufe richtig; `/fb`, `/ig`, `/app` antworten mit 301 auf
  die Adresse mit Schrägstrich, diese mit 200. Eigene Anfragen je Aufruf: die Seite, `Motive.CexU0ry4.css`, `favicon.svg`,
  die Schrift; Cookies auf foodasu.com: 0.
- **Live:** 970 von 970 Dateien gleich dem Bau; `sitemap.xml` und `llms.txt` nennen die Kurzlinks nicht (0 Treffer);
  `robots.txt` ohne `Disallow` (0); `/fb/` trägt `<meta name="robots" content="noindex, follow">`.
- **Nicht geprüft:** ob Facebook den Kurzlink am Button der Seite annimmt (das Ausprobieren liegt bei Ali; Facebook ruft
  Adressen mit eigenem Prüfer ab, den ich nicht nachstellen kann).

## 6. Datei in foodasu-play

`foodasu-play\Social_Media_2026-10\Store_Links_mit_Kennung.md`: oben neuer Abschnitt „Kurzlinks“ (Tabelle mit den drei
Kurzlinks, wofür, Quelle und Medium). Vorher gesichert als `Store_Links_mit_Kennung_bis_2026-10-25_0749.md`.

## Für einkauf-app\CLAUDE.md

AP-45 (Website, 25.10.2026, ONLINE, `foodasu-web` `main` `14151d3`): Kurzlinks `foodasu.com/fb`, `/ig`, `/app` leiten per
`meta refresh` (ohne Skript, ohne Cookies, ohne Messung) auf den Eintrag bei Google Play mit Kennung
(`utm_campaign=kurzlink`; Quelle `facebook`/`instagram`/`nachricht`, Medium `social`/`social`/`persoenlich`) weiter; noindex,
nicht in Sitemap, `llms.txt`, Navigation oder `robots.txt`; Daten `KURZLINKS` in `src/daten/seite.mjs`, Prüfung im Bau in
`npm run pruefen`. Im Bau kamen nur die drei Seiten dazu. Live alle Proben bestanden; ob Facebook den Kurzlink am Button
annimmt, probiert Ali. Links für Ali: `foodasu-play\Social_Media_2026-10\Store_Links_mit_Kennung.md`. Bericht:
`foodasu-web/docs/berichte/AP-45_Bericht.md`.
