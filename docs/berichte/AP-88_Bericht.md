# AP-88: Website auf den Stand von Android 0.20.0 und App Store vorbereitet

Auftrag: `Material/Projektleitung/AP-88_Website_Symbol_SoGehts_AppStore.md` (04.11.2026). Einzelheiten je Etappe in
`docs/berichte/AP-88_Zwischenstand.md`. Keine Unteragenten.

## Für Ali

- **Teil A ist fertig, aber nicht live** (Zweig `ap-88`, lokal). Was sich ändert:
  1. Das Symbol im Browser-Tab, das Symbol auf dem iPhone-Startbildschirm (wenn jemand die Seite dort ablegt) und das
     Logo in den Daten für Google zeigen die Figur im Scan-Rahmen statt des Einkaufswagens.
  2. „So geht's“: drei Bilder der Rezepte-Seite ohne „25 Länder“ und „273 Rezepte“ (eines davon auch auf der
     Startseite), ein Satz zu „Zurück zur Liste“ nach dem Scannen für eine Liste, der Satz zur Tastatur (der Haken
     schließt sie jetzt), beim Querformat „(Android)“.
  3. Das Bild zum Teilen in Social Media zeigte nie den Wagen und bleibt.
- **Vorschau:** `Material/Projektleitung/AP-88_vorschau/` (Symbole alt und neu, Browser-Tab hell und dunkel, Bilder
  alt und neu, die geänderten Abschnitte am Handy und am Laptop).
- **Weiter mit Teil A nur mit „Ja Website live“ in diesem Chat, wenn Android 0.20.0 im Play Store veröffentlicht ist.**
- **Teil B wartet auf Zweig `ap-88b`** (lokal, nicht gemergt, nicht gepusht): App Store als Ziel der Kurzlinks fürs
  iPhone, Datenschutzerklärung 2.1.1 (Wortlaut zur Freigabe, Gegenüberstellung in
  `AP-88_vorschau/teil_b/datenschutz_alt_neu.md`), Satz „FoodAsu gibt es für Android im Play Store und fürs iPhone im
  App Store.“, das Abzeichen von Apple im Fuß vor dem von Google (Vorschau `AP-88_vorschau/teil_b/`), Markenhinweis auf
  /lizenzen/, iPhone in den Daten für Google. Live erst mit Apples Freigabe und deinem Ja, in einem kleinen Folgeauftrag.
- Offene Entscheidungen mit Vorschlag: Teil 1, Abschnitt 5 (Grün im Symbol, Bild „Menü am App-Symbol“, Bild
  „Startseite“) und Teil 2, Abschnitt 6 (Wortlaut Datenschutz, Kampagnenkennungen, Seite für Codes, Teilen-Bilder,
  Knöpfe der Startseite).

## Teil 1: Teil A (Website auf den Stand von Android 0.20.0)

Zweig `ap-88` von `main` `37fcfb6`, drei Commits:

| Commit | Inhalt |
|---|---|
| `42eb946` | `tools/app_fassung_exportieren.py` findet die Dateien auch im Kern der App, `--ziel` für Proben; Zwischenstand Etappe 1 |
| `e13436a` | Symbole aus der Vorlage der Figur (`tools/favicon_bauen.mjs`), Farbprüfung nimmt `/favicon.svg` aus |
| `6552092` | So geht's zu 0.20.0: drei Bilder, drei Sätze, Prüfung im Bau kennt den Satz zum Querformat |

### 1. Bestand (Etappe 1)

- Wagen als App-Symbol: `favicon.svg`, `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` (damit auch Logo der
  Organisation und Bild der `MobileApplication`, die auf diese Datei zeigen, und die Favicons der Kurzlinks) und das
  So-geht's-Bild `start_schnellzugriff_01`. Nicht: OG-Bild, Logo in Kopf und Fuß (Schriftzug), Film und Poster der
  Startseite, übrige Bilder und Filme.
- Sichtbar neu in 0.20.0: Kommt-bald-Karte weg (keine Stelle auf der Website), Zahlen der Rezepte-Seite weg (drei
  Bilder), „Zurück zur Liste“ (ein Satz), Haken schließt die Tastatur (ein Satz war falsch), neues Symbol.
- Zahlen zur App: Probe mit 0.20.0 gleich wie auf `main` bis auf Fassung, Versionscode und Commit, die die Website nicht
  zeigt. `src/daten/app_fassung.json` bleibt.

### 2. Figur statt Wagen (Etappe 2)

`node tools/favicon_bauen.mjs [Vorlage]` baut alle vier Dateien aus `Material/grafiken/symbol_figur/C1_fein.svg`.
Zeichnung unverändert; `favicon.svg` mit runden Ecken wie bisher und ohne die Metadaten der Vorlage. Bei 16 Pixeln
bleibt eine helle runde Figur mit Spross im Rahmen erkennbar, das Gesicht ab 32 Pixeln.

### 3. So geht's und Texte (Etappe 3)

- Bilder neu (Testfassung 0.20.0 aus `144a147` am eigenen Emulator, gleiche Maße und Ausschnitte, Mia, Jonas, Elif mit
  je einem Eintrag): `rezepte_ansehen_01`, `rezepte_filter_01` (Bildtext ohne „37 Rezepte“), `rezepte_merken_02`.
- `start_schnellzugriff_01` nicht getauscht (siehe Offene Entscheidungen 2).
- Neuer Satz in „In die Liste scannen“: „Nach dem Scannen bringt dich „Zurück zur Liste“ auf der Produktkarte direkt
  wieder zu dieser Liste.“ („auf der Produktkarte“ ergänzt: Der Knopf steht in der Leiste der Karte unter „Auf der
  Liste“.)
- „Einträge hinzufügen“: „Das Feld bleibt offen für den nächsten Eintrag.“ wird „Der Haken auf der Tastatur setzt den
  Eintrag auf die Liste und schließt die Tastatur; ein Tipp ins Feld öffnet sie wieder.“
- Querformat: „… neben dem Kamerabild (Android).“, als technischer Hinweis in der Sperre gegen Plattform-Nennungen
  eingetragen.
- Sätze zur Verfügbarkeit unverändert.

### 4. Prüfungen (Etappe 4)

| Prüfung | Ergebnis |
|---|---|
| `npm run build` (darin Preisaussagen, Links in So geht's) | bestanden, 976 Dateien |
| `npm run pruefen` | bestanden; Gegenprobe Farbprüfung ohne Ausnahme: genau ein Befund `/favicon.svg` |
| `Material/texte_pruefen.py` (liest den Bau) | bestanden |
| Vorschau im Browser (Handy 390, Laptop 1366): Startseite oben, Bild der Rezepte auf der Startseite, sechs Abschnitte in So geht's | Konsole ohne Fehler |
| Browser-Tab hell und dunkel (Chrome am Mac) | Figur im Tab |
| `npm run funktionen` | nur Hinweis: Das Werkzeug kennt den Kern der App noch nicht (570 Meldungen, fast alle „Datei nicht mehr im Code“, weil Dateien nach `kern/` gewandert sind) und sucht ohne `FOODASU_APP` noch unter `einkauf-app`; kein Befund zu den geänderten Abschnitten |

Nicht gelaufen und warum das reicht: `woerter_pruefen.py --startseite` (Text der Startseite unverändert, nur ein Bild),
Links (keine Links geändert), Nachweise mit `nachweise/seo-neu/nachweise_teil.mjs` (liegt am Mac nicht vor; ersetzt durch
die Bildschirmfotos der Abschnitte), Lighthouse und volle Kette (Gestaltung und Aufbau unverändert, nur Texte, Bilder
gleicher Maße und Symbole).

### 5. Offene Entscheidungen (Teil A)

1. **Grün im Symbol:** Die Figur hat Mint und einen grünen Spross. Die Regel „kein Grün, nirgends“ nahm bisher nur das
   Abzeichen von Google Play aus. Umgesetzt wie beauftragt (Zeichnung unverändert), `/favicon.svg` als zweite
   Ausnahme in der Farbprüfung. Vorschlag: so lassen; mit „Ja Website live“ gilt die Ausnahme als bestätigt.
2. **Bild „Menü am App-Symbol“ (`start_schnellzugriff_01`, Erste Schritte, „Schneller starten“):** zeigt noch den Wagen.
   Am Emulator zeigt Android ein anderes Menü mit den langen Namen „Produkt scannen“ und „Einkaufsliste öffnen“; die
   Website sagt „Scannen“ oder „Liste“ (am S24). Vergleich in der Vorschau, Bild 04. Vorschlag A: nach der
   Veröffentlichung von 0.20.0 ein Bildschirmfoto am S24 (Play-Fassung, langes Drücken aufs Symbol), aufgenommen in
   einem kleinen Folgeauftrag mit dem S24, Text bleibt. Vorschlag B: das Emulator-Bild nehmen und im Text „„Scannen“
   oder „Liste“ (je nach Handy auch „Produkt scannen“, „Einkaufsliste öffnen“)“ schreiben.
3. **Bild „Startseite“ (`start_startseite_01`):** zeigt noch den Beta-Hinweis, den es seit 0.19.0 nicht mehr gibt; dort
   steht jetzt „FoodAsu wächst.“ (kein Punkt aus 0.20.0, schon in AP-54 vermerkt). Vorschlag: im selben Folgeauftrag
   neu aufnehmen.
4. Logo, Startseiten-Film, Poster und OG-Bild zeigen keinen Wagen; nichts zu entscheiden.

### 6. Nebenbei

- Der Emulator `einkauf_api35` war für die Aufnahmen auf die Werte des S24 und kurz auf Deutsch gestellt; alles
  zurückgestellt (Sprache vorher leer, jetzt `en-US`). Die Store-Datei 2000 lag nur für das Kandidatenbild darauf und ist
  wieder entfernt. Beim Ablegen des Symbols auf dem Startbildschirm ersetzte der Launcher in der unteren Leiste kurz
  Gmail durch einen App-Vorschlag; nach dem Neustart war Gmail wieder da.
- `npm run funktionen` legte wegen des alten Standardpfads einen leeren Ordner `~/Projekte/FoodAsu/einkauf-app` an; die
  Ergebnisdatei liegt jetzt in `Material/temp/ap88/`, die leeren Ordner sind entfernt.

## Teil 2: Teil B (App Store vorbereitet, nur lokal)

Zweig `ap-88b` (von `ap-88`), fünf Commits, nicht gemergt, nicht gepusht. Inhaltlich hat Ali die Ergänzungen der
Rechtstexte am 02.11.2026, 21:26 angenommen; den Wortlaut gibt Ali vor dem Livegang frei.

| Inhalt (Reihenfolge der Commits; Kennungen ändern sich beim Neuaufsetzen) |
|---|
| Schalter `APP_STORE_ERHAELTLICH` an, Anbieter-Code `APPLE_ANBIETER` (leer) und `appleLink(<Kampagne>)`, Ziel je Kurzlink |
| Datenschutzerklärung 2.1.1 |
| Satz zur Verfügbarkeit, „App Store“ englisch für die Sprachausgabe |
| Abzeichen von Apple im Fuß, Markenhinweis auf /lizenzen/ |
| strukturierte Daten mit iOS |

### 1. Schalter und Kennung (Punkt 1)

`src/daten/seite.mjs`: `APP_STORE_ERHAELTLICH = true`, Ziel `https://apps.apple.com/app/id6829687240`.
`APPLE_ANBIETER = ''` (Anbieter-Code „pt“ aus App Store Connect, trägt die PL nach). `appleLink(kampagne)` hängt nur mit
gesetztem Code `?pt=…&ct=<kampagne>&mt=8` an, sonst geht der Link ohne Kennung. Kampagnen wie `utm_campaign`:
`/fb/`, `/ig/`, `/app/` → `kurzlink`, `/teilen/` → `empfehlung`, Abzeichen im Fuß → `fuss` (auf den vier Seiten mit
Rechtstexten ohne Kennung, wie bei Google Play). `tools/pruefe_seiten.mjs` rechnet das Ziel je Kurzlink und das des
Abzeichens unabhängig nach.

### 2. Datenschutzerklärung 2.1.1 (Punkt 2)

Fassungsnummer nach dem Muster (kleine Ergänzung: dritte Stelle), „Version 2.1.1 · Stand: 4. November 2026“ oben und
unten; **das Datum am Tag der Veröffentlichung nachziehen.** Gegenüberstellung aller Absätze:
`Material/Projektleitung/AP-88_vorschau/teil_b/datenschutz_alt_neu.md`.

| Stelle | neu |
|---|---|
| Einleitung | „…; im App Store heißt die App fürs iPhone „FoodAsu – Lebensmittel-Scanner“ und hat die Bundle-ID at.tonc.foodasu.“ |
| 3 | „Unter diesem Namen steht der Entwickler auch bei Google Play und im App Store.“ |
| 13 | Absatz „Kennung des Kanals“ unter „App Store (iPhone)“ (Wortlaut unten) |
| 16 | „…, auf dem iPhone den Eintrag im App Store im App Store.“ |
| 16a | der vorgemerkte Satz aus AP-79w („… je nach Handy zum Eintrag von FoodAsu bei Google Play weiter, mit einer Kennung des Kanals (Abschnitt 13), oder zum Eintrag im App Store.“) |
| 21 | „Open Food Facts, Google, Apple, GitHub und Meta“; Sicherung „…, bei Android im Google-Konto, beim iPhone in iCloud oder auf deinem Computer.“; Punkt „Bewertungen im App Store verwaltest du in deinem Apple Account.“ |
| 22 | „Open Food Facts, Google, Apple, GitHub oder Meta“ |
| 26 | „**Fassung 2.1.1.** Neu sind die Angaben zum App Store.“ |

Absatz 13, ausgerichtet am Absatz zu Google Play: „**Kennung des Kanals.** Verknüpfungen zum Eintrag von FoodAsu im App
Store, etwa von der Website oder von Facebook und Instagram, können eine Kennung der Kampagne tragen, zum Beispiel
„kurzlink“. Apple zeigt mir daraus in App Store Connect nur zusammengefasst, über welche Kampagne Besuche des Eintrags
und Installationen kamen, ohne Angaben zu einzelnen Personen; Zahlen zu sehr kleinen Gruppen hält Apple zurück oder
fasst sie zusammen. Die Kennung enthält nichts über dich, und die App liest sie nicht aus.“
Quelle (abgerufen am 04.11.2026): Apple, App Store Connect Help, „Campaign links“
(`https://developer.apple.com/help/app-store-connect/view-app-analytics/manage-campaigns`): Link-Form mit `pt`, `ct`
und `mt=8`; `ct` bis 30 Zeichen; Werte erscheinen erst ab mindestens fünf Nutzern, Zeilen sehr kleiner Gruppen werden
zurückgehalten oder zusammengefasst; Einzelheiten zu Kampagnen nur in den Detailberichten mit strengerem Schutz.

### 3. Satz zur Verfügbarkeit (Punkt 3)

„FoodAsu gibt es für Android im Play Store und fürs iPhone im App Store.“ an diesen Stellen: `src/daten/startseite.mjs`
(`VERFUEGBAR`; damit Kopf der Startseite, Frage „Gibt es FoodAsu fürs iPhone?“ samt strukturierten Daten, Abschluss,
`llms.txt` und die Seite für Codes `/c/`), `src/daten/fragen.mjs`, `src/daten/ueber.mjs`,
`src/daten/anleitung/erste-schritte.mjs` (Installieren), `tools/pruefe_seiten.mjs` (Wortlaut der Sperre).
`src/daten/meta.mjs` nennt die Verfügbarkeit nicht. Im Bau steht der alte Satz nirgends mehr (Suche über alle Seiten
außer den Rechtstexten).

### 4. Abzeichen und Markenhinweis (Punkt 4)

- Datei `public/bilder/app-store-abzeichen-de.svg`: das schwarze deutsche Abzeichen „Laden im App Store“ aus Apples
  Marketing-Werkzeug (`toolbox.marketingtools.apple.com`, Titel in der Datei
  `Download_on_the_App_Store_Badge_DE_RGB_blk_092917`, 9.217 Byte), byte-gleich abgelegt, ohne Skript.
- Fuß: Apple zuerst (Vorgabe von Apple bei mehreren Abzeichen), beide sichtbar 40 px hoch (Mindesthöhe von Apple am
  Bildschirm), 12 px Abstand (mehr als ein Viertel der Höhe). Damit das Google-Abzeichen sichtbar gleich hoch ist, steht
  es jetzt 3,25rem statt 2,75rem hoch (die PNG hat oben und unten durchsichtigen Rand). Bildbeschreibung „Laden im App
  Store“. Gemessen im Browser: Apple 40 px, Google 52 px (davon 40 px sichtbar), hell und dunkel, Handy und Laptop.
- /lizenzen/: Abschnitt „App Store“ vor „Google Play“: „Apple, das Apple-Logo und App Store sind Marken von Apple Inc.“
  Geprüft an Apples Vorgaben (developer.apple.com/app-store/marketing/guidelines, 04.11.2026): Beim Abzeichen sind Apple
  und das Apple-Logo zu nennen, außerhalb der USA in der Form „… are trademarks of Apple Inc.“, übersetzt erlaubt, die
  Marken bleiben englisch.
- Die Sperre gegen fremde Links in „So geht's“ (`tools/sogehts_links.mjs`) erlaubt im Fuß jetzt auch die Adresse im App
  Store.

### 5. Strukturierte Daten (Punkt 5)

`MobileApplication`: `operatingSystem` „Android, iOS“, `softwareRequirements` „Android 8.0 oder neuer, iOS 17.0 oder
neuer“ (`deploymentTarget` iOS 17.0 in `ios/project.yml` bei `adb5879`, nur iPhone), `sameAs` mit Google Play und App
Store. `installUrl` bleibt Google Play: Das Feld nimmt eine Adresse, und die Website war bisher die des Play Store.
Prüfung im Bau verlangt genau diese Werte, solange der Schalter an ist (Gegenprobe mit „Android“ allein: zwei Befunde).

### 6. Offene Entscheidungen (Teil B)

1. **Wortlaut der Datenschutzerklärung 2.1.1** (Abschnitt 2 oben): dein Ja vor dem Livegang. Dabei: In Abschnitt 3
   „Unter diesem Namen steht der Entwickler auch … im App Store“ bitte am Eintrag in App Store Connect bestätigen.
2. **16a mit Kennung:** Der vorgemerkte Satz sagt, nur der Link zu Google Play trägt eine Kennung. Sobald der
   Anbieter-Code steht, trägt auch der Link zum App Store eine. Vorschlag dann: „… oder zum Eintrag im App Store, beide
   mit einer Kennung des Kanals (Abschnitt 13).“
3. **Kampagnenkennungen:** Wie beauftragt gleich `utm_campaign`, also dreimal „kurzlink“ für `/fb/`, `/ig/`, `/app/`.
   Bei Google Play unterscheidet die Quelle (`utm_source`), bei Apple gibt es nur `ct`. Vorschlag: `facebook`,
   `instagram`, `nachricht`, damit Apple die Wege getrennt zeigt (eine Zeile je Kurzlink in `seite.mjs`).
4. **Seite für Codes `/c/`:** zeigt den Satz zur Verfügbarkeit für iPhones; Codes gibt es nur auf Android. Vorschlag:
   dort ein eigener Satz „Codes löst du in FoodAsu für Android ein.“ statt des allgemeinen Satzes.
5. **Teilen-Bilder mit beiden Abzeichen** (`Material/Projektleitung/Teilen_Entwuerfe`: A1 „Empfehlen Lila“, A2
   „Empfehlen Hell“, B1 „Rezept Karte“, B2 „Rezept Vollbild“; eine Variante C liegt dort nicht): nicht geändert.
   Vorschlag: in A1 und B1 die zwei Abzeichen nebeneinander, Apple zuerst, in gleicher sichtbarer Höhe wie im Fuß;
   Bilder der App sind ein Auftrag für die App.
6. **Knöpfe „Jetzt im Play Store“ auf der Startseite:** nicht geändert. Vorschlag: daneben ein gleich gestalteter
   Knopf „Jetzt im App Store“ mit `appleLink('kopf')` bzw. `('abschluss')`, ohne Abzeichen (Alis Regel vom 23.10.2026:
   kein Abzeichen im Kopf und im Abschluss).
7. **Englische Kurzfassung der Datenschutzerklärung** und die Quelle `Material/Datenschutzerklaerung.md`: nicht
   nachgezogen (wie in AP-79w); vor dem Livegang von Teil B angleichen.

### 7. Prüfungen (Teil B, auf `ap-88b`)

| Prüfung | Ergebnis |
|---|---|
| `npm run build` | bestanden |
| `npm run pruefen` | bestanden; Gegenproben: Fuß ohne Apple-Abzeichen (zwei Befunde), `operatingSystem` „Android“ (zwei Befunde) |
| `Material/texte_pruefen.py` (Bau, mit Rechtstexten) | bestanden |
| Kurzlinks im Chrome des Macs, je 8 Adressen in 6 Fällen (iPhone, iPad mit Desktop-Kennung, Mac ohne Touch, Android, iPhone und Android ohne Skript), Anbieter-Code leer | 48 von 48: iPhone und iPad zum App Store ohne Kennung, sonst Google Play mit Kennung, keine Anfrage an Dritte |
| dasselbe mit Anbieter-Code `123456` (nur lokal, nicht committet, danach zurückgesetzt) | 48 von 48: `?pt=123456&ct=empfehlung&mt=8` bei `/teilen/`, `ct=kurzlink` bei den anderen; Abzeichen im Fuß mit `ct=fuss`, auf den Rechtstexten ohne |
| Vorschau Fuß hell und dunkel, Handy und Laptop; /lizenzen/; Startseite oben | Konsole ohne Fehler |

Skripte: `Material/temp/ap88/kurzlinks_testen_ap88.mjs <Basis> [pt]`, `vorschau_b.mjs`. Protokolle
`Material/temp/ap88/kurzlinks_pt_leer.txt`, `kurzlinks_pt_gesetzt.txt`.

### 8. Livegang von Teil B später (Folgeauftrag)

`ap-88b` auf den dann aktuellen `main` setzen, Datum der Datenschutzerklärung auf den Tag, Anbieter-Code eintragen (oder
leer lassen), Prüfungen wie oben, `geschichte_pruefen.py ap-88b`, Vorspulen, Push.
