# AP-56w: Website – rechtliche Seiten auf noindex

Auftrag der Projektleitung vom 29.10.2026 auf Alis Wunsch, Alis Ja zur Veröffentlichung mit dem Abschicken. Gearbeitet nur
in `foodasu-web` (Zweig `ap-56w` von `main` `8e749d4`). Wortlaut der Rechtstexte, Design, Layout, Animationen, App,
Store-Eintrag, Play Console und `einkauf-app` nicht angefasst. Keine Unteragenten.

**Stand 29.10.2026, 21:19 Uhr: ONLINE.** `main` `45f7368` (Vorspulen von `ap-56w`, ein Commit), Push 21:16 Uhr, GitHub-Lauf
40947581108 erfolgreich (fertig 21:17 Uhr). Live 970 von 970 Dateien gleich dem Bau (ohne `CNAME`; Textdateien ohne den
Unterschied der Zeilenenden verglichen, lokal CRLF wegen `core.autocrlf`).

## Für Ali

- **Seit 29.10.2026, 21:17 Uhr, tragen alle fünf Seiten mit Rechtstext „noindex“:** Datenschutzerklärung
  (`/datenschutz.html`), Nutzungsbedingungen (`/nutzungsbedingungen.html`), Lizenzen (`/lizenzen/`), Offenlegung
  (`/offenlegung/`, schon seit AP-17) und Quellen und Lizenzen der Rezepte (`/quellen-und-lizenzen/`, schon seit 09.10.2026).
  Neu sind also die ersten drei.
- Die Seiten bleiben erreichbar und sind im Fuß jeder Seite verlinkt wie bisher; der Link zur Datenschutzerklärung im
  Play-Store-Eintrag funktioniert unverändert.
- **In der Search Console für diese Seiten keine Indexierung mehr beantragen.** Google nimmt sie beim nächsten Besuch von
  selbst aus dem Index; das kann einige Tage bis Wochen dauern. Die Seitenberichte zeigen sie danach unter „Durch
  ‚noindex‘-Tag ausgeschlossen“; das ist so gewollt und kein Fehler.

## 1. Rechtliche Seiten der Website (Punkt 1)

| Seite | Adresse | vorher | jetzt |
|---|---|---|---|
| Datenschutzerklärung (2.0.6) | `/datenschutz.html` | im Index, Sitemap, `llms.txt` | noindex, nicht in Sitemap und `llms.txt` |
| Nutzungsbedingungen (1.0.1) | `/nutzungsbedingungen.html` | im Index, Sitemap, `llms.txt` | noindex, nicht in Sitemap und `llms.txt` |
| Lizenzen | `/lizenzen/` | im Index, Sitemap, `llms.txt` | noindex, nicht in Sitemap und `llms.txt` |
| Offenlegung nach § 25 Mediengesetz | `/offenlegung/` | schon noindex | unverändert |
| Quellen und Lizenzen der Rezepte | `/quellen-und-lizenzen/` | schon noindex | unverändert |

- **Englische Fassungen:** keine; die Website ist nur deutsch.
- **Ältere Fassungen oder Archive:** keine auf der Website. Jede Rechtsseite steht unter genau einer Adresse.
- **Ein Impressum** als eigene Seite gibt es nicht; die Offenlegung erfüllt diese Aufgabe.
- **Keine Rechtsseiten, im Index geblieben:** Startseite, „So geht's“, Fragen, Über FoodAsu, Daten und Quellen (erklärt die
  Herkunft der Angaben, ohne Rechtstext; verlinkt auf Lizenzen, Quellen und Lizenzen und Datenschutzerklärung), Rezepte.
  Eine eigene Kontaktseite hat die Website nicht (die Kontaktadresse steht verschlüsselt im Fuß).

## 2. Umsetzung (Punkte 2 bis 4)

- `src/daten/meta.mjs`: `OHNE_INDEX` um `/datenschutz.html`, `/nutzungsbedingungen.html` und `/lizenzen/` ergänzt. Daraus
  entstehen `<meta name="robots" content="noindex, follow">` im Kopf (`src/layouts/Basis.astro`, wie bei den übrigen
  Seiten mit noindex), die Sitemap (nur Seiten im Index) und die Kontrolle in `llms.txt`.
- `src/pages/llms.txt.js`: Abschnitt „Rechtliches“ mit den drei Links entfernt.
- **Canonical bleibt** auf jeder Seite (die eigene Adresse). **`robots.txt` unverändert**, sperrt nichts (keine
  `Disallow`-Zeile), damit Google das noindex sieht. **Links im Fuß und überall sonst unverändert.**
- `tools/pruefe_seiten.mjs` (Prüfung im Bau) nachgezogen: `OHNE_INDEX` mit denselben fünf Seiten; `llms.txt` muss die
  Datenschutzerklärung und die Nutzungsbedingungen nicht mehr nennen; `dateModified` der Nutzungsbedingungen (strukturierte
  Daten, unverändert) wird nicht mehr mit dem `lastmod` der Sitemap verglichen, die die Seite nicht mehr enthält, sondern
  muss ein Tag sein, der nicht in der Zukunft liegt.
- Wirkung im Bau gegen den Stand vor der Änderung: von 971 Dateien sind 966 gleich. Anders sind nur die drei Seiten (je
  genau eine neue Zeile, das noindex), `sitemap.xml` (102 → 99 Einträge, die drei fehlen) und `llms.txt` (ohne Abschnitt
  „Rechtliches“).

## 3. Rechtstexte als Datei (Punkt 5, nur gemeldet)

Auf der Website liegt kein Rechtstext als PDF oder andere Datei. Außerhalb der Website liegen die Quelltexte und alle
früheren Fassungen als Markdown in `foodasu-play` (u. a. `Datenschutzerklaerung.md` und die Fassungen 1.1 bis 2.0.5,
`Datenschutzerklaerung_2_0_Englisch_Kurzfassung.md`, `Nutzungsbedingungen.md` und 1.0, `Offenlegung_Mediengesetz_Entwurf.md`,
Unterordner `datenschutz`). Diese Dateien sind nicht veröffentlicht. Nichts geändert.

## 4. Prüfungen (Punkt 6)

Umfang wie bei einer kleinen Änderung, weil sich nur die Robots-Angabe von drei Seiten, die Sitemap und `llms.txt` ändern
und kein Text, keine Gestaltung und kein Link:

- `npm run build`: bestanden.
- `npm run pruefen`: bestanden; 99 von 116 Seiten im Index (vorher 102). **Gegenprobe:** noindex in `dist/lizenzen/` von
  Hand entfernt → „FEHLER /lizenzen/: Robots-Angabe "noindex, follow" erwartet“, danach Datei zurückgesetzt.
- Wortprüfung `foodasu-play/texte_pruefen.py`: bestanden.
- Eigene Prüfung am fertigen Bau (Skript außerhalb des Repositorys): je Rechtsseite genau ein
  `noindex, follow` im Kopf und Canonical auf die eigene Adresse; Sitemap (99 Einträge) und `llms.txt` ohne Rechtsseiten;
  `robots.txt` ohne Sperre; von 120 HTML-Dateien tragen 21 noindex (5 Rechtsseiten, 11 kleine Themenseiten, 404, 4
  Kurzlinks) und genau die übrigen 99 stehen in der Sitemap, keine Abweichung; auf allen 116 Seiten mit Fuß stehen die
  Links zu Datenschutz, Nutzungsbedingungen, Offenlegung, Lizenzen und Quellen und Lizenzen, alle Ziele im Bau vorhanden.
- `geschichte_pruefen.py` für `ap-56w` und `main`: bestanden.
- Nicht gelaufen: Nachweise im Browser, Lighthouse, Linkprüfung nach außen. Gestaltung und Links sind unverändert (im Bau
  nachgewiesen: nur die eine Zeile im Kopf ist neu); Lighthouse wertet Seiten mit noindex für SEO nicht.

## 5. Veröffentlichung und Prüfung live

`main` `8e749d4` → `45f7368` (`git merge --ff-only ap-56w`, kein Force-Push), Push 21:16 Uhr, Lauf 40947581108 erfolgreich.
Live (21:18 bis 21:19 Uhr, Abruf mit Parameter gegen Zwischenspeicher):

| Seite | Status | noindex im Kopf | Canonical |
|---|---|---|---|
| `/datenschutz.html` | 200 | 1× | `https://foodasu.com/datenschutz.html` |
| `/nutzungsbedingungen.html` | 200 | 1× | `https://foodasu.com/nutzungsbedingungen.html` |
| `/lizenzen/` | 200 | 1× | `https://foodasu.com/lizenzen/` |
| `/offenlegung/` | 200 | 1× | `https://foodasu.com/offenlegung/` |
| `/quellen-und-lizenzen/` | 200 | 1× | `https://foodasu.com/quellen-und-lizenzen/` |

`sitemap.xml` live 99 Einträge ohne Rechtsseiten, `llms.txt` live ohne Rechtsseiten, `robots.txt` live ohne Sperre; alle
970 Dateien live gleich dem Bau.

## 6. Offene Entscheidungen

Keine.

## Für einkauf-app\CLAUDE.md

AP-56w (Website, 29.10.2026, ONLINE seit 21:17 Uhr, `foodasu-web` `main` `45f7368`): Alle Seiten mit Rechtstext tragen
noindex (`/datenschutz.html`, `/nutzungsbedingungen.html`, `/lizenzen/` neu; `/offenlegung/`, `/quellen-und-lizenzen/` wie
bisher), fehlen in Sitemap (jetzt 99) und `llms.txt`, bleiben erreichbar und im Fuß verlinkt; Canonical und `robots.txt`
unverändert. Quelle `OHNE_INDEX` in `src/daten/meta.mjs`, Prüfung `OHNE_INDEX` in `tools/pruefe_seiten.mjs`;
`dateModified` der Nutzungsbedingungen wird nicht mehr mit der Sitemap verglichen. Ali beantragt für diese Seiten keine
Indexierung mehr. Live-Skripte, die 102 Seiten im Index erwarten, erwarten jetzt 99. Bericht
`foodasu-web/docs/berichte/AP-56w_Bericht.md`.
