// Lässt Lighthouse über Seiten der lokalen Vorschau laufen, je als Handy und als Desktop, und schreibt die vier
// Bereiche als Tabelle. Lighthouse kommt über npx (keine Abhängigkeit des Projekts); Chrome ist das lokal
// installierte. Aufruf: node tools/lighthouse_lauf.mjs <Zielordner> <Adresse der Vorschau> <Pfad> ...
// (in Git Bash mit MSYS_NO_PATHCONV=1 davor, sonst wird aus dem Pfad "/" ein Ordner von Windows).
//
// Regel (Projektleitung, 11.10.2026, Änderung 3 zum Nachtrag zu AP-23): Leistung, Bedienungshilfen und Best Practices
// brauchen mindestens 95. Liegt bei der Leistung ein Wert unter 95, folgen zwei weitere Läufe ohne Nebenlast; es
// zählt der mittlere der drei Werte, und alle drei stehen in der Ausgabe. Die Leistung schwankt mit der Last des
// Rechners: Während der Messung läuft nichts anderes, auch nicht direkt davor (npm run nachweise). SEO braucht 100,
// aber nur auf Seiten im Index; auf einer Seite mit noindex zählt der Bereich nicht.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromePfad } from './chrome.mjs';

const [ziel, vorschau, ...pfade] = process.argv.slice(2);
mkdirSync(ziel, { recursive: true });
const BEREICHE = ['performance', 'accessibility', 'best-practices', 'seo'];
const MINDESTENS = 95;
const SEO_IM_INDEX = 100;
const LAEUFE = 3;

function lauf(pfad, geraet, datei) {
  const werte = [
    'lighthouse', vorschau + pfad, '--quiet', '--output=json', `--output-path=${datei}`,
    `--only-categories=${BEREICHE.join(',')}`, '--chrome-flags=--headless=new',
    ...(geraet === 'Desktop' ? ['--preset=desktop'] : []),
  ];
  execFileSync('npx', ['--yes', ...werte], { stdio: ['ignore', 'ignore', 'inherit'], shell: true, env: { ...process.env, CHROME_PATH: chromePfad() } });
  return JSON.parse(readFileSync(datei, 'utf8'));
}
const punkteVon = (bericht) => BEREICHE.map((bereich) => Math.round((bericht.categories[bereich]?.score ?? 0) * 100));
const mittlerer = (werte) => [...werte].sort((a, b) => a - b)[Math.floor(werte.length / 2)];

const zeilen = ['Seite | Gerät | Leistung | Bedienungshilfen | Best Practices | SEO | LCP | CLS', '---|---|---|---|---|---|---|---'];
let schwach = 0;
let fassung = '';
for (const pfad of pfade) {
  for (const geraet of ['Handy', 'Desktop']) {
    const name = `${pfad.replace(/^\/|\/$/g, '').replace(/[/.]/g, '_') || 'start'}_${geraet.toLowerCase()}`;
    const bericht = lauf(pfad, geraet, join(ziel, `${name}.json`));
    fassung = bericht.lighthouseVersion ?? fassung;
    const [leistung, hilfen, praxis, seo] = punkteVon(bericht);
    // Leistung unter der Schwelle: zwei weitere Läufe, es zählt der mittlere der drei Werte.
    const leistungen = [leistung];
    if (leistung < MINDESTENS) {
      for (let nummer = 2; nummer <= LAEUFE; nummer++) leistungen.push(punkteVon(lauf(pfad, geraet, join(ziel, `${name}_lauf${nummer}.json`)))[0]);
    }
    const gewertet = mittlerer(leistungen);
    // Eine Seite mit noindex meldet Lighthouse als "nicht crawlbar"; dort zählt SEO nicht.
    const imIndex = bericht.audits['is-crawlable']?.score !== 0;
    const befunde = [
      gewertet < MINDESTENS && `Leistung ${gewertet}`,
      hilfen < MINDESTENS && `Bedienungshilfen ${hilfen}`,
      praxis < MINDESTENS && `Best Practices ${praxis}`,
      imIndex && seo < SEO_IM_INDEX && `SEO ${seo}`,
    ].filter(Boolean);
    if (befunde.length) schwach++;
    const lcp = bericht.audits['largest-contentful-paint']?.displayValue ?? '';
    const cls = bericht.audits['cumulative-layout-shift']?.displayValue ?? '';
    const leistungText = leistungen.length > 1 ? `${gewertet} (Läufe ${leistungen.join(', ')}; es zählt der mittlere)` : String(leistung);
    const seoText = imIndex ? String(seo) : `${seo} (noindex, zählt nicht)`;
    zeilen.push(`${pfad} | ${geraet} | ${leistungText} | ${hilfen} | ${praxis} | ${seoText} | ${lcp} | ${cls}`);
    console.log(zeilen.at(-1));
    if (befunde.length) {
      zeilen.push(`  unter der Schwelle: ${befunde.join(', ')}`);
      console.log(zeilen.at(-1));
    }
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
zeilen.push('', `Lighthouse ${fassung}; Seiten und Geräte unter der Schwelle (Leistung, Bedienungshilfen, Best Practices mindestens ${MINDESTENS}; SEO ${SEO_IM_INDEX} auf Seiten im Index): ${schwach}`);
writeFileSync(join(ziel, 'lighthouse.md'), zeilen.join('\n') + '\n', 'utf8');
console.log(zeilen.at(-1));
process.exit(schwach === 0 ? 0 : 1);
