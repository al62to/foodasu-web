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
