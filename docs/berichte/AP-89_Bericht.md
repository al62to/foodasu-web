# AP-89: Zwei Bilder in „So geht's“ (Website-Teil)

Ausführlicher Bericht im App-Repository: `docs/berichte/AP-89_Bericht.md` (Zweig `ap-89`), Etappen im
`docs/berichte/AP-89_Zwischenstand.md` hier.

- **Live seit 04.11.2026, 11:44 Uhr**, `main` `83a3a8d` (Vorspulen von `ap-89`, Lauf 41816088113): in „Erste Schritte“
  die Bilder „Die Startseite“ (`start_startseite_01`, 0.20.0, Karte „FoodAsu wächst.“ statt Beta-Hinweis; auch Bild
  des Kapitels auf `/so-gehts/`) und „Schneller starten“ (`start_schnellzugriff_01`, neues Symbol, Menü „Scannen“,
  „Liste“). Kein Text der Seiten, kein Design geändert; nur Bildbeschreibung und Aufnahmezeit in
  `src/daten/sogehts_fotos.json`.
- Prüfungen: Bau, `npm run pruefen`, `texte_pruefen.py`, Vorschau der zwei Abschnitte (Handy und Laptop, Konsole ohne
  Fehler), `geschichte_pruefen.py ap-89`; live 976 von 976 Dateien gleich dem Bau, beide Bilder 200.
- Neuindexierung: https://foodasu.com/so-gehts/erste-schritte/, https://foodasu.com/so-gehts/
- `ap-88b` auf den neuen `main` gesetzt, `npm run pruefen` bestanden, lokal.
- Vorschau alt neben neu: `Material/Projektleitung/AP-89_vorschau/`.
