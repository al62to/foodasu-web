// Tag der letzten Änderung einer Seite für sitemap.xml (AP-22): das Git-Datum ihrer Quelldateien. Eine Seite nennt
// hier die Dateien, aus denen ihr Inhalt kommt; es zählt der jüngste Commit, der eine davon geändert hat. Gestaltung,
// die alle Seiten gleich betrifft (Grundlayout, Kopf, Fuß, Stile), zählt nicht: Sonst hätte jede Seite denselben Tag.
// Eine Datei mit Änderungen, die noch in keinem Commit stehen, zählt mit dem heutigen Tag (lokale Vorschau).
// Der Bau braucht dafür die ganze Git-Geschichte: Der Workflow holt sie mit "fetch-depth: 0". Fehlt sie, bricht der
// Bau ab, statt jeder Seite den Tag des letzten Commits zu geben.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const WURZEL = process.cwd();
const git = (...werte) => execFileSync('git', werte, { cwd: WURZEL, encoding: 'utf8' }).trim();

// Feste Seiten. Rezept-, Themen- und Kapitelseiten nennen ihre Quellen über die Funktionen darunter.
export const QUELLEN = {
  '/': ['src/pages/index.astro', 'src/daten/startseite.mjs', 'src/daten/fragen.mjs'],
  '/so-gehts/': ['src/pages/so-gehts/index.astro', 'src/daten/sogehts.mjs'],
  '/rezepte/': ['src/pages/rezepte/index.astro', 'src/daten/rezepte.json', 'src/daten/auswahl.mjs'],
  '/fragen/': ['src/pages/fragen/index.astro', 'src/daten/fragen.mjs'],
  '/daten-und-quellen/': ['src/pages/daten-und-quellen/index.astro', 'src/daten/datenquellen.mjs'],
  '/datenschutz.html': ['src/pages/datenschutz.astro', 'src/inhalte/datenschutz.html'],
  '/lizenzen/': ['src/pages/lizenzen/index.astro', 'src/daten/lizenzen.mjs'],
};
const REZEPT = ['src/daten/rezepte.json', 'src/daten/rezeptseiten.mjs', 'src/components/Rezeptseite.astro'];
const THEMA = ['src/daten/rezepte.json', 'src/daten/auswahl.mjs', 'src/daten/rezeptseiten.mjs', 'src/daten/themen_texte.mjs', 'src/components/Themenseite.astro'];
const KAPITEL = (slug) => [`src/daten/anleitung/${slug}.mjs`, 'src/pages/so-gehts/[kapitel]/index.astro'];

export function quellenVon(pfad) {
  if (QUELLEN[pfad]) return QUELLEN[pfad];
  const kapitel = pfad.match(/^\/so-gehts\/([a-z0-9-]+)\/$/);
  if (kapitel) return KAPITEL(kapitel[1]);
  if (/^\/rezepte\/[a-z0-9-]+\/$/.test(pfad) && !/^\/rezepte\/(ohne-[a-z]+|vegetarisch|vegan)\/$/.test(pfad)) return REZEPT;
  if (pfad.startsWith('/rezepte/')) return THEMA;
  throw new Error(`Stand: Quellen fehlen für ${pfad} (src/daten/stand.mjs)`);
}

let geprueft = false;
const jeDatei = new Map();
function tagVon(datei) {
  if (jeDatei.has(datei)) return jeDatei.get(datei);
  if (!geprueft) {
    if (git('rev-parse', '--is-shallow-repository') === 'true') throw new Error('Stand: Die Git-Geschichte ist unvollständig (im Workflow "fetch-depth: 0" setzen)');
    geprueft = true;
  }
  if (!existsSync(join(WURZEL, datei))) throw new Error(`Stand: Quelldatei fehlt: ${datei}`);
  const heute = new Date().toLocaleDateString('sv-SE');
  const offen = git('status', '--porcelain', '--', datei) !== '';
  const tag = offen ? heute : git('log', '-1', '--format=%cs', '--', datei);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tag)) throw new Error(`Stand: kein Git-Datum für ${datei}`);
  jeDatei.set(datei, tag);
  return tag;
}

// Tag der letzten Änderung einer Seite, als JJJJ-MM-TT.
export const standVon = (pfad) => quellenVon(pfad).map(tagVon).sort().at(-1);
