// Prüft den JavaScript-Kern der Seite /l/ (src/skripte/teilen/) in Node mit den gemeinsamen Testfällen von App und
// Website (tools/teilen/testfaelle.json, Kopie aus dem App-Repository kern/testdaten/teilen/testfaelle.json, geschrieben
// nur mit tools/teilen/website_exportieren.py der App). Alle Fälle außer der Art "liste" (die gilt nur für den Kern):
// umschlag, lesen, zusammenfuehren, aufraeumen, haekchen, profil; jeder Fall einmal mit DecompressionStream/
// CompressionStream und einmal mit der Rückfall-Bibliothek fflate. Die Prüflogik steht in tools/teilen/pruefung.mjs
// (dieselbe läuft im Browser, tools/teilen_browser.mjs).
// Aufruf: node tools/teilen_pruefen.mjs [--json]  (Rückgabewert 1 bei einem Befund; npm run pruefen ruft es auf)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pruefeTestfaelle as pruefe } from './teilen/pruefung.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (...teile) => JSON.parse(readFileSync(join(wurzel, ...teile), 'utf8'));

export const pruefeTestfaelle = () => pruefe(lies('tools', 'teilen', 'testfaelle.json'), lies('src', 'daten', 'teilen_app.json'));

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { zahlen, befunde, uebersprungen } = await pruefeTestfaelle();
  if (process.argv.includes('--json')) console.log(JSON.stringify({ zahlen, befunde, uebersprungen }));
  else {
    for (const [weg, arten] of Object.entries(zahlen)) {
      if (weg === 'anzeige') { console.log(`Anzeige der Mengen: ${arten} Beispiele`); continue; }
      console.log(`${weg === 'strom' ? 'DecompressionStream' : 'fflate (Rückfall)'}: ${Object.entries(arten).map(([art, [gut, alle]]) => `${art} ${gut}/${alle}`).join(', ')}`);
    }
    console.log(`übersprungen (Arten „liste“ und „uebernehmen“, nur Kern): ${uebersprungen}`);
    for (const befund of befunde) console.log(`BEFUND ${befund}`);
  }
  process.exit(befunde.length ? 1 : 0);
}
