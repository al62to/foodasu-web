// Baut alle Symbole der Website aus der Vorlage des App-Symbols (AP-88: Figur im Scan-Rahmen auf Indigo, wie das
// App-Symbol am iPhone und unter Android; vorher der Einkaufswagen):
// - public/favicon.svg: die Zeichnung der Vorlage unverändert, nur die Fläche mit runden Ecken wie bisher (Radius 2/9
//   der Seite); Metadaten und Namensräume der Vorlage fallen weg.
// - public/favicon.ico mit 16, 32 und 48 Pixeln aus favicon.svg (Nachtrag zu AP-23 Teil C): Manche Dienste und ältere
//   Programme fragen nur nach /favicon.ico und lesen die Angaben im Kopf der Seite nicht. Jede Größe wird für sich aus
//   der Vektorgrafik gezeichnet (nicht verkleinert) und als PNG in die ICO-Datei gelegt.
// - public/favicon-32.png (32 x 32) und public/apple-touch-icon.png (180 x 180): volle Fläche ohne Transparenz wie
//   bisher; die Ecken rundet das Gerät. apple-touch-icon.png ist auch Logo der Organisation und Bild der App in den
//   strukturierten Daten.
// Keine Anfrage ins Netz. Aufruf: node tools/favicon_bauen.mjs [Vorlage]
// Vorlage ohne Angabe: ~/Projekte/FoodAsu/Material/grafiken/symbol_figur/C1_fein.svg (1024 x 1024).
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const vorlagePfad = process.argv[2] ?? join(homedir(), 'Projekte/FoodAsu/Material/grafiken/symbol_figur/C1_fein.svg');
const ICO = [16, 32, 48];
const SEITE = 1024;
const RADIUS = Math.round((SEITE * 2) / 9);

// Vorlage lesen: ohne Metadaten und ohne fremde Namensräume; die erste Fläche ist der Hintergrund in voller Größe.
const vorlage = readFileSync(vorlagePfad, 'utf8')
  .replace(/<metadata>[\s\S]*?<\/metadata>/g, '')
  .replace(/\s+xmlns:[a-z0-9]+="[^"]*"/gi, '')
  .trim();
const kopf = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SEITE} ${SEITE}">`;
const flaeche = `<rect width="${SEITE}" height="${SEITE}" fill="#4A3FD1"/>`;
if (!vorlage.startsWith(kopf + flaeche)) throw new Error(`Vorlage ${vorlagePfad}: unerwarteter Anfang, Werkzeug anpassen`);
if (/<metadata|c2pa|<!--/i.test(vorlage)) throw new Error('Vorlage: Metadaten oder Kommentar übrig');
const gerundet = vorlage.replace(flaeche, `<rect width="${SEITE}" height="${SEITE}" rx="${RADIUS}" fill="#4A3FD1"/>`);
writeFileSync(join(wurzel, 'public', 'favicon.svg'), gerundet + '\n', 'utf8');

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });
const blatt = await browser.newPage();
async function zeichne(svg, groesse, durchsichtig) {
  await blatt.setViewport({ width: groesse, height: groesse, deviceScaleFactor: 1 });
  const html = `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${groesse}px;height:${groesse}px}</style>${svg}`;
  await blatt.setContent(html, { waitUntil: 'load' });
  return Buffer.from(await blatt.screenshot({ type: 'png', omitBackground: durchsichtig }));
}
const bilder = [];
for (const groesse of ICO) bilder.push(await zeichne(gerundet, groesse, true));
writeFileSync(join(wurzel, 'public', 'favicon-32.png'), await zeichne(vorlage, 32, false));
writeFileSync(join(wurzel, 'public', 'apple-touch-icon.png'), await zeichne(vorlage, 180, false));
await browser.close();

// Aufbau einer ICO-Datei: Kopf (6 Byte), je Bild ein Eintrag (16 Byte), danach die Bilder.
const icoKopf = Buffer.alloc(6);
icoKopf.writeUInt16LE(0, 0);
icoKopf.writeUInt16LE(1, 2);
icoKopf.writeUInt16LE(bilder.length, 4);
let ort = icoKopf.length + 16 * bilder.length;
const eintraege = bilder.map((bild, nummer) => {
  const eintrag = Buffer.alloc(16);
  eintrag.writeUInt8(ICO[nummer], 0);
  eintrag.writeUInt8(ICO[nummer], 1);
  eintrag.writeUInt16LE(1, 4);
  eintrag.writeUInt16LE(32, 6);
  eintrag.writeUInt32LE(bild.length, 8);
  eintrag.writeUInt32LE(ort, 12);
  ort += bild.length;
  return eintrag;
});
writeFileSync(join(wurzel, 'public', 'favicon.ico'), Buffer.concat([icoKopf, ...eintraege, ...bilder]));
console.log(`Aus ${vorlagePfad}: favicon.svg, favicon.ico (${ICO.join(', ')} Pixel, ${ort} Byte), favicon-32.png, apple-touch-icon.png (180)`);
