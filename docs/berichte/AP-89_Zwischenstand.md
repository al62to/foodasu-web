# AP-89: Zwischenstand (Website)

Auftrag: `Material/Projektleitung/AP-89_Merge_Tag_und_zwei_Bilder.md`. Ausführlicher Bericht im App-Repository
(`docs/berichte/AP-89_Bericht.md`, Zweig `ap-89`).

## Etappe 0: Aufräumen (04.11.2026, 11:23)

`.git/stale-maintenance-lock-ap88pl` (leer) in den Papierkorb; `git status` sauber, `git fsck --no-dangling` ohne
Meldung.

## Etappe 4: Zwei Bilder in „So geht's“ (04.11.2026, 11:45)

Zweig `ap-89` von `main` `8570fb2`. Nur zwei Bilder getauscht, kein Text der Seiten, kein Design:

| Bild | vorher | jetzt |
|---|---|---|
| `start_startseite_01` (Erste Schritte, „Die Startseite“; Leitbild des Kapitels) | Beta-Hinweis, 0.15.3 | Karte „FoodAsu wächst.“, 0.20.0 (2000), Emulator mit den Werten des S24, Haushalt Mia, Jonas, Elif |
| `start_schnellzugriff_01` (Erste Schritte, „Schneller starten“) | Symbol mit dem Wagen | neues Symbol, Play-Fassung 0.20.0 am S24, Menü „Scannen“, „Liste“ |

`tools/sogehts_fotos.py` hat dabei wie in AP-88 auch `scanner_ean_03` und `scanner_scannen_01` neu kodiert; beide
sofort zurückgesetzt. In `src/daten/sogehts_fotos.json` geändert: `zeigt` und `aufnahme` der Startseite,
`aufnahme` des Menüs.

Prüfungen: `npm run build` (976 Dateien, keine Preisaussage), `npm run pruefen` (`tools/pruefe_seiten.mjs`): bestanden;
`Material/texte_pruefen.py`: bestanden (Bildbeschreibung geändert). Bau gegen live: 970 von 976 gleich, anders nur die
vier Bilddateien und `/so-gehts/`, `/so-gehts/erste-schritte/` (Bildbeschreibung). Vorschau alt neben neu (Handy 390,
Laptop 1366): `Material/Projektleitung/AP-89_vorschau/`, Konsole ohne Fehler, beide Bilder 200.
