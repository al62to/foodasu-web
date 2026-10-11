// Baut das gemeinsame Bild für Open Graph und die Twitter-Karte (1200 x 630) nach public/bilder/foodasu-teilen.jpg
// (AP-18 Nachtrag Meta): Logo auf Indigo mit Akzenten in Indigo und Lavendel (seit AP-23 ohne Grün, wie die ganze
// Website). Oben rechts der Fleck der Startbildschirme mit Kreis und kleinem Ring, unten links der große Ring mit
// einem Kreis in Lavendel; darunter der Satz aus dem Fuß der Website (seit dem Nachtrag zu AP-23 der längere Satz mit
// Scanner und Einkaufsliste, deshalb in 33 statt 38 Pixel, damit links und rechts Rand bleibt). Alle Seiten außer den
// Rezeptseiten zeigen dieses Bild. Kein Rezeptbild, keine Anfrage ins Netz. Aufruf: node tools/teilen_bild.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';
import { seite } from '../src/daten/seite.mjs';
import { fuss } from '../src/daten/startseite.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const schrift = pathToFileURL(
  join(wurzel, 'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2'),
).href;
const logo = readFileSync(join(wurzel, 'src/inhalte/logo.svg'), 'utf8');
const { breite, hoehe } = seite.teilen;
// Farben der App: Indigo, tiefes Indigo, Lavendel, kräftigeres Lavendel.
const INDIGO = '#4a3fd1';
const INDIGO_TIEF = '#2a2277';
const LAVENDEL = '#efedff';
const LAVENDEL_DUNKEL = '#dedaff';
// Fleck der Startbildschirme (Ansichtsfeld 200 x 200), wie in der App und in der Kopfgrafik.
const FLECK = 'M40 40C70 5 150 0 180 40s20 110-20 140-120 20-140-20S10 75 40 40Z';

const html = `<!doctype html><html lang="de"><meta charset="utf-8"><style>
@font-face { font-family: "PJS"; src: url("${schrift}") format("woff2"); font-weight: 200 800; }
* { box-sizing: border-box; }
body { margin: 0; width: ${breite}px; height: ${hoehe}px; overflow: hidden; position: relative; background: ${INDIGO}; font-family: "PJS", sans-serif; }
.akzente { position: absolute; inset: 0; }
.mitte { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 34px; }
.logo svg { display: block; width: 620px; height: auto; }
.logo .wort { fill: #fff; }
.logo .schrift { fill: ${LAVENDEL_DUNKEL}; }
p { margin: 0; color: ${LAVENDEL}; font-size: 33px; font-weight: 500; letter-spacing: -.01em; }
</style><body>
<svg class="akzente" viewBox="0 0 ${breite} ${hoehe}" aria-hidden="true">
  <path d="${FLECK}" transform="translate(968 -178) scale(2.52)" fill="${INDIGO_TIEF}" fill-opacity=".55"/>
  <circle cx="1132" cy="100" r="98" fill="${LAVENDEL_DUNKEL}" fill-opacity=".24"/>
  <circle cx="1068" cy="62" r="20" fill="none" stroke="${LAVENDEL_DUNKEL}" stroke-width="9"/>
  <circle cx="22" cy="610" r="150" fill="none" stroke="${LAVENDEL}" stroke-opacity=".16" stroke-width="40"/>
  <circle cx="172" cy="566" r="28" fill="${LAVENDEL_DUNKEL}"/>
</svg>
<div class="mitte"><div class="logo">${logo}</div><p>${fuss.satz}</p></div>
</body></html>`;

const ordner = join(wurzel, 'public', dirname(seite.teilen.pfad));
mkdirSync(ordner, { recursive: true });
const vorlage = join(wurzel, '.astro', 'teilen_bild.html');
mkdirSync(dirname(vorlage), { recursive: true });
writeFileSync(vorlage, html, 'utf8');

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });
const blatt = await browser.newPage();
await blatt.setViewport({ width: breite, height: hoehe, deviceScaleFactor: 1 });
await blatt.goto(pathToFileURL(vorlage).href, { waitUntil: 'load' });
await blatt.evaluate(() => document.fonts.ready);
const ziel = join(wurzel, 'public', seite.teilen.pfad);
await blatt.screenshot({ path: ziel, type: 'jpeg', quality: 90 });
await browser.close();
console.log(`Geschrieben: ${ziel}`);
