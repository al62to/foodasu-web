// Baut public/favicon.ico mit 16, 32 und 48 Pixeln aus public/favicon.svg (Nachtrag zu AP-23 Teil C): Manche Dienste
// und ältere Programme fragen nur nach /favicon.ico und lesen die Angaben im Kopf der Seite nicht; die Search Console
// meldete dafür 404. Jede Größe wird für sich aus der Vektorgrafik gezeichnet (nicht verkleinert) und als PNG in die
// ICO-Datei gelegt. Die Angaben im Kopf (favicon.svg, favicon-32.png) bleiben. Keine Anfrage ins Netz.
// Aufruf: node tools/favicon_bauen.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const quelle = pathToFileURL(join(wurzel, 'public', 'favicon.svg')).href;
const GROESSEN = [16, 32, 48];

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });
const blatt = await browser.newPage();
const bilder = [];
for (const groesse of GROESSEN) {
  await blatt.setViewport({ width: groesse, height: groesse, deviceScaleFactor: 1 });
  await blatt.goto(quelle, { waitUntil: 'load' });
  bilder.push(Buffer.from(await blatt.screenshot({ type: 'png', omitBackground: true })));
}
await browser.close();

// Aufbau einer ICO-Datei: Kopf (6 Byte), je Bild ein Eintrag (16 Byte), danach die Bilder.
const kopf = Buffer.alloc(6);
kopf.writeUInt16LE(0, 0);
kopf.writeUInt16LE(1, 2);
kopf.writeUInt16LE(bilder.length, 4);
let ort = kopf.length + 16 * bilder.length;
const eintraege = bilder.map((bild, nummer) => {
  const eintrag = Buffer.alloc(16);
  eintrag.writeUInt8(GROESSEN[nummer], 0);
  eintrag.writeUInt8(GROESSEN[nummer], 1);
  eintrag.writeUInt16LE(1, 4);
  eintrag.writeUInt16LE(32, 6);
  eintrag.writeUInt32LE(bild.length, 8);
  eintrag.writeUInt32LE(ort, 12);
  ort += bild.length;
  return eintrag;
});
const ziel = join(wurzel, 'public', 'favicon.ico');
writeFileSync(ziel, Buffer.concat([kopf, ...eintraege, ...bilder]));
console.log(`Geschrieben: ${ziel} (${GROESSEN.join(', ')} Pixel, ${ort} Byte)`);
