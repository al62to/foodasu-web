// Schreibt alle Texte des Bereichs "So geht's" (Übersicht und alle Kapitel) im Wortlaut als eine Datei. Quelle ist
// src/daten/sogehts.mjs; geändert wird dort. Aufruf: node tools/texte_sogehts.mjs [Zieldatei]
import { writeFileSync } from 'node:fs';
import { BEREICH, adresse, fotoDaten, kapitel, rahmen, uebersicht } from '../src/daten/sogehts.mjs';
import { metaVon } from '../src/daten/meta.mjs';

const ziel = process.argv[2] ?? 'C:/Users/ali/foodasu-play/Website_Texte_SoGehts.md';
const z = [];
const zeile = (text = '') => z.push(text);
const punkt = (name, text) => zeile(`- **${name}:** ${text}`);

zeile("# Website foodasu.com: Texte des Bereichs „So geht's“ (AP-19 Teil G)");
zeile();
zeile(`${kapitel.length + 1} Seiten: die Übersicht und ${kapitel.length} Kapitel, eine Seite je Bereich der App, dazu die Seite „Zu Hause schreiben, im Laden abhaken“. Jeder Abschnitt erklärt eine Funktion: der Nutzen in ein bis zwei Sätzen, der kurze Weg in der App und bei den wichtigen Funktionen ein Bildschirmfoto; keine nummerierten Schrittfolgen. Die Begriffe stehen so da, wie sie in der App 0.14.3 heißen; beschrieben ist nur, was die App kann. Geschrieben nach den Wortregeln aus Konzept v4, Abschnitt 1.`);
zeile('Erzeugt aus `foodasu-web/src/daten/sogehts.mjs` und `src/daten/anleitung/` mit `npm run texte`; geändert wird dort, nicht hier. Titel und Beschreibung der Seiten stehen in `src/daten/meta.mjs` (alle Seiten: Website_Meta_Uebersicht.md). Die Wortprüfung läuft über diese Datei (`texte_pruefen.py`) und über die gebauten Seiten (`npm run pruefen`).');
zeile('Hinter jeder Überschrift eines Abschnitts steht sein fester Anker und, wo es eine gibt, die Kennung der Funktion aus `einkauf-app/docs/Funktionsliste.md`. Bei jedem Bild steht der Dateiname aus `foodasu-play/So_gehts_Bilder`, die Unterschrift und die Bildbeschreibung (Alternativtext).');
zeile();

zeile(`## Übersicht (${BEREICH})`);
punkt('Titel der Seite', `${metaVon(BEREICH).titel} (${metaVon(BEREICH).titel.length} Zeichen)`);
punkt('Beschreibung', `${metaVon(BEREICH).beschreibung} (${metaVon(BEREICH).beschreibung.length} Zeichen)`);
punkt('Überschrift', uebersicht.titel);
punkt('Vorspann', uebersicht.vorspann);
kapitel.forEach((eintrag) => punkt(`Kachel ${eintrag.nummer}`, `${eintrag.titel}. ${eintrag.kurz} Link: „${uebersicht.lesen}“`));
punkt('Karte unter den Kacheln', `${uebersicht.hinweis} ${uebersicht.fragen.vor}${uebersicht.fragen.text}${uebersicht.fragen.nach}`);
zeile();

for (const eintrag of kapitel) {
  zeile(`## Kapitel ${eintrag.nummer}: ${eintrag.titel} (${adresse(eintrag)})`);
  const kopfdaten = metaVon(adresse(eintrag));
  punkt('Titel der Seite', `${kopfdaten.titel} (${kopfdaten.titel.length} Zeichen)`);
  punkt('Beschreibung', `${kopfdaten.beschreibung} (${kopfdaten.beschreibung.length} Zeichen)`);
  punkt('Etikett', `${uebersicht.kapitelWort} ${eintrag.nummer} von ${kapitel.length}`);
  punkt('Überschrift', eintrag.titel);
  punkt('Vorspann', eintrag.vorspann);
  zeile();
  for (const teil of eintrag.teile) {
    zeile(`### ${teil.titel} (#${teil.anker}${teil.funktionen ? `; ${teil.funktionen.join(', ')}` : ''})`);
    zeile();
    if (teil.nutzen) { zeile(`**Nutzen:** ${teil.nutzen}`); zeile(); }
    if (teil.wo) { zeile(`**${rahmen.wo}:** ${teil.wo}`); zeile(); }
    if (teil.fotos) {
      teil.fotos.map(fotoDaten).forEach((foto) => zeile(`- **Bild \`${foto.datei}.png\`:** ${foto.unterschrift}. Bildbeschreibung: ${foto.alt}`));
      zeile();
    }
    if (teil.liste) { teil.liste.forEach((eintragListe) => zeile(`- **${eintragListe.name}:** ${eintragListe.text}`)); zeile(); }
    for (const absatz of teil.absaetze ?? []) { zeile(absatz); zeile(); }
    if (teil.verweis) { zeile(`${teil.verweis.vor}[${teil.verweis.text}](${teil.verweis.ziel})${teil.verweis.nach}`); zeile(); }
    if (teil.extern) { zeile(`Link nach außen: „${teil.extern.text}“ (${teil.extern.ziel})`); zeile(); }
  }
  if (eintrag.film) punkt('Schleife (ohne Ton, nur mit Bewegung)', `${eintrag.film.unterschrift}. Bildbeschreibung: ${eintrag.film.alt}`);
  if (eintrag.verweise) punkt(`„${rahmen.mehr}“`, eintrag.verweise.map((verweis) => `${verweis.text} (${verweis.ziel})`).join(', '));
  zeile();
}

zeile('## Texte auf jeder Kapitelseite');
punkt('Inhaltsverzeichnis', rahmen.inhalt);
punkt('Am Ende der Abschnitte', `${rahmen.bild} Name der Spalte mit Bildern für Bildschirmleser: „${rahmen.bilder}“. Bei einer Schleife: „${rahmen.filmHinweis}“`);
punkt('Vor dem Weg in der App', `${rahmen.wo}:`);
punkt('Blättern am Ende', `„${rahmen.zurueck}“, „${rahmen.weiter}“, „${rahmen.uebersicht}“`);
zeile();

writeFileSync(ziel, z.join('\n'), 'utf8');
console.log(`Geschrieben: ${ziel} (${z.length} Zeilen)`);
