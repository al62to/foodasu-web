# AP-88: Zwischenstand

Auftrag: `Material/Projektleitung/AP-88_Website_Symbol_SoGehts_AppStore.md` (lag schon dort, Wortlaut geprüft, gleich).
Zweig `ap-88` von `main` `37fcfb6`, nur lokal. App nur gelesen: worktree von `144a147` unter
`Material/temp/ap88_app` (App-Repository selbst bleibt auf `ap-87`).

## Etappe 1: Bestand (04.11.2026, 10:30)

### 1.1 Wo die Website den Einkaufswagen als App-Symbol zeigt

| Stelle | Wagen? | Was geschieht |
|---|---|---|
| `public/favicon.svg` | ja (weißer Wagen auf Indigo) | Etappe 2 neu aus der Figur |
| `public/favicon.ico` (16, 32, 48) | ja, gebaut aus `favicon.svg` | Etappe 2 neu |
| `public/favicon-32.png` | ja | Etappe 2 neu |
| `public/apple-touch-icon.png` (180 x 180) | ja | Etappe 2 neu |
| Strukturierte Daten: `logo` der Organisation (`seite.mjs`), `image` der `MobileApplication` (`strukturiert.mjs`) | ja, beide zeigen auf `/apple-touch-icon.png` | ändern sich mit der Datei, Code bleibt |
| Weiterleitungsseiten (`/teilen/`, `/app/`, `/fb/`, `/ig/`) | nur über die Favicons im Kopf; im Bild der Schriftzug | ändern sich mit den Favicons |
| OG-Bild `public/bilder/foodasu-teilen.jpg` | nein: Schriftzug „FoodAsu“ und Satz auf Indigo, kein Symbol | bleibt |
| Logo in Kopf und Fuß (`src/inhalte/logo.svg`) | nein: Schriftzug | bleibt |
| Startseiten-Film und Poster (`zettel-zur-app-*`) | nein (Zettel, Liste, Scanner, Schriftzug; Einzelbilder alle 1,5 s angesehen) | bleibt |
| So-geht's-Bild `start_schnellzugriff_01` | ja: Menü am App-Symbol, darunter das alte Symbol mit Wagen | Etappe 3 neu aufnehmen |
| übrige So-geht's-Bilder und die drei Filme | nein | bleiben |
| Zeichen `wagen` in `src/daten/zeichen.mjs` | Bildzeichen für Einkaufen, nicht das App-Symbol | bleibt (Auftrag) |

### 1.2 Sichtbare Änderungen der Android-App von 0.19.0 (`v0.19.0`) zu 0.20.0 (`144a147`)

Aus dem Diff (Texte in `app/src/main/res/values/strings*.xml`, Code) und den Berichten AP-82 bis AP-87:

| Änderung | Betrifft auf der Website |
|---|---|
| Karte „Kommt bald“ („Produktpreise und Ausgaben“) auf der Startseite entfernt (AP-82) | kein Text (Suche nach „Kommt bald“, „Produktpreise“: kein Treffer); kein Bild zeigt die Karte (`start_startseite_01` endet vorher, beim Rezept-Vorschlag) |
| Keine Zahlen mehr auf der Rezepte-Seite („25 Länder“ bei „Nach Ländern“, „273 Rezepte“ bzw. „37 Rezepte“ bei „Rezepte“; AP-84). Die Zeile „N Rezepte ausgeblendet …“ bleibt in der App | Bilder `rezepte_ansehen_01` (auch auf der Startseite), `rezepte_filter_01`, `rezepte_merken_02`; Bildtext von `rezepte_filter_01` nennt „37 Rezepte“. Kein Satz der Website beschreibt die Zahlen der App-Seite |
| „Zurück zur Liste“ in der Karte nach dem Scannen für eine Liste (nur im Modus „Scannen für Liste“; AP-85) | Abschnitt „In die Liste scannen“ (`einkaufslisten.mjs`): neuer Satz. Kein Bild zeigt diesen Modus: `karte_auf_die_liste_02` und die Filme zeigen den Scanner aus der Leiste mit „auf: Wocheneinkauf“, dort kommt der Knopf nicht |
| Haken der Tastatur schließt die Tastatur, auch mit Text; Antippen öffnet sie wieder (AP-85, `ListAddField.kt`) | Abschnitt „Einträge hinzufügen“ (`einkaufslisten.mjs`): „Das Feld bleibt offen für den nächsten Eintrag.“ stimmt nicht mehr. Bild `liste_eintraege_02` endet über der Tastatur, bleibt |
| Neues App-Symbol (Figur im Scan-Rahmen) und Startbildschirm (AP-87) | Favicons, Apple-Symbol, `start_schnellzugriff_01` (siehe 1.1) |
| Willkommenstext der Einführung „… dass du FoodAsu nutzt“ statt „testest“ | kein Text, kein Bild auf der Website |

### 1.3 So-geht's-Bilder mit Zahlen der Rezepte-Seite

Alle 43 Bilder und die drei Filme als Übersicht angesehen (`Material/temp/ap88/uebersicht_*.png`):

- `rezepte_ansehen_01`: „25 Länder“, „273 Rezepte“ → neu
- `rezepte_filter_01`: „25 Länder“, „37 Rezepte“ → neu, Bildtext anpassen
- `rezepte_merken_02`: „25 Länder“ → neu
- ohne Zahlen der Rezepte-Seite: `rezepte_ausblenden_01` (nur „33 Rezepte ausgeblendet …“, bleibt in der App), `rezepte_hinweise_01`, `rezepte_liste_01`, `rezepte_naehrwerte_01`, `rezepte_portionen_01`, `liste_kochen_01`, `film-kochen`
- Zahlen der Website (Zahlenblock, `appZahlen`): nicht betroffen, bleiben

Nebenbefund (nicht 0.20.0): `start_startseite_01` zeigt noch den alten Beta-Hinweis; seit 0.19.0 steht dort die Karte
„FoodAsu wächst.“ (schon im Bericht AP-54 vermerkt). Unter „Offene Entscheidungen“.

### 1.4 Zahlen zur App

`tools/app_fassung_exportieren.py` fand die Dateien in `144a147` nicht mehr (Teile liegen seit dem Kern unter
`kern/`). Werkzeug ergänzt: je Datei mehrere Orte, der erste vorhandene gilt; neue Angabe `--ziel` für eine Probe.
Gegenprobe: mit `--ref a5818ec` entsteht byte-gleich die Datei auf `main`.

Probe `Material/temp/ap88/app_fassung_probe_144a147.json`: 20 feste Einträge (14 Zutaten, 2 Ernährungsformen,
4 weitere), 4.099 weitere Lebensmittel, 3 Stufen, „Häufig gewählt“ 8, Zutatenliste gleich. Anders sind nur `fassung`
(0.20.0), `versionCode` (2000) und `commit`; diese Angaben zeigt die Website nirgends. Rezepte und Länder: die
Rezeptdateien der App sind von 0.19.0 zu 0.20.0 unverändert. **`src/daten/app_fassung.json` bleibt.**

## Etappe 2: Figur statt Wagen (04.11.2026, 10:35)

- `tools/favicon_bauen.mjs` baut jetzt alle Symbole aus der Vorlage (`Material/grafiken/symbol_figur/C1_fein.svg`,
  Figur im Scan-Rahmen auf Indigo #4A3FD1): `favicon.svg` (Zeichnung unverändert, Fläche mit runden Ecken wie bisher,
  Radius 2/9 der Seite; Metadaten und fremde Namensräume der Vorlage entfernt, 1.991 Byte), `favicon.ico` (16, 32, 48,
  je für sich aus der Vektorgrafik), `favicon-32.png` und `apple-touch-icon.png` (180 x 180) in voller Fläche ohne
  Transparenz wie bisher. Aufruf `node tools/favicon_bauen.mjs [Vorlage]`.
- Erkennbarkeit (Vergleichsbild `AP-88_vorschau/01_favicon_alt_neu.png`): bei 16 Pixeln eine helle runde Figur mit
  Spross im Rahmen, das Gesicht nur angedeutet; ab 32 Pixeln Augen und Mund erkennbar, der Rahmen ab 48 klar.
- Logo der Organisation und Bild der `MobileApplication` zeigen auf `/apple-touch-icon.png` und haben damit die Figur.
- OG-Bild `foodasu-teilen.jpg`: zeigt kein Symbol (nur Schriftzug und Satz), bleibt unverändert. Logo, Film und Poster
  zeigen keinen Wagen, bleiben.
- **Farbprüfung:** Die Figur hat Mint (#B8F0D2, #8DDDB6) und Grün (Spross). `tools/pruefe_seiten.mjs` nimmt deshalb
  `/favicon.svg` als zweite Ausnahme neben dem Abzeichen von Google Play aus (Kommentar dort). Gegenprobe ohne die
  Ausnahme: genau ein Befund „/favicon.svg … #B8F0D2“. Unter „Offene Entscheidungen“, weil Alis Regel „kein Grün,
  nirgends“ bisher nur das Abzeichen ausnahm.
- Bau und `npm run pruefen`: bestanden.

## Etappe 3: So geht's und Texte (04.11.2026, 10:45)

### 3.1 Bilder

Testfassung 0.20.0 (2000) aus dem worktree `144a147` (`assembleVollDebug`, Lauf über das Lauf-Skript mit Belegt-Zettel;
`local.properties` der App als Verweis im worktree, nicht geöffnet) am eigenen Emulator `einkauf_api35`, für die
Aufnahmen auf die Werte des S24 gestellt (1080 x 2340, 480 dpi, Tasten) wie bei AP-54, danach zurückgestellt.
Haushalt per Import: Mia Schalenfrüchte „Auf keinen Fall“, Jonas Gluten „Meiden“, Elif vegetarisch „Meiden“ (je ein
Eintrag, ohne Schweinefleisch). Verarbeitet mit `So_gehts_Bilder/werkzeug/ap88_verarbeiten.py` (aus
`ap54_verarbeiten.py`), dann `tools/sogehts_fotos.py`. Alte Fassungen in `So_gehts_Bilder/bis_2026-11-04_ap88/` und
`bilder_bis_2026-11-04_ap88.json`.

| Bild | vorher | jetzt |
|---|---|---|
| `rezepte_ansehen_01` (auch Startseite) | „25 Länder“, „273 Rezepte“ | ohne Zahlen, sonst gleicher Ausschnitt |
| `rezepte_filter_01` | „25 Länder“, „37 Rezepte“; Bildtext „… gewählt: 37 Rezepte; …“ | ohne Zahlen; Bildtext ohne „37 Rezepte“ |
| `rezepte_merken_02` | „25 Länder“ | ohne Zahl; „Gemerkt“: Kaiserschmarren, Ratatouille, Anfang von Apfelstrudel |
| `start_schnellzugriff_01` | altes Symbol (Wagen) | **nicht getauscht**, siehe unten |

`sogehts_fotos.py` hat dabei auch `scanner_ean_03` und `scanner_scannen_01` neu kodiert (Kamerabilder aus AP-32,
gleiche Quelle); beide sofort auf den Stand von `main` zurückgesetzt, sie ändern sich nicht.

**`start_schnellzugriff_01` nicht getauscht:** Das alte Bild stammt vom S24 (Samsung). Am Emulator zeigt der
Pixel-Launcher ein anderes Menü (App-Info, App pausieren) und die langen Namen der Schnellzugriffe, „Produkt scannen“
und „Einkaufsliste öffnen“; die Website schreibt „Scannen“ oder „Liste“ (die kurzen Namen, so am S24). Ein Tausch
hätte Bild und Text auseinandergebracht. Kandidat für die Vorschau: Store-Datei 2000 (`Material/FoodAsu-0.20.0-2000.aab`,
universelle APK, Debug-Schlüssel) am Emulator, nicht geöffnet, Systemsprache für die Aufnahme kurz Deutsch.
Unter „Offene Entscheidungen“.

Filme: keiner zeigt die Rezepte-Seite oder die Kommt-bald-Karte; nichts zu melden.

Emulator danach: Store-Kopie deinstalliert, Systemsprache, Größe, Dichte und Gestennavigation zurück (vorher war
`persist.sys.locale` leer, jetzt `en-US`, gleiche Sprache), Emulator beendet, Belegt-Zettel leer. In der Testfassung am
Emulator bleibt der Beispielhaushalt mit drei gemerkten Rezepten (vorher Mia mit Milch).

### 3.2 bis 3.4 Texte

- „In die Liste scannen“ (`einkaufslisten.mjs`, Anker `in-die-liste-scannen`), neuer Satz: „Nach dem Scannen bringt
  dich „Zurück zur Liste“ auf der Produktkarte direkt wieder zu dieser Liste.“ Abweichung vom Vorschlag: „auf der
  Produktkarte“, weil der Knopf in der Leiste der Karte unter „Auf der Liste“ steht (`CardListBar.kt`,
  `BackToListButton`, nur im Modus „Scannen für Liste“); Beschriftung in der App wörtlich „Zurück zur Liste“.
- Tastatur: Die Anleitung beschrieb sie in „Einträge hinzufügen“ („Das Feld bleibt offen für den nächsten Eintrag.“).
  Das stimmt seit 0.20.0 nicht mehr (`ListAddField.kt`: Haken meldet den Eintrag und schließt die Tastatur). Der Satz
  wird: „Der Haken auf der Tastatur setzt den Eintrag auf die Liste und schließt die Tastatur; ein Tipp ins Feld öffnet
  sie wieder.“ Beim Abhaken nennt die Anleitung keine Tastatur.
- Querformat (`scannen-und-urteil.mjs`): „… neben dem Kamerabild (Android).“ Die Sperre gegen Plattform-Nennungen
  schlug an; der Wortlaut steht jetzt in `ANLEITUNG_ANDROID` in `tools/pruefe_seiten.mjs` (technischer Hinweis, wie
  „Backup von Android“).

### 3.5 Aussagen, die nach 0.20.0 nicht mehr stimmen

Gesucht in `src/daten`, `src/inhalte`, Seiten und `llms.txt` nach „Kommt bald“, „Produktpreise“, „Preise“, „Länder“,
„Zahl der“, „Wagen“, „Symbol“, „Startbildschirm“, „Feld bleibt“, „Tastatur“, „testest“:
- geändert: nur der Satz zur Tastatur (oben).
- stimmt weiter: „über N Rezepte aus N Ländern“ (Zahlen der Website, nicht der App-Seite), „Wagen“ in „was im Wagen
  liegt“ (Einkaufswagen im Laden, nicht das Symbol), „lange auf das Symbol von FoodAsu drücken“ (gilt für jedes Symbol).
- keine Fundstelle zur Kommt-bald-Karte und zum alten Symbol im Text.

### 3.6 Verfügbarkeit

Sätze zur Verfügbarkeit unverändert.

Bau und `npm run pruefen`: bestanden. Texte ausgegeben nach `Material/Website_Texte_SoGehts.md` und
`Material/Website_Texte_Startseite.md`.
