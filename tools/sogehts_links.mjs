// Sperre gegen Links nach außen in "So geht's" (Ali und Projektleitung, 11.10.2026; AP-27 Teil B): Keine Seite unter
// /so-gehts/ führt auf eine andere Domain als foodasu.com. Erlaubt sind relative Links, Anker und absolute Links auf
// https://foodasu.com/. Die Prüfung läuft am Ende des Baus (astro.config.mjs) über die fertigen Seiten und bricht ihn
// bei einem Fund ab; die Meldung nennt Seite und Link. "npm run pruefen" meldet dieselben Funde.
// Allein: node tools/sogehts_links.mjs [Ordner des Baus]
//
// Geprüft wird jedes href an a und area, vom Anfang der Seite bis zum Ende des Inhalts: Menü, Brotkrumen, Kapitel.
// Die Fußzeile der Website steht auf jeder Seite gleich. Dort sind nur die Auftritte und die Adresse bei Google Play
// aus src/daten/seite.mjs und der Link "Kontakt" erlaubt; jeder andere Link nach außen ist auch dort ein Fund.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { auftritte, seite, store, storeLink } from '../src/daten/seite.mjs';

const BEREICH = 'so-gehts';
const EIGEN = seite.adresse;
const ZEICHEN = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
// Im HTML steht eine Adresse auch als Folge von Zeichen-Entitäten (so der Link "Kontakt").
const klar = (text) => text
  .replace(/&#x([0-9a-f]+);/gi, (_, zahl) => String.fromCodePoint(parseInt(zahl, 16)))
  .replace(/&#(\d+);/g, (_, zahl) => String.fromCodePoint(Number(zahl)))
  .replace(/&(amp|quot|apos|lt|gt);/g, (_, name) => ZEICHEN[name]);

const KONTAKT = klar(readFileSync(fileURLToPath(new URL('../src/inhalte/kontakt.html', import.meta.url)), 'utf8').trim());
const IM_FUSS = new Set([auftritte.facebook, auftritte.instagram, store.adresse, storeLink('fuss'), KONTAKT].filter(Boolean));

// Ein Link bleibt auf foodasu.com, wenn er ein Anker, ein relativer Link oder eine Adresse unter https://foodasu.com/
// ist. Alles mit einem anderen Schema oder einer anderen Domain führt hinaus, auch "//domain" ohne Schema.
export function bleibtAufDerSeite(ziel) {
  const adresse = ziel.trim();
  if (adresse === '' || adresse.startsWith('#')) return true;
  if (adresse === EIGEN || adresse.startsWith(`${EIGEN}/`) || adresse.startsWith(`${EIGEN}#`) || adresse.startsWith(`${EIGEN}?`)) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(adresse)) return false;
  if (/^[/\\]{2}/.test(adresse)) return false;
  return true;
}

// Alle Links einer Seite in der Reihenfolge des Quelltexts, mit der Angabe, ob sie in der Fußzeile stehen.
function linksVon(html) {
  const ende = html.lastIndexOf('</main>');
  const links = [];
  for (const marke of html.matchAll(/<(?:a|area)\b[^>]*>/gi)) {
    const wert = marke[0].match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!wert) continue;
    links.push({ ziel: klar(wert[1] ?? wert[2] ?? wert[3]), imFuss: ende >= 0 && marke.index > ende });
  }
  return { links, mitInhalt: ende >= 0 };
}

function seitenIn(ordner) {
  const dateien = [];
  (function lauf(pfad) {
    for (const name of readdirSync(pfad)) {
      const datei = join(pfad, name);
      if (statSync(datei).isDirectory()) lauf(datei);
      else if (datei.endsWith('.html')) dateien.push(datei);
    }
  })(ordner);
  return dateien.sort();
}

// Liefert die Zahl der geprüften Seiten und die Funde als { seite, link, ort }.
export function sogehtsLinks(bau = 'dist') {
  const ordner = join(bau, BEREICH);
  const funde = [];
  if (!existsSync(ordner)) return { seiten: 0, funde };
  const dateien = seitenIn(ordner);
  for (const datei of dateien) {
    const adresse = `/${relative(bau, datei).split(sep).join('/')}`.replace(/index\.html$/, '');
    const { links, mitInhalt } = linksVon(readFileSync(datei, 'utf8'));
    if (!mitInhalt) funde.push({ seite: adresse, link: '(kein </main> gefunden, Aufbau der Seite nicht erkannt)', ort: 'Seite' });
    for (const { ziel, imFuss } of links) {
      if (bleibtAufDerSeite(ziel)) continue;
      if (imFuss && IM_FUSS.has(ziel)) continue;
      funde.push({ seite: adresse, link: ziel, ort: imFuss ? 'Fußzeile' : 'Seite' });
    }
  }
  return { seiten: dateien.length, funde };
}

// Bricht mit einer Meldung ab, die jede Seite und jeden Link nennt. Ohne Fund kommt die Zahl der Seiten zurück.
export function pruefeSogehtsLinks(bau = 'dist') {
  const { seiten, funde } = sogehtsLinks(bau);
  if (seiten === 0) throw new Error(`So geht's: keine Seite unter ${join(bau, BEREICH)} gefunden, die Sperre gegen Links nach außen hat nichts geprüft`);
  if (funde.length) {
    const zeilen = funde.map(({ seite: ort, link, ort: wo }) => `- ${ort}: ${link}${wo === 'Fußzeile' ? ' (in der Fußzeile)' : ''}`);
    throw new Error(`So geht's: Link nach außen. Erlaubt sind relative Links, Anker und Links auf ${EIGEN}/.\n${zeilen.join('\n')}`);
  }
  return seiten;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const seiten = pruefeSogehtsLinks(process.argv[2] ?? process.env.DIST ?? 'dist');
    console.log(`So geht's: ${seiten} Seiten ohne Link nach außen`);
  } catch (fehler) {
    console.error(fehler.message);
    process.exit(1);
  }
}
