// Baut das gemeinsame Bild für Open Graph und die Twitter-Karte (1200 x 630) nach public/bilder/foodasu-teilen-2.jpg
// (AP-18 Nachtrag Meta): Logo auf Indigo mit Akzenten in Indigo und Lavendel (seit AP-23 ohne Grün, wie die ganze
// Website). Oben rechts der Fleck der Startbildschirme mit Kreis und kleinem Ring, unten links der große Ring mit
// einem Kreis in Lavendel; darunter der Satz aus dem Fuß der Website (seit dem Nachtrag zu AP-23 der längere Satz mit
// Scanner und Einkaufsliste, deshalb in 33 statt 38 Pixel, damit links und rechts Rand bleibt; seit Nachtrag 2 der PL
// vom 14.10.2026 „Einkaufslisten-App und Lebensmittel-Scanner für den ganzen Haushalt.“). Alle Seiten außer den
// Rezeptseiten zeigen dieses Bild. Kein Rezeptbild, keine Anfrage ins Netz. Aufruf: node tools/teilen_bild.mjs
//
// Seit AP-105 (08.11.2026) unten ein schmales Band mit den zwei offiziellen Abzeichen, wie das Rezept-Teilen-Bild der
// App: zuerst „Laden im App Store“ (SVG unverändert von Apple), dann „Jetzt bei Google Play“ (PNG unverändert von
// Google), sichtbar gleich hoch (48 px; das Bild von Google hat oben und unten je 29 von 250 Pixeln durchsichtigen
// Rand), dazwischen ein Viertel der Höhe frei, waagrecht in der Mitte, damit sie beim Zuschnitt auf ein Quadrat
// (WhatsApp) sichtbar bleiben. Dasselbe Skript schreibt das Band für die Rezeptbilder (Indigo, links das weiße Logo
// so hoch wie die Abzeichen, ganz links, damit es im quadratischen Zuschnitt (x 285 bis 915) nicht angeschnitten wird)
// nach tools/vorlagen/teilen_band.png; tools/rezeptbilder_bauen.py setzt es unter das
// Gericht. Im gemeinsamen Bild steht das Logo schon groß darüber, das Band trägt dort nur die Abzeichen (tiefes Indigo).
// Neuer Dateiname (-teilen-2), damit Facebook und WhatsApp das Bild neu laden.
//
// Seit AP-106 (08.11.2026) stehen Logo und Satz ganz im mittigen Quadrat (WhatsApp, x 285 bis 915): Logo 540 statt
// 620 px breit, der Satz zweizeilig und mittig in höchstens 560 px (x 320 bis 880), Bruch nach „Lebensmittel-“, 31 px.
// Das Skript misst Logo und Zeilen im fertigen Bild und bricht ab, wenn etwas aus diesem Bereich ragt.
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
const apple = pathToFileURL(join(wurzel, 'public/bilder/app-store-abzeichen-de.svg')).href;
const google = pathToFileURL(join(wurzel, 'public/bilder/google-play-abzeichen-de.png')).href;
const { breite, hoehe, band: BAND } = seite.teilen;
// Farben der App: Indigo, tiefes Indigo, Lavendel, kräftigeres Lavendel.
const INDIGO = '#4a3fd1';
const INDIGO_TIEF = '#2a2277';
const LAVENDEL = '#efedff';
const LAVENDEL_DUNKEL = '#dedaff';
// Fleck der Startbildschirme (Ansichtsfeld 200 x 200), wie in der App und in der Kopfgrafik.
const FLECK = 'M40 40C70 5 150 0 180 40s20 110-20 140-120 20-140-20S10 75 40 40Z';
// Abzeichen: sichtbar 48 px hoch; Apple 119,66 x 40 im Original, Google 646 x 250 mit 29 px Rand oben und unten.
const ABZEICHEN = 48;
const GOOGLE_HOEHE = (ABZEICHEN * 250) / 192;
const GOOGLE_RAND = (ABZEICHEN * 29) / 192;
const LOGO_BREITE = (ABZEICHEN * 546.6) / 114.37;

const stil = `@font-face { font-family: "PJS"; src: url("${schrift}") format("woff2"); font-weight: 200 800; }
* { box-sizing: border-box; }
body { margin: 0; overflow: hidden; position: relative; font-family: "PJS", sans-serif; }
.band { position: absolute; left: 0; right: 0; bottom: 0; height: ${BAND}px; }
.abzeichen { position: absolute; left: 50%; top: 50%; translate: -50% -50%; display: flex; align-items: center; gap: ${ABZEICHEN / 4}px; }
.abzeichen img { display: block; }
.apple { height: ${ABZEICHEN}px; width: auto; }
.google { height: ${GOOGLE_HOEHE}px; width: auto; margin: ${-GOOGLE_RAND}px 0; }
.band-logo { position: absolute; left: 36px; top: 50%; translate: 0 -50%; }
.band-logo svg { display: block; width: ${LOGO_BREITE}px; height: auto; }
.band-logo .wort, .band-logo .schrift { fill: #fff; }`;
const abzeichen = `<div class="abzeichen"><img class="apple" src="${apple}" alt=""><img class="google" src="${google}" alt=""></div>`;

// Band für die Rezeptbilder (nur das Band, 1200 x BAND).
const bandHtml = `<!doctype html><html lang="de"><meta charset="utf-8"><style>${stil}
body { width: ${breite}px; height: ${BAND}px; }
.band { background: ${INDIGO}; }
</style><body><div class="band"><div class="band-logo">${logo}</div>${abzeichen}</div></body></html>`;

// Gemeinsames Bild: das bisherige Bild in der Fläche über dem Band, unten das Band mit den Abzeichen.
const oben = hoehe - BAND;
// Mittiges Quadrat (WhatsApp) und der Bereich darin für Logo und Satz (AP-106).
const QUADRAT = { links: (breite - hoehe) / 2, rechts: (breite + hoehe) / 2 };
const SATZ_BREITE = 560;
const BEREICH = { links: (breite - SATZ_BREITE) / 2, rechts: (breite + SATZ_BREITE) / 2 };
const LOGO_GROSS = 540;
const BRUCH = 'Lebensmittel-';
if (fuss.satz.split(BRUCH).length !== 2) throw new Error(`Satz im Fuß ohne genau ein „${BRUCH}“: Bruch neu setzen`);
const satzZweizeilig = fuss.satz.replace(BRUCH, `${BRUCH}<br>`);
const html = `<!doctype html><html lang="de"><meta charset="utf-8"><style>${stil}
body { width: ${breite}px; height: ${hoehe}px; background: ${INDIGO}; }
.akzente { position: absolute; left: 0; top: 0; width: ${breite}px; height: ${oben}px; }
.mitte { position: absolute; left: 0; right: 0; top: 0; height: ${oben}px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }
.logo svg { display: block; width: ${LOGO_GROSS}px; height: auto; }
.logo .wort { fill: #fff; }
.logo .schrift { fill: ${LAVENDEL_DUNKEL}; }
p { margin: 0; max-width: ${SATZ_BREITE}px; color: ${LAVENDEL}; font-size: 31px; line-height: 1.3; font-weight: 500; letter-spacing: -.01em; text-align: center; }
.band { background: ${INDIGO_TIEF}; }
</style><body>
<svg class="akzente" viewBox="0 0 ${breite} ${oben}" aria-hidden="true">
  <path d="${FLECK}" transform="translate(968 -178) scale(2.52)" fill="${INDIGO_TIEF}" fill-opacity=".55"/>
  <circle cx="1132" cy="100" r="98" fill="${LAVENDEL_DUNKEL}" fill-opacity=".24"/>
  <circle cx="1068" cy="62" r="20" fill="none" stroke="${LAVENDEL_DUNKEL}" stroke-width="9"/>
  <circle cx="22" cy="${oben - 20}" r="150" fill="none" stroke="${LAVENDEL}" stroke-opacity=".16" stroke-width="40"/>
  <circle cx="172" cy="${oben - 64}" r="28" fill="${LAVENDEL_DUNKEL}"/>
</svg>
<div class="mitte"><div class="logo">${logo}</div><p>${satzZweizeilig}</p></div>
<div class="band">${abzeichen}</div>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });
async function aufnehmen(inhalt, name, groesse, ziel, art, pruefen) {
  const vorlage = join(wurzel, '.astro', name);
  mkdirSync(dirname(vorlage), { recursive: true });
  writeFileSync(vorlage, inhalt, 'utf8');
  const blatt = await browser.newPage();
  await blatt.setViewport({ ...groesse, deviceScaleFactor: 1 });
  await blatt.goto(pathToFileURL(vorlage).href, { waitUntil: 'load' });
  await blatt.evaluate(() => document.fonts.ready);
  if (pruefen) await pruefen(blatt);
  mkdirSync(dirname(ziel), { recursive: true });
  await blatt.screenshot({ path: ziel, ...(art === 'jpeg' ? { type: 'jpeg', quality: 90 } : { type: 'png' }) });
  await blatt.close();
  console.log(`Geschrieben: ${ziel}`);
}
await aufnehmen(bandHtml, 'teilen_band.html', { width: breite, height: BAND }, join(wurzel, 'tools', 'vorlagen', 'teilen_band.png'), 'png');
// Logo und jede Zeile des Satzes müssen ganz im Bereich liegen, der Satz genau zwei Zeilen haben.
async function imQuadrat(blatt) {
  const m = await blatt.evaluate(() => {
    const kasten = (r) => ({ links: r.left, rechts: r.right, oben: r.top, unten: r.bottom });
    const logo = kasten(document.querySelector('.logo svg').getBoundingClientRect());
    const bereich = document.createRange();
    bereich.selectNodeContents(document.querySelector('.mitte p'));
    const zeilen = [];
    for (const r of bereich.getClientRects()) {
      const z = zeilen.find((x) => Math.abs(x.oben - r.top) < 4);
      if (z) { z.links = Math.min(z.links, r.left); z.rechts = Math.max(z.rechts, r.right); } else zeilen.push(kasten(r));
    }
    return { logo, zeilen };
  });
  const fehler = [];
  if (m.zeilen.length !== 2) fehler.push(`Satz hat ${m.zeilen.length} statt 2 Zeilen`);
  for (const [name, k] of [['Logo', m.logo], ...m.zeilen.map((z, i) => [`Zeile ${i + 1}`, z])]) {
    console.log(`${name}: x ${k.links.toFixed(1)} bis ${k.rechts.toFixed(1)}, y ${k.oben.toFixed(1)} bis ${k.unten.toFixed(1)}`);
    if (k.links < BEREICH.links || k.rechts > BEREICH.rechts) fehler.push(`${name} ragt aus x ${BEREICH.links} bis ${BEREICH.rechts}`);
    if (k.unten > oben) fehler.push(`${name} reicht ins Band`);
  }
  console.log(`Quadrat x ${QUADRAT.links} bis ${QUADRAT.rechts}, Bereich für Logo und Satz x ${BEREICH.links} bis ${BEREICH.rechts}`);
  if (fehler.length) throw new Error(fehler.join('; '));
}
await aufnehmen(html, 'teilen_bild.html', { width: breite, height: hoehe }, join(wurzel, 'public', seite.teilen.pfad), 'jpeg', imQuadrat);
await browser.close();
