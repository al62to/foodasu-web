// Baut das Bild für Open Graph und die Twitter-Karte (1200 x 630) nach public/bilder/foodasu-teilen.jpg:
// Schriftzug, Überschrift der Startseite und die schwebenden Begriffe, alles aus den Daten der Seite. Kein Rezeptbild,
// keine Anfrage ins Netz. Aufruf: node tools/teilen_bild.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';
import { seite } from '../src/daten/seite.mjs';
import { kopf } from '../src/daten/startseite.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const schrift = pathToFileURL(
  join(wurzel, 'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2'),
).href;
const logo = readFileSync(join(wurzel, 'src/inhalte/logo.svg'), 'utf8');
const orte = ['left:700px;top:120px', 'left:930px;top:210px', 'left:740px;top:330px', 'left:960px;top:440px'];
const farben = ['#e8b04b', '#4a3fd1', '#9a8cff', '#2a2277'];

const html = `<!doctype html><html lang="de"><meta charset="utf-8"><style>
@font-face { font-family: "PJS"; src: url("${schrift}") format("woff2"); font-weight: 200 800; }
* { box-sizing: border-box; }
body { margin: 0; width: ${seite.teilen.breite}px; height: ${seite.teilen.hoehe}px; overflow: hidden; position: relative; background: #16123f; color: #fff; font-family: "PJS", sans-serif; }
.f { position: absolute; border-radius: 50%; }
.a { left: -160px; top: -220px; width: 900px; height: 800px; background: radial-gradient(closest-side, rgba(74,63,209,.9), rgba(74,63,209,0)); }
.b { right: -120px; top: -60px; width: 640px; height: 560px; background: radial-gradient(closest-side, rgba(123,108,255,.45), rgba(123,108,255,0)); }
.c { right: 120px; bottom: -220px; width: 520px; height: 480px; background: radial-gradient(closest-side, rgba(63,191,143,.3), rgba(63,191,143,0)); }
.logo { position: absolute; left: 72px; top: 64px; }
.logo svg { display: block; height: 58px; width: auto; }
.logo .wort { fill: #fff; }
.logo .schrift { fill: #b8f0d2; }
h1 { position: absolute; left: 72px; bottom: 76px; margin: 0; width: 640px; font-size: 132px; font-weight: 800; line-height: .97; letter-spacing: -.045em; }
h1 em { position: relative; z-index: 0; font-style: normal; color: #b8f0d2; white-space: nowrap; }
h1 em::after { content: ""; position: absolute; z-index: -1; left: 0; right: 0; bottom: .06em; height: .16em; border-radius: 8px; background: #1f6f54; }
.m { position: absolute; display: flex; gap: 12px; align-items: center; padding: 16px 26px; border-radius: 999px; background: #fff; color: #1a1a24; font-size: 30px; font-weight: 700; box-shadow: 0 24px 50px -24px rgba(0,0,0,.6); }
.m i { width: 16px; height: 16px; border-radius: 50%; }
</style><body>
<div class="f a"></div><div class="f b"></div><div class="f c"></div>
<div class="logo">${logo}</div>
<h1>${kopf.ueberschrift[0]}<em>${kopf.ueberschrift[1]}</em>${kopf.ueberschrift[2]}</h1>
${kopf.begriffe.map((begriff, nummer) => `<div class="m" style="${orte[nummer]}"><i style="background:${farben[nummer]}"></i>${begriff}</div>`).join('\n')}
</body></html>`;

const ordner = join(wurzel, 'public', dirname(seite.teilen.pfad));
mkdirSync(ordner, { recursive: true });
const vorlage = join(wurzel, '.astro', 'teilen_bild.html');
mkdirSync(dirname(vorlage), { recursive: true });
writeFileSync(vorlage, html, 'utf8');

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });
const blatt = await browser.newPage();
await blatt.setViewport({ width: seite.teilen.breite, height: seite.teilen.hoehe, deviceScaleFactor: 1 });
await blatt.goto(pathToFileURL(vorlage).href, { waitUntil: 'load' });
await blatt.evaluate(() => document.fonts.ready);
const ziel = join(wurzel, 'public', seite.teilen.pfad);
await blatt.screenshot({ path: ziel, type: 'jpeg', quality: 88 });
await browser.close();
console.log(`Geschrieben: ${ziel}`);
