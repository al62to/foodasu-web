// Vorschau für die Projektleitung vor einer Veröffentlichung von "So geht's" (AP-19 Teil G): schreibt alle Texte des
// Bereichs und des Abschnitts "FoodAsu im Bild" der Startseite in eine Datei und daneben die Liste der Bilder je Seite
// (für die Kontaktbögen, tools/sogehts_vorschau.py). Nichts davon geht ins Repository; das Ziel liegt in foodasu-play.
// Aufruf: node tools/sogehts_vorschau.mjs <Zielordner>, danach python tools/sogehts_vorschau.py <Zielordner>
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fotosVon, kapitel } from '../src/daten/sogehts.mjs';
import { einblick } from '../src/daten/startseite.mjs';

const ziel = process.argv[2];
if (!ziel) { console.error('Zielordner fehlt'); process.exit(1); }
mkdirSync(ziel, { recursive: true });
const sogehtsDatei = join(ziel, '_sogehts.md');
const startDatei = join(ziel, '_start.md');
execFileSync(process.execPath, ['tools/texte_sogehts.mjs', sogehtsDatei], { stdio: 'ignore' });
execFileSync(process.execPath, ['tools/texte_ausgeben.mjs', startDatei], { stdio: 'ignore' });
const sogehts = readFileSync(sogehtsDatei, 'utf8');
const start = readFileSync(startDatei, 'utf8');
const von = start.indexOf('## Abschnitt 4b:');
const bis = start.indexOf('## Abschnitt 5:');
if (von < 0 || bis < von) throw new Error('Abschnitt 4b der Startseite nicht gefunden');

const tag = new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
const text = [
  `# Vorschau AP-19 Teil G: neue „So geht's“ und Abschnitt der Startseite (${tag})`,
  '',
  'Diese Datei enthält alle Texte, die mit Teil G neu oder geändert auf foodasu.com kämen. Die Kontaktbögen im selben Ordner zeigen die verwendeten Bilder in der Reihenfolge der Seiten, mit dem Dateinamen unter jedem Bild.',
  '',
  "Inhalt: Teil 1 die Startseite, neuer Abschnitt „FoodAsu im Bild“; Teil 2 „So geht's“, Übersicht und alle Kapitel.",
  '',
  '# Teil 1: Startseite, neuer Abschnitt (zwischen „Funktionen“ und „Die App in Zahlen“)',
  '',
  start.slice(von, bis).replace(/^## Abschnitt 4b: FoodAsu im Bild.*$/m, '## Abschnitt „FoodAsu im Bild“').trimEnd(),
  '',
  "# Teil 2: „So geht's“",
  '',
  sogehts.split('\n').slice(1).join('\n').trimStart(),
].join('\n');
writeFileSync(join(ziel, 'Vorschau_Texte.md'), text, 'utf8');

const liste = kapitel.map((eintrag) => ({ slug: eintrag.slug, titel: eintrag.titel, nummer: eintrag.nummer, fotos: fotosVon(eintrag).map((foto) => ({ datei: foto.datei, unterschrift: foto.unterschrift })) }));
liste.push({ slug: 'startseite', titel: 'Startseite, Abschnitt „FoodAsu im Bild“', nummer: 0, fotos: einblick.karten.map((karte) => ({ datei: karte.datei, unterschrift: karte.titel })) });
writeFileSync(join(ziel, '_fotos.json'), JSON.stringify(liste, null, 1), 'utf8');
rmSync(sogehtsDatei);
rmSync(startDatei);
console.log(`Vorschau_Texte.md: ${text.split('\n').length} Zeilen; Bilder: ${liste.map((eintrag) => `${eintrag.slug} ${eintrag.fotos.length}`).join(', ')}`);
