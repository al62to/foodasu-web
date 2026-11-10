// Ende zu Ende, Teil Browser (AP-112): öffnet einen Listen-Link (vom Kern der App erzeugt) in der lokalen Vorschau
// der Seite /l/, hakt die genannten Einträge ab (und setzt die mit --nicht genannten auf „nicht bekommen“), löst
// „Häkchen zurückschicken“ aus und gibt den Häkchen-Link https://foodasu.com/l/#… aus. Den Link führt danach der Kern
// mit seinem Stand zusammen.
// Aufruf: node tools/teilen_ende_zu_ende.mjs <Basis> <Link> <Kennungen,durch,Komma> [--nicht <Kennungen>] [--name Mama]
//   <Basis>  Adresse der lokalen Vorschau, z. B. http://127.0.0.1:4321
//   <Link>   https://foodasu.com/l/#1… (oder nur der Teil hinter dem #)
// Ausgabe: eine Zeile JSON mit Nachricht und Link, in der letzten Zeile nur der Häkchen-Link. Rückgabewert 1 bei Fehler.
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';
import { fremdeAppsSperren } from './fremde_apps_sperre.mjs';
import { lesen } from '../src/skripte/teilen/kodierung.mjs';

const argumente = process.argv.slice(2);
const wert = (name) => { const stelle = argumente.indexOf(name); return stelle >= 0 ? argumente.splice(stelle, 2)[1] : null; };
const nicht = (wert('--nicht') ?? '').split(',').filter(Boolean);
const name = wert('--name') ?? 'Mama';
const [basisRoh, linkRoh, kennungenRoh = ''] = argumente;
if (!basisRoh || !linkRoh) {
  console.error('Aufruf: node tools/teilen_ende_zu_ende.mjs <Basis> <Link> <Kennungen,durch,Komma> [--nicht <Kennungen>] [--name Mama]');
  process.exit(2);
}
const basis = basisRoh.replace(/\/$/, '');
const kodierung = linkRoh.includes('#') ? linkRoh.slice(linkRoh.indexOf('#') + 1) : linkRoh;
const kennungen = kennungenRoh.split(',').filter(Boolean);

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });
let ende = 0;
try {
  const umgebung = await browser.createBrowserContext();
  const seite = await umgebung.newPage();
  await fremdeAppsSperren(seite); // nie fremde Apps am Mac (AP-122c)
  const fehler = [];
  seite.on('pageerror', (f) => fehler.push(f.message));
  await seite.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  // Das Teilen-Menü des Geräts gibt es im Browser ohne Fenster nicht: navigator.share merkt sich nur den Text.
  await seite.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (daten) => { window.__geteilt = daten.text; } });
  });
  await seite.goto(`${basis}/l/#${kodierung}`, { waitUntil: 'networkidle0' });
  await seite.waitForSelector('[data-l-seite][data-bereit]', { timeout: 10000 });
  if (!(await seite.$('[data-l-liste]:not([hidden])'))) throw new Error(`Keine Liste: ${await seite.$eval('[data-l-titel]', (e) => e.textContent)}`);
  for (const id of kennungen) {
    const knopf = await seite.$(`[data-id="${id}"] [data-art="haken"]`);
    if (!knopf) throw new Error(`Eintrag ${id} nicht auf der Seite (oder gestrichen)`);
    if ((await seite.$eval(`[data-id="${id}"]`, (e) => e.dataset.status)) !== 'd') await knopf.click();
  }
  for (const id of nicht) {
    if ((await seite.$eval(`[data-id="${id}"]`, (e) => e.dataset.status).catch(() => null)) === null) throw new Error(`Eintrag ${id} nicht auf der Seite`);
    if ((await seite.$eval(`[data-id="${id}"]`, (e) => e.dataset.status)) !== 'x') await seite.click(`[data-id="${id}"] [data-art="nicht"]`);
  }
  // Seit AP-122 öffnet der Hauptknopf WhatsApp; das Teilen-Fenster (hier abgefangen) über „Andere App wählen“.
  await seite.click('[data-l-andere]');
  if (await seite.$('[data-l-name]:not([hidden])')) {
    await seite.type('[data-l-name-feld]', name);
    await seite.click('[data-l-name] button[type="submit"]');
  }
  await seite.waitForFunction(() => window.__geteilt !== undefined, { timeout: 10000 });
  const geteilt = await seite.evaluate(() => window.__geteilt);
  const [nachricht, link] = geteilt.split('\n');
  const gelesen = await lesen(link.slice(link.indexOf('#') + 1));
  if (!gelesen.umschlag || gelesen.umschlag.k !== 'h') throw new Error(`Häkchen-Link nicht lesbar: ${JSON.stringify(gelesen)}`);
  if (fehler.length) throw new Error(`Fehler auf der Seite: ${fehler.join('; ')}`);
  console.log(JSON.stringify({ nachricht, zeichen: link.length, umschlag: gelesen.umschlag }));
  console.log(link);
  await umgebung.close();
} catch (fehler) {
  console.error(`FEHLER ${fehler.message}`);
  ende = 1;
} finally {
  await browser.close();
}
process.exit(ende);
