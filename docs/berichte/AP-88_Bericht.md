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
- Offene Entscheidungen: Abschnitt „Offene Entscheidungen“ (Teil 1), Kurzfassung: Grün im Symbol als zweite Ausnahme,
  Bild „Menü am App-Symbol“, Bild „Startseite“ mit dem alten Beta-Hinweis.

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
