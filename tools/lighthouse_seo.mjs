// Lässt Lighthouse nur mit dem Bereich SEO über alle Seiten der Sitemap laufen (also über jede Seite im Index) und
// schreibt das Ergebnis als Tabelle. Erwartet ist 100 auf jeder Seite (AP-18 Nachtrag Meta); jede andere Zahl steht
// mit der Prüfung, die sie drückt, im Protokoll, und der Lauf endet mit Fehler.
// Lighthouse ist keine Abhängigkeit des Projekts: Geladen wird die Fassung, die npx schon geholt hat (einmal
// "npx --yes lighthouse --version" genügt). Ein einziges Chrome prüft alle Seiten nacheinander.
// Aufruf: node tools/lighthouse_seo.mjs <Zielordner> <Adresse der Vorschau>
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromePfad } from './chrome.mjs';

const [ziel, vorschau] = process.argv.slice(2);
const HOST = 'https://foodasu.com';
mkdirSync(ziel, { recursive: true });

// Ordner node_modules der Lighthouse-Fassung im Zwischenspeicher von npx (die zuletzt geholte).
function lighthouseOrdner() {
  const lager = join(process.env.LOCALAPPDATA ?? join(homedir(), '.npm'), process.env.LOCALAPPDATA ? 'npm-cache' : '', '_npx');
  const finde = () => (existsSync(lager) ? readdirSync(lager) : [])
    .map((name) => join(lager, name, 'node_modules'))
    .filter((ordner) => existsSync(join(ordner, 'lighthouse', 'core', 'index.js')));
  if (finde().length === 0) execFileSync('npx', ['--yes', 'lighthouse', '--version'], { shell: true, stdio: 'ignore' });
  const ordner = finde().at(-1);
  if (!ordner) throw new Error('Lighthouse nicht gefunden (npx --yes lighthouse --version)');
  return ordner;
}
const module = lighthouseOrdner();
const { default: lighthouse } = await import(pathToFileURL(join(module, 'lighthouse', 'core', 'index.js')).href);
const starter = await import(pathToFileURL(join(module, 'chrome-launcher', 'dist', 'index.js')).href);

const pfade = [...readFileSync(join('dist', 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, ort]) => ort.replace(HOST, ''));
const chrome = await starter.launch({ chromePath: chromePfad(), chromeFlags: ['--headless=new'] });
const ergebnis = new Map();
let version = '';
try {
  for (const pfad of pfade) {
    const pruefe = () => lighthouse(vorschau + pfad, { port: chrome.port, onlyCategories: ['seo'], output: 'json', logLevel: 'error' });
    let lauf = await pruefe();
    // Ein Lauf ohne Ergebnis (Fehler beim Laden der Seite) wird einmal wiederholt.
    if (lauf.lhr.runtimeError || lauf.lhr.categories.seo?.score == null) lauf = await pruefe();
    const bericht = lauf.lhr;
    version = bericht.lighthouseVersion ?? version;
    const punkte = Math.round((bericht.categories.seo?.score ?? 0) * 100);
    const schwach = (bericht.categories.seo?.auditRefs ?? [])
      .map((ref) => bericht.audits[ref.id])
      .filter((pruefung) => pruefung.score !== null && pruefung.score < 1)
      .map((pruefung) => `${pruefung.id} (${pruefung.title})`);
    ergebnis.set(pfad, { punkte, schwach });
    console.log(`${punkte} ${pfad}${schwach.length ? ` ${schwach.join('; ')}` : ''}`);
  }
} finally {
  await chrome.kill();
}

const unter = pfade.filter((pfad) => ergebnis.get(pfad)?.punkte !== 100);
const zeilen = [
  `Lighthouse ${version}, nur der Bereich SEO, Ansicht Handy, über die lokale Vorschau: ${pfade.length} Seiten der Sitemap, davon ${pfade.length - unter.length} mit 100.`,
  '',
  'Seite | SEO | Prüfung unter 100',
  '---|---|---',
  ...pfade.map((pfad) => `${pfad} | ${ergebnis.get(pfad)?.punkte ?? 'kein Ergebnis'} | ${ergebnis.get(pfad)?.schwach.join('; ') ?? ''}`),
  '',
];
writeFileSync(join(ziel, 'lighthouse_seo.md'), zeilen.join('\n'), 'utf8');
console.log(zeilen[0]);
process.exit(unter.length ? 1 : 0);
