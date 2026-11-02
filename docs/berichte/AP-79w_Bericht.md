# AP-79w: Website für das iPhone

Auftrag der Projektleitung vom 02.11.2026, Alis Ja zur Veröffentlichung von Teil A und Teil B mit dem Abschicken.
Gearbeitet nur in der Website (Zweig `ap-79w` von `main` `32ce1cd`). App-Repository nur gelesen (Commit `4099f52` im
Zweig `ap-79`, mit `git show`/`git grep`, kein Checkout, nichts gemergt). Design, Layout, Animationen, Startseite,
So geht's, Rezeptseiten, App und Store-Einträge nicht angefasst. Keine Unteragenten.

**Stand 02.11.2026, 21:00 Uhr: ONLINE.** `main` `84c7504` (Vorspulen von `ap-79w`, zwei Commits `ae7da10` und
`84c7504`, kein Force-Push), Push 20:59 Uhr, GitHub-Lauf 41514973808 erfolgreich (fertig 20:59:53 Uhr).

## Für Ali

- **Live seit 02.11.2026, 20:59 Uhr:** Datenschutzerklärung **2.1.0** mit dem Teil für das iPhone
  (`/datenschutz.html`), Nutzungsbedingungen mit „etwa Google Play oder der App Store“ (`/nutzungsbedingungen.html`,
  Stand 2. November 2026) und die vier Kurzlinks `/teilen/`, `/app/`, `/fb/`, `/ig/` nach Gerät: iPhone und iPad gehen
  auf die Startseite foodasu.com, alle anderen wie bisher zu Google Play. Erst wenn Apple die App freigibt, wird ein
  Schalter umgelegt; dann gehen iPhone und iPad in den App Store.
- **Abweichungen vom Entwurf** (alle am Code des iPhones belegt, Abschnitt 2):
  1. Abschnitt 5: Die Einstellungen liegen am iPhone wie bei Android in einer Datei der App, nicht in den
     Benutzereinstellungen von iOS. Dort liegt nur, welche Liste offen war (für die Rückkehr nach einem Neustart);
     dafür ein Satz „Nur auf dem iPhone: …“. Was es am iPhone nicht gibt, steht jetzt unter „Nur auf Android:“
     (Dankeschön, Code, Update-Abfrage, Hinweis zur Fassung außerhalb von Google Play, Daten von ML Kit, das abgelegte
     Teilen-Bild).
  2. Abschnitt 10: Beim Export legt das iPhone die Datei zuerst im Ordner für vorübergehende Dateien der App ab und
     lässt sie dort bis zum nächsten Export; beim Import ebenso eine Kopie. iOS sichert den Ordner nicht. Dazu je ein
     Satz.
  3. Abschnitt 16a: Am iPhone teilt „Weiterempfehlen“ nur Text mit Link, ohne Bild, und das Rezeptbild wird nicht
     abgelegt. Dazu je ein Satz; der Satz zu Google Play bleibt wie verlangt.
  4. Abschnitt 4: „mit einer Ausnahme auf Android“ (ML Kit gibt es nur auf Android).
  5. Abschnitt 19: TestFlight in zwei Zeilen wie bei Google: Einladung „lit. b“ (wie die Testerliste), Angaben aus
     TestFlight „lit. f“. Der Entwurf nannte für Tests nur „lit. f“.
- **Data Privacy Framework:** Apple Inc. steht **nicht** in der Liste auf dataprivacyframework.gov (geprüft am
  02.11.2026 um 20:50 Uhr: Suche „Apple“ und „Apple Inc“ ohne Treffer bei 3.690 Teilnehmern; Gegenprobe „Google LLC“
  gefunden, aktiv). Deshalb steht bei Apple nur: Standardvertragsklauseln, auf die sich Apple nach eigenen Angaben
  stützt (so steht es in Apples Datenschutzrichtlinie).
- **Vorgemerkter Satz für 16a** (erst mit dem Umschalten auf den App Store): „Der Link führt zur Seite des Rezepts auf
  foodasu.com oder zu https://foodasu.com/teilen; diese Adresse leitet je nach Handy zum Eintrag von FoodAsu bei
  Google Play weiter, mit einer Kennung des Kanals (Abschnitt 13), oder zum Eintrag im App Store.“ Gegenüber dem
  Entwurf („bei Google Play oder im App Store weiter, je nach Handy“) umgestellt, weil nur der Link zu Google Play eine
  Kennung trägt.

## 1. Datenschutzerklärung 2.1.0 (Punkte 1 und 4)

Umgesetzt in `src/inhalte/datenschutz.html` im Aufbau der Fassung 2.0.7, Wortlaut wie im Entwurf
(`Material/iOS/Datenschutz_iPhone_Entwurf.md`):

| Abschnitt | Umsetzung |
|---|---|
| Kopf und Ende | „Version 2.1.0 · Stand: 2. November 2026“ |
| 1 | die drei Sätze ersetzt (Strichcode, Update-Abfrage, Sicherung) |
| 4 | „mit einer Ausnahme auf Android“ (Abweichung 4) |
| 5 | „Nur auf Android:“ und „Nur auf dem iPhone:“ (Abweichung 1) |
| 7 | Absatz „Strichcode-Erkennung“ unter „Auf Android“, neu „Auf dem iPhone“ |
| 10 | Satz zur App „Dateien“, „(nur auf Android)“ beim Code, dazu Abweichung 2 |
| 11 | neuer Einleitungssatz, alter erster Absatz unter „Auf Android“, neu „Auf dem iPhone“ |
| 12 | neu „Auf dem iPhone“ mit Link zur Datenschutzrichtlinie von Apple |
| 13 | neu „App Store (iPhone)“ nach „Google Play (Android)“; „Kennung des Kanals“ bleibt nur bei Google Play |
| 15 | Absatz zu TestFlight nach dem Absatz zu Google Play; „Nur auf Android:“ bei „Code einlösen“ und „Link in die App“ |
| 16a | Abweichung 3; Satz zu Google Play unverändert (Punkt 8) |
| 19 | drei Zeilen: Statistiken von Apple, Bewertungsfenster von Apple, TestFlight (zwei Zeilen, Abweichung 5) |
| 20 | Zeile Apple (Abschnitt 3 dieses Berichts) |
| 26 | „**Fassung 2.1.0.** Neu ist der Teil für das iPhone.“ |

**Englische Fassung oder Kurzfassung:** Auf der Website gibt es keine (die Website ist nur deutsch). Die englische
Kurzfassung liegt nur in Material (`Datenschutzerklaerung_2_0_Englisch_Kurzfassung.md`, Stand 2.0.x) und bekommt laut
Entwurf dieselben Punkte; **nicht geändert, nur gemeldet.** Ebenso nicht nachgezogen: die Markdown-Quellen in Material
(`Datenschutzerklaerung.md` mit Kopf 2.0.7, `Nutzungsbedingungen.md`); der Wortlaut auf der Website ist jetzt neuer.

## 2. Prüfpunkte am iPhone-Code (Punkt 2, Commit `4099f52`, Zweig `ap-79`)

| Prüfpunkt | Befund im Code | Folge für den Text |
|---|---|---|
| Produktbild von Open Food Facts (neu seit AP-79) | `ProduktBildScheibe` lädt `karte.bild` (Adresse von Open Food Facts) mit `AsyncImage` von SwiftUI, nur auf der Produktkarte; Startseite zeigt einen Platzhalter | Abschnitt 6 gilt unverändert („lädt … Produktbild“, „dabei gilt dasselbe, der Strichcode steht in der Bildadresse“) |
| Bild-Zwischenspeicher | `AsyncImage` nutzt den Zwischenspeicher des Systems (`URLCache.shared`), der in `Library/Caches` der App liegt; iOS sichert ihn nicht und leert ihn bei Platzmangel | Satz in 12 stimmt; Satz in 5 gilt für beide |
| Produktangaben | Ktor mit `NSURLSession` ohne Cookies und ohne Zwischenspeicher, nur HTTPS (keine Ausnahme in `Info.plist`) | wie Android |
| Abschnitt 5, Datenbanken | `main.db` und `profile.db` unter Application Support, `profile.db` im Ordner `privat` mit `isExcludedFromBackup`; `secure_delete` im Kern für beide Systeme | wie beschrieben |
| Abschnitt 5, Einstellungen | DataStore-Datei im Ordner der App (Kern), genutzt: Vibration, Bildschirm beim Kochen, dunkler Modus, Hinweis vor der ersten Person, Einführung, Wischhinweis, Karte „FoodAsu wächst.“, Art des Haushalts (immer „neu“), Bewertung (Zähler, letzte Bitte), Nutzungsbedingungen. In `UserDefaults` nur `rueckkehr.liste` und `rueckkehr.zeit` | Abweichung 1 |
| Teilen | Rezept: Bild aus dem Speicher direkt an das Teilen-Blatt, keine Datei; Weiterempfehlen: `ShareLink` nur mit Text und `https://foodasu.com/teilen` | Abweichung 3 |
| Export und Import | `fileExporter`/`fileImporter`; Zwischendateien `tmp/haushalt/export.json` und `import.json` bleiben bis zum nächsten Mal | Abweichung 2 |
| Keine eigene Update-Abfrage | keine Update-Schlüssel und kein Aufruf am iPhone | wie Entwurf |
| Kein „Code einlösen“ | keine Spur im iPhone-Code | wie Entwurf |
| Keine Associated Domains | keine `.entitlements`-Datei, nichts in `project.yml` | wie Entwurf |
| Bitte um Bewertung | `requestReview` von SwiftUI, Momente und Regeln aus `reviewDecision` im Kern (dieselben wie Android); Installationszeit = Anlegen des Ordners „Dokumente“; nur in der Store-Fassung | wie Entwurf |
| „FoodAsu bewerten“ | eingebaut, öffnet den Eintrag im App Store zum Bewerten, **ausgeblendet** bis die App im App Store steht (`AppStore.bewertenZeigen = false`) | Satz bleibt; er beschreibt die Fassung im App Store |
| Strichcode | AVFoundation (`AVCaptureMetadataOutput`), keine fremden Pakete | wie Entwurf |
| Feedback | `mailto` mit Betreff „FoodAsu Feedback“, Version der App und von iOS | Abschnitt 14 gilt |

## 3. Apple als Empfänger (Punkt 3)

- **Anschrift** auf Apples eigener Seite bestätigt: „Apple Distribution International Ltd., Apple Support, Hollyhill
  Industrial Estate, Hollyhill, Cork, Republik Irland“ (Bedingungen der Apple Mediendienste für Österreich,
  `apple.com/legal/internet-services/itunes/at/terms.html`, Muster-Widerrufsformular, abgerufen 02.11.2026).
- **Data Privacy Framework:** nicht genannt (Ergebnis oben). Apples Datenschutzrichtlinie
  (`apple.com/de/legal/privacy/de-ww/`) sagt, die Übermittlung werde durch die Standardvertragsklauseln geregelt.
- **Zeile in 20:** „Apple (Apple Distribution International Ltd., Hollyhill Industrial Estate, Hollyhill, Cork, Irland;
  Apple Inc., Cupertino, USA) | Sicherung in iCloud (12), App Store, Bewertungsfenster und Statistiken (13),
  TestFlight (15) | USA | Standardvertragsklauseln der EU-Kommission, auf die sich Apple nach eigenen Angaben bei der
  Übermittlung in andere Länder stützt“.

## 4. Nutzungsbedingungen (Punkt 5)

Nur der Satz „… etwa Google Play oder der App Store.“ und der Stand (27. → 2. November 2026), wie beim Schritt 1.0 →
1.0.1. Eine Versionsnummer zeigt die Website nicht; nach dem Muster ist das die Fassung **1.0.2** (Name nur für
Material und Berichte). Die Fassung, die die App zum Annehmen kennt, ist davon nicht berührt und nicht geändert.

## 5. Kurzlinks nach Gerät (Punkte 6 und 7)

- `src/daten/seite.mjs`: `APP_STORE_ERHAELTLICH = false`, `appStore.adresse = https://apps.apple.com/app/id6829687240`
  (ohne Kennung), `appleZiel` = App Store oder, solange false, `https://foodasu.com/`.
- `src/layouts/Weiterleitung.astro`: Titel „Weiter zu FoodAsu“. Im Kopf ein eingebettetes Skript (ohne Speicher,
  Cookies oder Anfrage): iPhone, iPad, iPod am User-Agent oder „Macintosh“ mit `maxTouchPoints > 1` gehen sofort zu
  `appleZiel` (der Knopf zeigt dann „Weiter zu FoodAsu“ und dasselbe Ziel); alle anderen gehen zum Link der Seite,
  also zu Google Play mit den bisherigen Kennungen. Das `meta refresh` zu Google Play steht jetzt im `<noscript>` im
  Kopf: Ohne Skript greift es wie bisher, mit Skript liest der Browser es nicht, so kann es dem Skript nicht
  zuvorkommen. Knopf und Gestaltung der Seite unverändert.
- `tools/pruefe_seiten.mjs`: genau ein eingebettetes Skript im Kopf, ohne Speicher und Anfrage, nur Adressen von
  foodasu.com und dem App Store, mit dem richtigen Ziel je Schalter; `meta refresh` im `noscript`; Titel. Gegenproben
  (je ein Befund erwartet, alle angeschlagen): meta refresh ohne `noscript`, fremdes Ziel, `fetch` im Skript, alter
  Titel, zweites Skript mit `src`.
- **Umschalten später:** in `seite.mjs` `APP_STORE_ERHAELTLICH = true`, bauen, `npm run pruefen`, veröffentlichen, dazu
  der Satz für 16a (Für Ali).
- Nebenwirkung: Weil `seite.mjs` zu den Quellen der Startseite und von `/ueber-foodasu/` zählt, tragen diese zwei
  Seiten in `sitemap.xml` jetzt `lastmod` 2026-11-02. Sonst ändert sich im Bau nichts außer den zwei Rechtsseiten und
  den vier Kurzlinks (Vergleich mit einem Bau von `main` `32ce1cd`: 7 von 976 Dateien anders).

## 6. Prüfungen (Punkt 9)

- `npm run build` und `npm run pruefen`: bestanden (auch nach den Commits). Die Prüfung im Bau wendet auf beide
  Rechtsseiten die Bezahl- und Fristwörter an; Preisaussagen im Bau: 976 Dateien, kein Fund.
- Wortprüfung `Material/texte_pruefen.py` (liest den fertigen Bau, Datenschutzerklärung und Nutzungsbedingungen mit den
  Bezahl-, Frist- und Preiswörtern): bestanden.
- Fertiger Bau: beide Rechtsseiten mit genau einem `noindex, follow`, „Version 2.1.0 · Stand: 2. November 2026“ oben
  und unten sichtbar. Neue Links: nur `https://www.apple.com/de/legal/privacy/` (zweimal), Antwort 200.
- Kurzlinks im Chrome des Macs (Skript `Material/temp/ap79w_netz/kurzlinks_testen.mjs`, je Fall die erste Navigation
  weg von der Seite festgehalten und abgebrochen), je acht Adressen (mit und ohne Schrägstrich) in sechs Fällen:
  iPhone, iPad mit Desktop-Kennung (Touch an), Mac ohne Touch, Android, iPhone ohne Skript, Android ohne Skript.
  Lokal und live je 48 von 48 wie erwartet, keine Anfrage an Dritte. Beim ersten lokalen Lauf scheiterten die ersten
  Aufrufe am Prüfskript selbst (Anfragen an `data:` als fremd gezählt, kalter Browser); nach der Korrektur des
  Skripts alles grün.
- `geschichte_pruefen.py` für `ap-79w` und `main`: bestanden.
- Nicht gelaufen: Nachweise im Browser für andere Seiten, Lighthouse, volle Kette. Gestaltung unverändert, die
  Rechtsseiten tragen noindex, Kurzlinks laufen nicht durch die Seitenprüfungen.

## 7. Veröffentlichung und Prüfung live (Punkt 10)

`main` `32ce1cd` → `84c7504` (`git merge --ff-only ap-79w`), Push 20:59 Uhr, Lauf 41514973808 erfolgreich. Live um
21:00 Uhr (Abruf mit Parameter gegen Zwischenspeicher): `/datenschutz.html` und `/nutzungsbedingungen.html` 200 mit
dem neuen Stand und noindex, die vier Kurzlinks und `sitemap.xml` 200 und gleich dem Bau (ohne Zeilenenden), Kurzlinks
im Browser wie oben.

## 8. Offene Entscheidungen

Stellen, die der Entwurf nicht nennt und der Code nicht verlangt; nicht geändert, Vorschlag für die nächste Fassung:

1. Abschnitt 21 und 22 nennen Apple nicht: „Open Food Facts, Google, GitHub und Meta speichern …“ und „Für Daten bei
   Open Food Facts, Google, GitHub oder Meta …“ → je „…, Google, Apple, GitHub …“; dazu ein Punkt „Bewertungen im App
   Store verwaltest du in deinem Apple Account.“ und bei der Sicherung „…, bei Android im Google-Konto, beim iPhone in
   iCloud oder auf deinem Computer“.
2. Abschnitt 16: „den Eintrag von FoodAsu im Play Store öffnet sie im Play Store“ → „…, auf dem iPhone den Eintrag im
   App Store im App Store“.
3. Einleitung und Abschnitt 3 nennen nur Google Play (Paketname, Name des Entwicklers). Ergänzen, sobald der Name im
   App Store feststeht.

## Für einkauf-app/CLAUDE.md

AP-79w (Website, 02.11.2026, ONLINE seit 20:59 Uhr, `main` `84c7504`): Datenschutzerklärung 2.1.0 mit dem Teil für das
iPhone (Apple in 19 und 20 ohne Data Privacy Framework, Apple Inc. dort am 02.11.2026 nicht gelistet),
Nutzungsbedingungen „etwa Google Play oder der App Store“ (Stand 2. November 2026). Kurzlinks `/teilen/`, `/app/`,
`/fb/`, `/ig/` nach Gerät: Skript im Kopf, iPhone und iPad zu `appleZiel`, sonst Google Play, `meta refresh` im
`noscript`; Schalter `APP_STORE_ERHAELTLICH` in `src/daten/seite.mjs` steht auf false (Startseite), umlegen erst nach
Apples Freigabe, dann auch den Satz in 16a (Bericht `docs/berichte/AP-79w_Bericht.md`).
