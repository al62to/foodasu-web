// Nimmt Seiten der lokalen Vorschau als Bild auf, je Breite und Farbschema. Für die Bildschirmfotos der Berichte.
// Aufruf: node tools/aufnahmen.mjs <Zielordner> <Adresse der Vorschau> <Pfad>[=Name] ... [--breiten 390,1440]
//         [--schemata light,dark] [--oben] (nur der erste Bildschirm statt der ganzen Seite)
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';

const [ziel, vorschau, ...rest] = process.argv.slice(2);
const wahl = { breiten: [390, 1440], schemata: ['light', 'dark'], oben: false, pfade: [] };
for (let nummer = 0; nummer < rest.length; nummer++) {
  if (rest[nummer] === '--breiten') wahl.breiten = rest[++nummer].split(',').map(Number);
  else if (rest[nummer] === '--schemata') wahl.schemata = rest[++nummer].split(',');
  else if (rest[nummer] === '--oben') wahl.oben = true;
  else wahl.pfade.push(rest[nummer]);
}
mkdirSync(ziel, { recursive: true });

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });
try {
  for (const eintrag of wahl.pfade) {
    const [pfad, name = pfad.replace(/^\/|\/$/g, '').replace(/[/.]/g, '_') || 'start'] = eintrag.split('=');
    for (const breite of wahl.breiten) {
      for (const schema of wahl.schemata) {
        const seite = await browser.newPage();
        await seite.setViewport({ width: breite, height: breite < 700 ? 844 : 900, deviceScaleFactor: breite < 700 ? 2 : 1 });
        // Ohne Bewegung: Die Aufnahme zeigt den Ruhezustand, alles ist eingeblendet.
        await seite.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: schema }, { name: 'prefers-reduced-motion', value: 'reduce' }]);
        const antwort = await seite.goto(vorschau + pfad, { waitUntil: 'networkidle0' });
        // Verzögert geladene Bilder holen: einmal durch die Seite laufen.
        await seite.evaluate(async () => {
          for (let ort = 0; ort < document.body.scrollHeight; ort += 600) { window.scrollTo(0, ort); await new Promise((weiter) => setTimeout(weiter, 60)); }
          window.scrollTo(0, 0);
          await Promise.all([...document.images].map((bild) => (bild.complete ? null : new Promise((weiter) => { bild.onload = bild.onerror = weiter; }))));
        });
        const datei = join(ziel, `${name}_${breite}_${schema === 'light' ? 'hell' : 'dunkel'}.png`);
        await seite.screenshot({ path: datei, fullPage: !wahl.oben });
        console.log(`${antwort.status()} ${pfad} ${breite} ${schema} -> ${datei}`);
        await seite.close();
      }
    }
  }
} finally {
  await browser.close();
}
