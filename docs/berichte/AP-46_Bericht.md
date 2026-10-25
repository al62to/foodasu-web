# AP-46: Website – interne Links „Einkaufslisten-App“ zur Startseite auf den Themenseiten der Rezepte und auf /rezepte/

Auftrag der Projektleitung vom 25.10.2026, Alis Ja zum Wortlaut mit dem Abschicken. Anlass: Search Console bis 23.10.2026,
die Startseite ist für App-Begriffe noch nicht sichtbar; die Rezeptseiten verlinken schon mit „Einkaufslisten-App“ auf `/`,
die Themenseiten nicht. Gearbeitet nur in `foodasu-web` (Zweig `ap-46` von `main` `fc7a492`). `einkauf-app` nicht angefasst,
keine Unteragenten.

**Stand 25.10.2026, 08:45 Uhr: ONLINE.** `main` `6379002` (Vorspulen von `ap-46`, ein Commit), GitHub-Lauf 40173656734
erfolgreich (bauen, veröffentlichen). Live 970 von 970 Dateien gleich dem Bau (`/CNAME` nur im Zeilenende anders, Windows
CRLF im Arbeitsordner).

## 1. Ergebnis in Kürze

| Punkt | Umsetzung | Seiten |
|---|---|---|
| 1 | „In der **Einkaufslisten-App** FoodAsu gibt es über 300 Rezepte, davon <n> zu diesem Thema.“ („Einkaufslisten-App“ → `/`) | 30 Themenseiten |
| 2 | Nur „ohne …“, im selben Absatz dahinter: „Beim Einkaufen zeigt dir der **Lebensmittel-Scanner** der App, ob ein Produkt für alle im Haushalt passt.“ („Lebensmittel-Scanner“ → `/so-gehts/scannen-und-urteil/`) | 11 Seiten „ohne …“ |
| 3 | `/rezepte/`: „In der **Einkaufslisten-App** sind es über 300.“ („Einkaufslisten-App“ → `/`) | 1 Seite |

`<n>` kommt wie bisher aus den Daten (`inDerApp` in `src/daten/rezeptseiten.mjs`). Titel, Beschreibungen (`meta.mjs`),
strukturierte Daten, `llms.txt`, Rechtstexte und die Rezeptseiten sind unverändert.

## 2. Geänderte Seiten (31)

- **11 Seiten „ohne …“ (mit Scanner-Satz):** `/rezepte/ohne-alkohol/`, `-eier/`, `-erdnuesse/`, `-fisch/`, `-gelatine/`,
  `-gluten/`, `-milch/`, `-nuesse/`, `-schweinefleisch/`, `-sesam/`, `-soja/`
- **2 Seiten „Passt für“:** `/rezepte/vegan/`, `/rezepte/vegetarisch/`
- **9 Länderseiten:** `/rezepte/land/deutschland/`, `frankreich/`, `griechenland/`, `indien/`, `italien/`, `oesterreich/`,
  `schweiz/`, `spanien/`, `tuerkei/`
- **8 Kategorieseiten:** `/rezepte/kategorie/beilage/`, `fruehstueck/`, `gebaeck/`, `hauptgericht/`, `salat/`,
  `suessspeise/`, `suppe/`, `vorspeise/`
- **Übersicht:** `/rezepte/`

Elf davon stehen auf noindex (Kategorien Beilage, Frühstück, Salat, Suppe, Vorspeise; Länder Frankreich, Griechenland,
Indien, Schweiz, Türkei; `/rezepte/vegan/`), sie bekommen den Link trotzdem, weil sie von Menschen und Suchmaschinen
gelesen werden und der Auftrag „alle Themenseiten“ nennt.

## 3. Beispiele vorher und nachher

**`/rezepte/ohne-gluten/`**

- vorher: „16 Rezepte ohne Gluten: Bei keiner Zutat steht ein Hinweis darauf, auch nicht „meist mit“ oder „je nach Produkt“.
  In der App FoodAsu gibt es über 300 Rezepte, davon 72 zu diesem Thema.“
- nachher: „16 Rezepte ohne Gluten: Bei keiner Zutat steht ein Hinweis darauf, auch nicht „meist mit“ oder „je nach Produkt“.
  In der [Einkaufslisten-App](/) FoodAsu gibt es über 300 Rezepte, davon 72 zu diesem Thema. Beim Einkaufen zeigt dir der
  [Lebensmittel-Scanner](/so-gehts/scannen-und-urteil/) der App, ob ein Produkt für alle im Haushalt passt.“

**`/rezepte/land/oesterreich/`**

- vorher: „8 Rezepte aus Österreich, mit Hinweisen zu den Zutaten. In der App FoodAsu gibt es über 300 Rezepte, davon 42 zu
  diesem Thema.“
- nachher: „8 Rezepte aus Österreich, mit Hinweisen zu den Zutaten. In der [Einkaufslisten-App](/) FoodAsu gibt es über 300
  Rezepte, davon 42 zu diesem Thema.“

**`/rezepte/`**

- vorher: „… 5 neue, die später in die App kommen. In der App sind es über 300.“
- nachher: „… 5 neue, die später in die App kommen. In der [Einkaufslisten-App](/) sind es über 300.“

Bilder (Kopf der Seite, Handy 390 px, 200 Prozent Zoom, Laptop, hell und dunkel): `docs/berichte/AP-46_Bilder/`
(`ohne-gluten_*`, `uebersicht_*`).

## 4. Umsetzung

- **Texte und Links:** `texte.thema` (`inDerApp`, `inDerAppLink`, `scanner`, `scannerLink`) und `texte.alle.link` in
  `src/daten/rezeptseiten.mjs`. Der Link steht mitten im Satz; dafür bekam der Kopf der Unterseiten (`Seitenkopf.astro`) die
  Eigenschaft `vorspannSaetze` (Sätze mit je einem Link, im selben Absatz, wie `vorspannLink`, aber nicht nur am Ende).
  `Themenseite.astro` und `/rezepte/` nutzen sie. Gestaltung, Aufbau und Bewegung unverändert: es ändert sich nur der Inhalt
  des Vorspann-Absatzes, die Links haben die gewohnte Linkfarbe.
- **Prüfung im Bau angepasst (`tools/pruefe_seiten.mjs`):** Die Regel vom 11.10.2026 („Kopf der Übersicht: Vorspann als
  reiner Text“) verbot jeden Link im Vorspann von `/rezepte/` und schlug beim ersten Bau an. Sie gilt jetzt so: kein Link
  zur Rubrik „Aus alten Kochbüchern“ (wie bisher) und im Vorspann **genau ein** Link „Einkaufslisten-App“ auf `/`. Das war
  die einzige Änderung an einer Prüfung.

## 5. Prüfungen

- **Bau und `npm run pruefen`:** bestanden („Ergebnis: bestanden“), nach der Anpassung der einen Regel (Abschnitt 4).
  Dabei laufen auch die Wortlisten (gesperrte Wörter, Bezahl- und Fristwörter, Preisaussagen) über alle Seiten.
- **Wortprüfung** `foodasu-play/texte_pruefen.py`: bestanden (liest von der Website nur die Startseite; die neuen Sätze
  deckt die Wortprüfung im Bau ab).
- **Vergleich der Baue, `main` `fc7a492` gegen `ap-46` (970 gegen 970 Dateien, SHA-256, Textdateien ohne Zeilenende-
  Unterschied):** keine Datei neu oder fehlend. Anders sind **32** Dateien: die 31 Seiten aus Abschnitt 2 und
  `sitemap.xml`. Auf den 31 Seiten ist **außerhalb des Absatzes `s-vorspann` kein Byte anders** (Absatz gegen Absatz
  ausgetauscht, Rest verglichen). In `sitemap.xml` ändert sich ohne `lastmod` nichts; `lastmod` steht bei 20 der Seiten
  (die in der Sitemap stehen: `/rezepte/`, 11 × „ohne …“, `vegetarisch`, `kategorie/hauptgericht`, `suessspeise`, `gebaeck`,
  `land/deutschland`, `oesterreich`, `italien`, `spanien`) auf 2026-10-25 statt 2026-10-24. Das ist die bestehende
  Regel (`lastmod` = Tag der letzten Änderung der Quelldateien, wie bei AP-44), keine Hand-Änderung. Wenn Ali das nicht
  will: eine Entscheidung für einen eigenen Auftrag.
- **Links je Seite:** auf jeder der 31 Seiten genau ein Link „Einkaufslisten-App“ auf `/` im Seitenkörper (Zählung am Bau);
  auf den 11 Seiten „ohne …“ zusätzlich genau ein Link „Lebensmittel-Scanner“ auf `/so-gehts/scannen-und-urteil/`, sonst
  keiner.
- **Im Browser (Chrome, `nachweise/ap46/messen.mjs`, nicht im Repository):** 18 Seiten (alle 11 „ohne …“, `/rezepte/`, vegan,
  vegetarisch, zwei Länder, zwei Kategorien) × Handy 390 px, 200 Prozent Zoom (640 px breit, Faktor 2) und Laptop 1280 px ×
  hell und dunkel = 108 Messungen: die Links im Vorspann stimmen (Text und Ziel), **kein waagrechter Überlauf**, der Absatz
  ragt nirgends über das Fenster, Konsole ohne Fehler. Beide Ziele (`/`, `/so-gehts/scannen-und-urteil/`) antworten mit 200.
- **Prüfumfang nach `CLAUDE.md`:** Es sind Texte und Links geändert, deshalb Bau, `npm run pruefen`, Wortprüfung, die Messung
  der betroffenen Seiten und die Prüfung der Links. Die volle Kette und Lighthouse sind nicht gelaufen: Aufbau und
  Gestaltung sind unverändert, im Vergleich der Baue ändert sich außerhalb des Vorspann-Absatzes nichts.

## 6. Veröffentlichung und Prüfung live

`main` `fc7a492` → `6379002` (glatt, `git merge --ff-only ap-46`), `geschichte_pruefen.py main`: bestanden, Push, Lauf
40173656734: bauen und veröffentlichen erfolgreich.

- **Live (foodasu.com, nach der Bereitstellung):** 970 von 970 Dateien gleich dem Bau.
- **Drei Themenseiten „ohne …“** (`/rezepte/ohne-gluten/`, `/rezepte/ohne-milch/`, `/rezepte/ohne-schweinefleisch/`), **eine
  Länderseite** (`/rezepte/land/oesterreich/`) und **`/rezepte/`**: Links stimmen, kein Überlauf (Handy, 200 Prozent Zoom,
  Laptop, hell und dunkel; 30 Messungen), Konsole ohne Fehler, beide Link-Ziele 200.

## 7. Offene Entscheidungen

Keine. Hinweis: Die Impressionen der Seiten aus der Search Console habe ich nicht eingesehen (kein Zugriff in dieser
Sitzung); die fünf Adressen zum Neuindexieren (letzte Zeile der Antwort) sind deshalb nach der Größe des Themas gewählt,
nicht nach den Zahlen der Search Console. Ali kann sie dort nach den echten Impressionen austauschen.

## Für einkauf-app\CLAUDE.md

AP-46 (Website, 25.10.2026, ONLINE, `foodasu-web` `main` `6379002`): Auf allen Themenseiten der Rezepte (11 × „ohne …“,
vegan, vegetarisch, 9 Länder, 8 Kategorien) und auf `/rezepte/` steht im Vorspann „Einkaufslisten-App“ als Link zur
Startseite (auf den Rezeptseiten schon vorher); auf den 11 Seiten „ohne …“ dahinter ein Satz mit dem Link
„Lebensmittel-Scanner“ auf `/so-gehts/scannen-und-urteil/`. Im Bau ändern sich nur diese 31 Absätze (und `lastmod` von 20
Seiten in der Sitemap). Quelle: `texte.thema` und `texte.alle` in `src/daten/rezeptseiten.mjs`, Eigenschaft `vorspannSaetze`
in `Seitenkopf.astro`. Die Prüfung der Übersicht in `npm run pruefen` verlangt jetzt genau einen Link im Vorspann
(„Einkaufslisten-App“ auf `/`). Indexierung: Ali beantragt die fünf Adressen im Bericht (Abschnitt 7 und letzte Zeile).
Bericht: `foodasu-web/docs/berichte/AP-46_Bericht.md`.
