// Übernimmt die veröffentlichten Rechtstexte unverändert aus dem Zweig main (Datenschutzerklärung, Offenlegung,
// Kontaktadresse) als Bausteine nach src/inhalte. Aufruf: node tools/bestand_uebernehmen.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const zeige = (datei) => execFileSync('git', ['show', `main:${datei}`], { encoding: 'utf8' });
const teil = (text, muster, name) => {
  const m = text.match(muster);
  if (!m) throw new Error(`Nicht gefunden: ${name}`);
  return m[1].trim() + '\n';
};

const erklaerung = zeige('datenschutz.html');
const start = zeige('index.html');
writeFileSync('src/inhalte/datenschutz.html', teil(erklaerung, /<main>\r?\n([\s\S]*?)<\/main>/, 'Datenschutzerklärung'));
writeFileSync('src/inhalte/offenlegung.html', teil(start, /(<h2 id="offenlegung">[\s\S]*?)<\/main>/, 'Offenlegung'));
writeFileSync('src/inhalte/kontakt.html', teil(start, /Fragen oder Feedback: <a href="([^"]+)">/, 'Kontaktadresse'));
writeFileSync('src/inhalte/logo.svg', teil(start, /<a class="marke"[^>]*>(<svg[\s\S]*?<\/svg>)<\/a>/, 'Logo'));
console.log('Bausteine geschrieben: datenschutz.html, offenlegung.html, kontakt.html, logo.svg');
