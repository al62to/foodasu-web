// Setzt in den gebauten Seiten um jeden Begriff aus src/daten/sprachen.mjs ein <span lang="...">. Läuft am Ende des
// Baus (astro.config.mjs). Angefasst wird nur sichtbarer Text: keine Attribute, kein <title>, kein Skript, kein Stil,
// und nichts, was schon in einem Element mit lang-Attribut steht.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { begriffe } from '../src/daten/sprachen.mjs';

const OHNE = new Set(['script', 'style', 'title', 'textarea', 'option', 'svg']);
const maskiert = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const kodiert = (text) => text.replace(/&/g, '&amp;').replace(/'/g, '(?:\'|&#39;|&#x27;|&apos;)');
// Im HTML steht ein Apostroph auch als Zeichenfolge; der Ausdruck nimmt beide Schreibweisen.
const quelle = begriffe.map(({ text }) => kodiert(maskiert(text))).join('|');
export const AUSDRUCK = new RegExp(`(?<![\\p{L}\\p{N}])(?:${quelle})(?![\\p{L}\\p{N}])`, 'gu');
const klar = (fund) => fund.replace(/&#39;|&#x27;|&apos;/g, "'").replace(/&amp;/g, '&');
const sprache = new Map(begriffe.map(({ text, lang }) => [text, lang]));

// Zerlegt HTML in Marken und Text und ruft "beiText" für jeden sichtbaren Textteil außerhalb eines lang-Elements.
export function durchlaufe(html, beiText) {
  const teile = html.split(/(<!--[\s\S]*?-->|<[^>]+>)/);
  const stapel = [];
  let gesperrt = 0;
  for (let nummer = 0; nummer < teile.length; nummer++) {
    const teil = teile[nummer];
    if (nummer % 2 === 1) {
      const marke = teil.match(/^<(\/?)([a-zA-Z][\w-]*)/);
      if (!marke || /\/>$/.test(teil)) continue;
      const name = marke[2].toLowerCase();
      if (/^(meta|link|img|br|hr|input|source|path|circle|rect)$/.test(name)) continue;
      if (marke[1]) {
        const offen = stapel.pop();
        if (offen?.sperrt) gesperrt--;
      } else {
        const sperrt = OHNE.has(name) || (name !== 'html' && /\slang="/.test(teil));
        stapel.push({ name, sperrt });
        if (sperrt) gesperrt++;
      }
    } else if (teil && gesperrt === 0) {
      teile[nummer] = beiText(teil) ?? teil;
    }
  }
  return teile.join('');
}

export function setzeSprachen(ordner) {
  let seiten = 0;
  let stellen = 0;
  (function lauf(pfad) {
    for (const name of readdirSync(pfad)) {
      const datei = join(pfad, name);
      if (statSync(datei).isDirectory()) lauf(datei);
      else if (datei.endsWith('.html')) {
        const html = readFileSync(datei, 'utf8');
        const neu = durchlaufe(html, (text) =>
          text.replace(AUSDRUCK, (fund) => {
            stellen++;
            return `<span lang="${sprache.get(klar(fund))}">${fund}</span>`;
          })
        );
        if (neu !== html) writeFileSync(datei, neu);
        seiten++;
      }
    }
  })(ordner);
  return { seiten, stellen };
}
