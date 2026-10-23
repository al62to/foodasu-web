// Übernimmt die Rechtstexte als Bausteine nach src/inhalte: Datenschutzerklärung, Offenlegung, Kontaktadresse und seit
// AP-35A (23.10.2026) die Nutzungsbedingungen.
// Die Quelltexte (mit Platzhaltern für Wohngemeinde und Kontaktadresse) liegen außerhalb dieses Repositorys; gebaut
// werden sie dort mit website_bauen.py in einen Vorschau-Ordner:
//   python website_bauen.py --ziel <Ordner> --teil-b --offenlegung --auftritte --stand "<Tag der Veröffentlichung>"
//                           --nutzungsbedingungen --nb-stand "<Stand der Nutzungsbedingungen>"
// --stand ist das Datum der Datenschutzerklärung, --nb-stand das der Nutzungsbedingungen; jedes bleibt, bis sich sein
// Text ändert. Fehlt nutzungsbedingungen.html im Ordner, bricht das Skript ab.
// Aufruf hier: node tools/rechtstexte_uebernehmen.mjs <Ordner>
// Der Wortlaut wird nicht verändert; das Skript schneidet nur die Teile aus den drei gebauten Seiten.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ordner = process.argv[2];
if (!ordner) throw new Error('Aufruf: node tools/rechtstexte_uebernehmen.mjs <Vorschau-Ordner von website_bauen.py>');
const lies = (datei) => readFileSync(join(ordner, datei), 'utf8');
const teil = (text, muster, name) => {
  const m = text.match(muster);
  if (!m) throw new Error(`Nicht gefunden: ${name}`);
  return m[1].trim() + '\n';
};

const erklaerung = teil(lies('datenschutz.html'), /<main>\r?\n([\s\S]*?)<\/main>/, 'Datenschutzerklärung');
const bedingungen = teil(lies('nutzungsbedingungen.html'), /<main>\r?\n([\s\S]*?)<\/main>/, 'Nutzungsbedingungen');
const start = lies('index.html');
const offenlegung = teil(start, /(<h2 id="offenlegung">[\s\S]*?)<\/main>/, 'Offenlegung');
for (const [name, text] of [['Datenschutzerklärung', erklaerung], ['Nutzungsbedingungen', bedingungen], ['Offenlegung', offenlegung]]) {
  if (/\{\{[A-Z_]+\}\}|\[Wohngemeinde\]/.test(text)) throw new Error(`${name}: offener Platzhalter`);
}
writeFileSync('src/inhalte/datenschutz.html', erklaerung);
writeFileSync('src/inhalte/nutzungsbedingungen.html', bedingungen);
writeFileSync('src/inhalte/offenlegung.html', offenlegung);
writeFileSync('src/inhalte/kontakt.html', teil(start, /Fragen oder Feedback: <a href="([^"]+)">/, 'Kontaktadresse'));
const fassung = erklaerung.match(/Version ([\d.]+) · Stand: ([^<]+)</);
const stand = bedingungen.match(/<p>Stand: ([^<]+)<\/p>/);
console.log(`Bausteine geschrieben: datenschutz.html (Version ${fassung?.[1]}, Stand ${fassung?.[2]}), nutzungsbedingungen.html (Stand ${stand?.[1]}), offenlegung.html, kontakt.html`);
