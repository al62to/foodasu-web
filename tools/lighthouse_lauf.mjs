// Lässt Lighthouse über Seiten der lokalen Vorschau laufen, je einmal als Handy und als Desktop, und schreibt die
// vier Bereiche als Tabelle. Lighthouse kommt über npx (keine Abhängigkeit des Projekts); Chrome ist das lokal
// installierte. Aufruf: node tools/lighthouse_lauf.mjs <Zielordner> <Adresse der Vorschau> <Pfad> ...
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromePfad } from './chrome.mjs';

const [ziel, vorschau, ...pfade] = process.argv.slice(2);
mkdirSync(ziel, { recursive: true });
const BEREICHE = ['performance', 'accessibility', 'best-practices', 'seo'];
const zeilen = ['Seite | Gerät | Leistung | Bedienungshilfen | Best Practices | SEO | LCP | CLS', '---|---|---|---|---|---|---|---'];
let schwach = 0;
for (const pfad of pfade) {
  for (const geraet of ['Handy', 'Desktop']) {
    const name = `${pfad.replace(/^\/|\/$/g, '').replace(/[/.]/g, '_') || 'start'}_${geraet.toLowerCase()}.json`;
    const datei = join(ziel, name);
    const werte = [
      'lighthouse', vorschau + pfad, '--quiet', '--output=json', `--output-path=${datei}`,
      `--only-categories=${BEREICHE.join(',')}`, '--chrome-flags=--headless=new',
      ...(geraet === 'Desktop' ? ['--preset=desktop'] : []),
    ];
    execFileSync('npx', ['--yes', ...werte], { stdio: ['ignore', 'ignore', 'inherit'], shell: true, env: { ...process.env, CHROME_PATH: chromePfad() } });
    const bericht = JSON.parse(readFileSync(datei, 'utf8'));
    const punkte = BEREICHE.map((bereich) => Math.round((bericht.categories[bereich]?.score ?? 0) * 100));
    if (punkte.some((wert) => wert < 95)) schwach++;
    const lcp = bericht.audits['largest-contentful-paint']?.displayValue ?? '';
    const cls = bericht.audits['cumulative-layout-shift']?.displayValue ?? '';
    zeilen.push(`${pfad} | ${geraet} | ${punkte.join(' | ')} | ${lcp} | ${cls}`);
    console.log(zeilen.at(-1));
    // Was einen Bereich unter 100 drückt, steht mit im Protokoll.
    for (const bereich of BEREICHE) {
      for (const ref of bericht.categories[bereich]?.auditRefs ?? []) {
        const pruefung = bericht.audits[ref.id];
        if (ref.weight > 0 && pruefung.score !== null && pruefung.score < 0.9 && bereich !== 'performance') {
          zeilen.push(`  ${bereich}: ${pruefung.id} (${pruefung.title})`);
          console.log(zeilen.at(-1));
        }
      }
    }
  }
}
zeilen.push('', `Lighthouse ${JSON.parse(readFileSync(join(ziel, 'start_handy.json'), 'utf8')).lighthouseVersion ?? ''}; Läufe mit einem Bereich unter 95: ${schwach}`);
writeFileSync(join(ziel, 'lighthouse.md'), zeilen.join('\n') + '\n', 'utf8');
console.log(zeilen.at(-1));
