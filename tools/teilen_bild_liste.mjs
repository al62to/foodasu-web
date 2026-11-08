// Baut das Bild zum Teilen der Seite für Listen /l/ (AP-112, Vorgabe 7a): public/bilder/liste-teilen.jpg, 1200 x 630.
// Die Vorschau in WhatsApp sieht den Teil hinter dem # nie; das Bild zeigt deshalb nichts aus einer Liste, nur Logo,
// den Satz aus src/daten/liste_seite.mjs (listeSeite.bild.satz, zwei Zeilen) und unten das Band mit den beiden
// offiziellen Abzeichen. Aufbau, Farben und Maße wie das gemeinsame Bild der Website ab AP-105/AP-106
// (tools/teilen_bild.mjs auf main, foodasu-teilen-2.jpg): Indigo mit den Akzenten der Startbildschirme, Logo 540 px
// breit, Satz zweizeilig mittig in höchstens 560 px, Band 100 px tief Indigo, Abzeichen sichtbar 48 px hoch
// (Apple zuerst, dazwischen ein Viertel der Höhe frei). Logo und Zeilen liegen ganz im mittigen Quadrat (Zuschnitt in
// WhatsApp, x 285 bis 915); das Skript misst sie im fertigen Bild und bricht ab, wenn etwas herausragt. Kein Bild aus
// dem Netz, keine Anfrage. Aufruf: node tools/teilen_bild_liste.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';
import { seite } from '../src/daten/seite.mjs';
import { listeSeite } from '../src/daten/liste_seite.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const schrift = pathToFileURL(
  join(wurzel, 'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2'),
).href;
const logo = readFileSync(join(wurzel, 'src/inhalte/logo.svg'), 'utf8');
const apple = pathToFileURL(join(wurzel, 'public/bilder/app-store-abzeichen-de.svg')).href;
const google = pathToFileURL(join(wurzel, 'public/bilder/google-play-abzeichen-de.png')).href;
const { breite, hoehe } = seite.teilen;
// Höhe des Bands wie seite.teilen.band auf main (AP-105).
const BAND = 100;
const INDIGO = '#4a3fd1';
const INDIGO_TIEF = '#2a2277';
const LAVENDEL = '#efedff';
const LAVENDEL_DUNKEL = '#dedaff';
const FLECK = 'M40 40C70 5 150 0 180 40s20 110-20 140-120 20-140-20S10 75 40 40Z';
const ABZEICHEN = 48;
const GOOGLE_HOEHE = (ABZEICHEN * 250) / 192;
const GOOGLE_RAND = (ABZEICHEN * 29) / 192;
const oben = hoehe - BAND;
const QUADRAT = { links: (breite - hoehe) / 2, rechts: (breite + hoehe) / 2 };
const SATZ_BREITE = 560;
const BEREICH = { links: (breite - SATZ_BREITE) / 2, rechts: (breite + SATZ_BREITE) / 2 };
const LOGO_GROSS = 540;
const zeilen = listeSeite.bild.satz;
if (zeilen.length !== 2) throw new Error('listeSeite.bild.satz: genau zwei Zeilen erwartet');
const html = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const seiteHtml = `<!doctype html><html lang="de"><meta charset="utf-8"><style>
@font-face { font-family: "PJS"; src: url("${schrift}") format("woff2"); font-weight: 200 800; }
* { box-sizing: border-box; }
body { margin: 0; overflow: hidden; position: relative; width: ${breite}px; height: ${hoehe}px; background: ${INDIGO}; font-family: "PJS", sans-serif; }
.akzente { position: absolute; left: 0; top: 0; width: ${breite}px; height: ${oben}px; }
.mitte { position: absolute; left: 0; right: 0; top: 0; height: ${oben}px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }
.logo svg { display: block; width: ${LOGO_GROSS}px; height: auto; }
.logo .wort { fill: #fff; }
.logo .schrift { fill: ${LAVENDEL_DUNKEL}; }
p { margin: 0; max-width: ${SATZ_BREITE}px; color: ${LAVENDEL}; font-size: 31px; line-height: 1.3; font-weight: 500; letter-spacing: -.01em; text-align: center; }
.band { position: absolute; left: 0; right: 0; bottom: 0; height: ${BAND}px; background: ${INDIGO_TIEF}; }
.abzeichen { position: absolute; left: 50%; top: 50%; translate: -50% -50%; display: flex; align-items: center; gap: ${ABZEICHEN / 4}px; }
.abzeichen img { display: block; }
.apple { height: ${ABZEICHEN}px; width: auto; }
.google { height: ${GOOGLE_HOEHE}px; width: auto; margin: ${-GOOGLE_RAND}px 0; }
</style><body>
<svg class="akzente" viewBox="0 0 ${breite} ${oben}" aria-hidden="true">
  <path d="${FLECK}" transform="translate(968 -178) scale(2.52)" fill="${INDIGO_TIEF}" fill-opacity=".55"/>
  <circle cx="1132" cy="100" r="98" fill="${LAVENDEL_DUNKEL}" fill-opacity=".24"/>
  <circle cx="1068" cy="62" r="20" fill="none" stroke="${LAVENDEL_DUNKEL}" stroke-width="9"/>
  <circle cx="22" cy="${oben - 20}" r="150" fill="none" stroke="${LAVENDEL}" stroke-opacity=".16" stroke-width="40"/>
  <circle cx="172" cy="${oben - 64}" r="28" fill="${LAVENDEL_DUNKEL}"/>
</svg>
<div class="mitte"><div class="logo">${logo}</div><p>${zeilen.map(html).join('<br>')}</p></div>
<div class="band"><div class="abzeichen"><img class="apple" src="${apple}" alt=""><img class="google" src="${google}" alt=""></div></div>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });
try {
  const vorlage = join(wurzel, '.astro', 'teilen_bild_liste.html');
  mkdirSync(dirname(vorlage), { recursive: true });
  writeFileSync(vorlage, seiteHtml, 'utf8');
  const blatt = await browser.newPage();
  await blatt.setViewport({ width: breite, height: hoehe, deviceScaleFactor: 1 });
  await blatt.goto(pathToFileURL(vorlage).href, { waitUntil: 'load' });
  await blatt.evaluate(() => document.fonts.ready);
  const m = await blatt.evaluate(() => {
    const kasten = (r) => ({ links: r.left, rechts: r.right, oben: r.top, unten: r.bottom });
    const bereich = document.createRange();
    bereich.selectNodeContents(document.querySelector('.mitte p'));
    const reihen = [];
    for (const r of bereich.getClientRects()) {
      const z = reihen.find((x) => Math.abs(x.oben - r.top) < 4);
      if (z) { z.links = Math.min(z.links, r.left); z.rechts = Math.max(z.rechts, r.right); } else reihen.push(kasten(r));
    }
    return { logo: kasten(document.querySelector('.logo svg').getBoundingClientRect()), reihen };
  });
  const fehler = [];
  if (m.reihen.length !== 2) fehler.push(`Satz hat ${m.reihen.length} statt 2 Zeilen`);
  for (const [name, k] of [['Logo', m.logo], ...m.reihen.map((z, i) => [`Zeile ${i + 1}`, z])]) {
    console.log(`${name}: x ${k.links.toFixed(1)} bis ${k.rechts.toFixed(1)}, y ${k.oben.toFixed(1)} bis ${k.unten.toFixed(1)}`);
    if (k.links < BEREICH.links || k.rechts > BEREICH.rechts) fehler.push(`${name} ragt aus x ${BEREICH.links} bis ${BEREICH.rechts}`);
    if (k.unten > oben) fehler.push(`${name} reicht ins Band`);
  }
  console.log(`Quadrat x ${QUADRAT.links} bis ${QUADRAT.rechts}, Bereich für Logo und Satz x ${BEREICH.links} bis ${BEREICH.rechts}`);
  if (fehler.length) throw new Error(fehler.join('; '));
  const ziel = join(wurzel, 'public', listeSeite.bild.pfad);
  mkdirSync(dirname(ziel), { recursive: true });
  await blatt.screenshot({ path: ziel, type: 'jpeg', quality: 90 });
  console.log(`Geschrieben: ${ziel}`);
} finally {
  await browser.close();
}
