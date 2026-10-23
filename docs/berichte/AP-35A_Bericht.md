# AP-35A: Nutzungsbedingungen und strukturierte Daten zur App

Auftrag der Projektleitung vom 23.10.2026; Alis Ja zum Text vom 22.10.2026, 17:32 Uhr; Alis Wunsch zu den
strukturierten Daten vom 23.10.2026, 20:13 Uhr. Gearbeitet nur in `foodasu-web` und `foodasu-play`; in `einkauf-app`
nur gelesen (Wortregeln, Prüfumfang, Manifest, Gradle-Datei). Nichts an App, Play Console, Emulator oder S24.

**Stand 23.10.2026, 20:57 Uhr: online.** `main` `ec5d6ea` (ein Commit über `0abceab`), Push 20:53 Uhr, GitHub-Lauf
40007013534 erfolgreich (bauen, veröffentlichen); live 967 von 967 Dateien gleich dem geprüften Bau, 0 Befunde.

## 1. Ergebnis in Kürze

- Neue Seite **https://foodasu.com/nutzungsbedingungen.html** im Aufbau der Datenschutzerklärung (gleiche Vorlage
  `Rechtsseite.astro`, Schrift, hell und dunkel, Inhaltsverzeichnis an der Seite, am Handy aufklappbar). Text wortgleich
  aus `foodasu-play/Nutzungsbedingungen_1.0_Entwurf.md`; „Stand: 23. Oktober 2026“.
- In `foodasu-play` heißt die gültige Fassung jetzt `Nutzungsbedingungen_1.0.md`; der Entwurf liegt als Sicherung
  daneben (unverändert).
- Fußzeile jeder Seite, Spalte „Rechtliches“: „Nutzungsbedingungen“ direkt unter „Datenschutz“. Sonst nichts an
  Gestaltung, Layout oder Animationen geändert.
- Im Index wie die Datenschutzerklärung: kein `noindex`, in `sitemap.xml` (jetzt 102 Einträge) und in `llms.txt`.
- Strukturierte Daten zur App ausgebaut (Abschnitt 4). Schema-Validator: 0 Fehler, 0 Warnungen.
- **Für Ali: Indexierung in der Search Console beantragen für `https://foodasu.com/nutzungsbedingungen.html`**
  (dazu, wegen der neuen Daten, gern auch `https://foodasu.com/`).

## 2. Die neue Seite

- Quelle: `foodasu-play/Nutzungsbedingungen_1.0.md`. Der Text ist wortgleich mit dem Entwurf; nur der Vorspann des
  Entwurfs und die „Hinweise der Projektleitung“ stehen dort als Kommentar (sie erscheinen nirgends), die zwei
  Trennlinien um den Text fallen weg. Prüfung: Vergleich der beiden Dateien ab der Überschrift, Unterschied nur an
  diesen Stellen.
- Bau: `website_bauen.py` kann jetzt `--nutzungsbedingungen` (mit eigenem Datum `--nb-stand`, damit die
  Datenschutzerklärung ihr Datum 14. Oktober 2026 behält), `tools/rechtstexte_uebernehmen.mjs` schreibt den Baustein
  `src/inhalte/nutzungsbedingungen.html`. Platzhalter wie in der Datenschutzerklärung (Kontaktadresse als
  HTML-Entitäten, Wohngemeinde aus `offenlegung_wohnort.txt`, Datum). Gegenprobe: Die neu gebauten Bausteine von
  Datenschutzerklärung, Offenlegung und Kontakt sind inhaltlich gleich den veröffentlichten.
- Die Überschrift „Das Wichtigste in Kürze“ hat keine Nummer; sie bekommt den Anker `#das-wichtigste`, die Abschnitte
  `#abschnitt-1` bis `#abschnitt-18` (wie in der Datenschutzerklärung). Das Verzeichnis an der Seite hat 19 Einträge.
- Titel „Nutzungsbedingungen der App | FoodAsu“ (37 Zeichen), Beschreibung „Nutzungsbedingungen der App FoodAsu und
  der Website foodasu.com: was die App ist, woher die Daten kommen, Haftung und deine Rechte.“ (131 Zeichen, 886 Pixel).
  „Nutzungsbedingungen | FoodAsu“ allein hat 29 Zeichen und liegt unter der Grenze von 30.
- Brotkrumen „Start > Nutzungsbedingungen“.

## 3. Wortprüfung

- `texte_pruefen.py`: `Nutzungsbedingungen_1.0.md` (ohne Kommentare) und die gebaute Seite laufen bei den
  Rechtstexten (Bezahl-, Frist- und Preislisten; verbotene Wörter nicht). Ergebnis: bestanden.
- Drei Wortlaute meinen den Einkauf von Lebensmitteln oder das UN-Kaufrecht, nicht FoodAsu: „Lies vor dem Kauf“, „die
  du tatsächlich kaufst“, „UN-Kaufrechts“. Sie werden nur gemeldet (wie der Satz zur Auskunft in der
  Datenschutzerklärung); ändert sich ihr Wortlaut, schlägt die Prüfung an.
- Satz zum Medizinprodukt wie im Store-Eintrag: „Allergien“ (und jedes „Allergi…“, „Allergen…“) steht nur im Satz
  „FoodAsu ist kein Medizinprodukt und ersetzt bei Allergien oder Unverträglichkeiten keine ärztliche Beratung.“ (zweimal:
  Kurzfassung und Abschnitt 3). Anderswo ist es ein Befund.
- Dieselben Regeln prüft `npm run pruefen` an der gebauten Seite.
- Startseite: `seo/skripte/woerter_pruefen.py --startseite` mit 0 Befunden; einzige neue Ausnahme ist die Angabe
  `softwareRequirements` „Android 8.0 oder neuer“ (wie `operatingSystem`).
- Alle Texte der strukturierten Daten auf den Seiten der App (Nutzungsbedingungen, Fragen, Über FoodAsu, So geht's mit
  Kapiteln): 173 Texte, keine neuen Befunde. Zwei Funde betreffen den bekannten Abschnitt „Backup von Android“ im
  Kapitel „Einstellungen und deine Daten“; er ist ausdrücklich erlaubt und nicht neu.
- Gegenproben: `texte_pruefen.py` 6 von 6 Änderungen gemeldet (Allergien außerhalb des Satzes, Satz geändert, „Kauf“
  anderswo, Frist-Wort, Preisaussage, geänderter Wortlaut der Ausnahme); `woerter_pruefen.py` meldet eine andere
  Mindestversion.

## 4. Strukturierte Daten zur App

Die App steht genau einmal vollständig da, als `MobileApplication` auf der Startseite (Quelle
`src/daten/strukturiert.mjs`); Typ und `applicationCategory` `ShoppingApplication` bleiben.

| Angabe | Wert | Herkunft |
|---|---|---|
| `@id` | `https://foodasu.com/#app` | fest |
| `description` | „Einkaufsliste und Lebensmittel-Scanner für den ganzen Haushalt. Mit Rezepten.“ | Kurzbeschreibung des deutschen Store-Eintrags (siehe 4.1) |
| `image` | `https://foodasu.com/apple-touch-icon.png` | App-Symbol, schon auf foodasu.com |
| `screenshot` | vier Bildschirmfotos aus „So geht's“ (`karte-urteil-01`, `liste-warengruppen-01`, `rezepte-ansehen-01`, `haushalt-liste-01`, je 720 Pixel) | vorhandene Bilder, keine neuen |
| `datePublished` | `2026-10-23` | Auftrag |
| `inLanguage` | `de`, `en` | Auftrag |
| `countriesSupported` | `AT`, `DE`, `CH`, `LI` | Auftrag |
| `softwareRequirements` | „Android 8.0 oder neuer“ | `minSdk = 26` in `app/build.gradle.kts` |
| `permissions` | „Kamera, Internet, Vibration, Netzwerkstatus“ | `CAMERA`, `INTERNET`, `VIBRATE` aus dem Manifest der App; `ACCESS_NETWORK_STATE` bringen Bibliotheken mit (im Manifest als Kommentar vermerkt, im zusammengeführten Manifest der Fassung 0.15.4 enthalten) |
| `author` | Person „Ali Tonc“, `url` `https://play.google.com/store/apps/dev?id=6237494149245847779` | Entwicklerseite bei Google Play, live erreichbar am 23.10.2026 („Android Apps von Ali Tonc bei Google Play“, mit FoodAsu) |
| `installUrl`, `sameAs` | Eintrag bei Google Play | wie seit AP-34 |

Nicht aufgenommen: `offers`, Preis, `aggregateRating`, Bewertungen, `softwareVersion`, `isAccessibleForFree`. Kein
Arbeitgeber, kein Ort, kein LinkedIn bei der Person.

**`termsOfService`:** nicht aufgenommen. schema.org kennt die Eigenschaft nur für `Service`; der Schema-Validator meldet
sie bei `MobileApplication` als unbekanntes Feld (Warnung, Gegenprobe vom 23.10.2026). Der Validator hat damit
entschieden.

**Verweise auf die App** (`about` mit `@id` `https://foodasu.com/#app`, die App wird dort nicht wiederholt):

| Seite | Angabe |
|---|---|
| Startseite | neu `WebPage` |
| So geht's (Übersicht) | neu `CollectionPage` (die Liste der Kapitel bleibt) |
| So geht's, acht Kapitel | `Article` um `about` ergänzt |
| Fragen | `FAQPage` um `about` ergänzt |
| Über FoodAsu | neu `AboutPage` (bisher ohne strukturierte Daten) |
| Nutzungsbedingungen | neu `WebPage` mit `about` und `dateModified` (Tag der letzten Änderung der Quelldateien, gleich `lastmod` in `sitemap.xml`) |

**llms.txt:** Der Satz zur Verfügbarkeit „FoodAsu gibt es für Android im Play Store. Die Version fürs iPhone folgt.“ und
der Link zum Store-Eintrag stehen dort seit AP-34 (der Satz genau einmal, das prüft `npm run pruefen`); neu ist der
Link zu den Nutzungsbedingungen unter „Rechtliches“.

### 4.1 Kurzbeschreibung

In `foodasu-play/Store_Eintrag.md` steht unter der Überschrift „Kurzbeschreibung“ noch die alte Fassung („Lebensmittel
scannen, Zutaten und Inhaltsstoffe prüfen. Einkaufsliste, Rezepte.“); der Vermerk oben in derselben Datei nennt die
Fassung aus AP-33, und genau die zeigt Google Play live (geprüft am 23.10.2026). In den Daten steht die Fassung aus
AP-33. `Store_Eintrag.md` ist nicht geändert (siehe Offene Entscheidungen).

## 5. Prüfungen und warum sie reichen

Nach dem „Prüfumfang der Website“ (neue Seite, Fußzeile auf allen Seiten, strukturierte Daten):

| Prüfung | Ergebnis |
|---|---|
| `npm run build` (mit den Sperren gegen Preisaussagen und Links nach außen in „So geht's“) | bestanden, 116 Seiten, 967 Dateien, keine Preisaussage |
| `npm run pruefen` | bestanden (102 von 116 Seiten im Index); Gegenprobe 41 von 41 gemeldet |
| `texte_pruefen.py` | bestanden; Gegenprobe 6 von 6 |
| `seo/skripte/woerter_pruefen.py --startseite` | 360 Texte, 0 Befunde; Gegenprobe meldet eine andere Mindestversion |
| Nachweise 2d, 2e, 2f, 3 (`nachweise_teil.mjs` an der Vorschau) | 141 Prüfpunkte, 0 Fehler; neue Seite: ruhiger Kopf, hell trotz dunklem Gerät, dunkel ohne Aufblitzen, Kontrast hell und dunkel je 154 Texte über 4,5:1, keine waagrechte Bildlaufleiste bei 360, 390, 768, 1024 und 1440 Pixeln; Startseite und alle festen Seiten wegen der Fußzeile mitgemessen |
| Links nach außen (`tools/links_pruefen.mjs`) | 77 Adressen, 73 mit Status 200; die 4 Adressen von Facebook antworten Programmen mit 400 (dieselben Adressen standen schon in den Protokollen von AP-22 und AP-23 so; nicht geändert); interne Links prüft `npm run pruefen` |
| Entwicklerseite bei Google Play | Status 200, „Android Apps von Ali Tonc bei Google Play“, FoodAsu darauf |
| `npm run meta` | Tabelle in `foodasu-play/Website_Meta_Uebersicht.md` neu geschrieben |
| `geschichte_pruefen.py main` | bestanden (1 neuer Commit, 0 Funde) |
| Live-Skript `nachweise/ap29_live.mjs` | 0 Befunde (967 von 967 Dateien gleich dem Bau, 13 Seiten mit Verweis auf die App, 102 Seiten im Index und in der Sitemap) |
| Schema-Validator, Bau (8 Seiten: Startseite, Nutzungsbedingungen, Fragen, Über FoodAsu, So geht's, zwei Kapitel, Datenschutz) | 0 Fehler, 0 Warnungen |
| Schema-Validator, live (Startseite, Nutzungsbedingungen; die Schnittstelle drosselte danach mit Status 429, daher über die Seite des Validators) | je 0 Fehler, 0 Warnungen. Der Validator zeigt den reinen Verweis `about` als eigenes Element „CreativeWork“ ohne Meldung |
| Rich-Results-Test von Google, live | Startseite: 2 gültige Elemente (Software-App, Video); bei der App zwei nicht kritische Hinweise „offers fehlt (optional)“ und „aggregateRating fehlt (optional)“, beide bewusst weggelassen. Nutzungsbedingungen: Navigationspfad gültig, keine Fehler |

Warum das reicht: Geändert sind eine neue Rechtsseite in der vorhandenen Vorlage, ein Link in der Fußzeile und
strukturierte Daten. Die Prüfungen decken Text und Wortregeln, Aufbau, Darstellung der neuen Seite und aller festen
Seiten (hell, dunkel, Breiten, Kontrast), Links, Sitemap, `llms.txt` und die Daten ab. Bewegung, Menü, Rezeptseiten und
Video sind nicht berührt; Lighthouse und die volle Kette waren nach dem Prüfumfang nicht nötig.

## 6. Geänderte Prüfungen

- `tools/pruefe_seiten.mjs`: neue Seite bei den Rechtstexten und bei den Seiten mit Anschrift; Ausnahmen „Kauf“ und Satz
  zum Medizinprodukt nur für diese Seite; Link „Nutzungsbedingungen“ in jeder Fußzeile direkt unter „Datenschutz“;
  Aufbau der Seite (19 Anker, Verzeichnis, Stand, Kontakt nur als Entitäten), `WebPage` mit `about` und
  `dateModified` gleich `lastmod`; App-Angabe mit allen Feldern aus Abschnitt 4 (Bilder als Dateien im Bau, keine
  `softwareVersion`, kein `termsOfService`), Person mit der Entwicklerseite; auf jeder Seite der App ein Verweis auf
  die Kennung, auf keiner anderen Seite; „Android“ in den Daten nur als `operatingSystem` und in genau dieser
  Mindestversion. Gegenprobe `nachweise/ap35a/gegenprobe.mjs` (nicht im Repository): 41 von 41 Änderungen gemeldet.
- `tools/nachweise.mjs`: Die neue Seite steht bei „ruhiger Kopfbereich“ (2d) und beim Dunkelmodus (2e); Kontrast (2f)
  und Breiten (3) nehmen sie über die Liste der Seiten ohnehin mit.
- Live-Skript `nachweise/ap29_live.mjs` (nicht im Repository; Sicherung `ap29_live_bis_2026-10-23_vor_AP-35A.mjs`):
  erwartet 102 Seiten im Index und in der Sitemap, prüft die Verweise auf die App (13 Seiten), die App-Angabe und die
  Person. Gegenprobe: am alten Live-Stand vor der Veröffentlichung 8 Befunde, darunter alle neuen Punkte.
- `nachweise/seo-neu/gegenprobe_app.mjs` suchte seit AP-34 noch `SoftwareApplication` und schlug deshalb nicht mehr an;
  jetzt `MobileApplication`, 2 von 2 gemeldet (Sicherung daneben).

### Geändert in `foodasu-play` (nicht versioniert, Sicherungen daneben mit `_bis_2026-10-23_vor_AP-35A`)

- `Nutzungsbedingungen_1.0.md` neu (Abschnitt 2), `Nutzungsbedingungen_1.0_Entwurf.md` unverändert als Sicherung.
- `website_bauen.py`: Schalter `--nutzungsbedingungen`, `--nb`, `--nb-stand`; feste Sprungmarke `das-wichtigste`. Der Bau
  der Datenschutzerklärung bleibt gleich (Gegenprobe in Abschnitt 2).
- `texte_pruefen.py`: Nutzungsbedingungen bei den Rechtstexten, Regeln aus Abschnitt 3.
- `seo/skripte/woerter_pruefen.py`: Ausnahme für `softwareRequirements` „Android 8.0 oder neuer“.
- `Website_Meta_Uebersicht.md` aus `npm run meta`.

## 7. Ohne PL entschieden

1. Titel der Seite „Nutzungsbedingungen der App | FoodAsu“ (die Grenze von 30 Zeichen lässt „Nutzungsbedingungen |
   FoodAsu“ nicht zu) und die Beschreibung aus Abschnitt 2.
2. Anker `#das-wichtigste` für die Kurzfassung, damit sie im Verzeichnis steht.
3. Die Zeile unter der Überschrift heißt wie im Text „Stand: 23. Oktober 2026“ (ohne „Version 1.0“, weil der Text das
   nicht nennt).
4. Vier Bildschirmfotos als `screenshot` (Urteil, Einkaufsliste, Rezepte, Haushalt), je in 720 Pixel Breite.
5. `permissions` auf Deutsch, mit „Netzwerkstatus“ aus dem zusammengeführten Manifest.
6. `url` der Person ist jetzt die Entwicklerseite bei Google Play statt „Über FoodAsu“; vor dem öffentlichen Start (falls
   `store.oeffentlich` je wieder aus ist) fällt sie auf „Über FoodAsu“ zurück.
7. Fragen und Kapitel: `about` an der vorhandenen Angabe (`FAQPage`, `Article`) statt einer zweiten Seitenangabe;
   Übersicht „So geht's“ und „Über FoodAsu“ mit eigener Seitenangabe (`CollectionPage`, `AboutPage`).
8. Die Beschreibung der App in den Daten ist nicht mehr der GEO-Satz (Auftrag: Kurzbeschreibung des Store-Eintrags); der
   GEO-Satz bleibt sichtbar auf der Startseite und oben in `llms.txt`.

## 8. Offene Entscheidungen

1. `foodasu-play/Store_Eintrag.md`: Abschnitt „Kurzbeschreibung“ auf die Fassung aus AP-33 nachziehen (Vorschlag: ja,
   mit dem nächsten Auftrag zum Store-Eintrag; `texte_pruefen.py` prüft die Länge dieses Abschnitts).
2. Keine weitere: `termsOfService` gibt es bei schema.org nur für `Service`, auch nicht für `Organization`; der Link zu
   den Nutzungsbedingungen steht in jeder Fußzeile, in der Sitemap und in `llms.txt`.

## 9. Für Ali

- In der Search Console die Indexierung beantragen: `https://foodasu.com/nutzungsbedingungen.html` (und
  `https://foodasu.com/` wegen der neuen Daten).
- In der App kommt der Link unter „Über“ mit der nächsten Version (AP-35B).
